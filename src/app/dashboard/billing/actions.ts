'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { planChangeSchema } from '@/lib/validations/billing';
import { createPayment } from '@/lib/payments/iraqpay';
import { getAdapter } from '@/lib/delivery/registry';

export interface BillingActionState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
}

async function getCtx() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!membership) redirect('/login');
  return {
    supabase,
    tenantId: membership.tenant_id,
    role: membership.role,
    userId: user.id,
  };
}

function toFieldErrors(errors: Record<string, string[] | undefined>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(errors)) if (v && v.length) out[k] = v;
  return out;
}

// ============================================
// Plan change (upgrade / downgrade)
// ============================================

export async function changePlanAction(
  _prev: BillingActionState,
  formData: FormData
): Promise<BillingActionState> {
  const { supabase, tenantId, role, userId } = await getCtx();
  if (role !== 'owner') {
    return { error: 'فقط مالك المتجر يمكنه تغيير الخطة' };
  }

  const raw = {
    planId: formData.get('planId'),
    interval: formData.get('interval') ?? 'month',
    paymentMethod: formData.get('paymentMethod') ?? undefined,
  };

  const parsed = planChangeSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const { planId, interval, paymentMethod } = parsed.data;

  // Fetch current tenant + subscription + new plan
  const [{ data: tenant }, { data: currentSub }, { data: newPlan }] = await Promise.all([
    supabase.from('tenants').select('id, name, plan_id').eq('id', tenantId).single(),
    supabase
      .from('subscriptions')
      .select('id, plan_id, status, current_period_start, current_period_end, billing_interval')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('subscription_plans')
      .select('id, name_ar, slug, price_usd, interval, trial_days')
      .eq('id', planId)
      .eq('is_active', true)
      .single(),
  ]);

  if (!tenant || !newPlan) return { error: 'الخطة غير متاحة' };

  // Already on this plan?
  if (tenant.plan_id === planId) {
    return { error: 'أنت مشترك في هذه الخطة بالفعل' };
  }

  const price = newPlan.price_usd;
  const isDowngrade = price === 0 || (await isDowngradeFrom(supabase, tenant.plan_id!, planId));
  const isFreeUpgrade = price === 0;

  // Free plan — immediate activation
  if (isFreeUpgrade) {
    await applyPlanChange(supabase, {
      tenantId,
      fromPlanId: tenant.plan_id,
      toPlanId: planId,
      subscriptionId: currentSub?.id ?? null,
      interval,
    });
    await supabase.rpc('provision_usage_counters', {
      p_tenant_id: tenantId,
      p_plan_id: planId,
    });

    revalidatePath('/dashboard/billing');
    return { success: `تم التحويل إلى خطة ${newPlan.name_ar}` };
  }

  // Paid plan — requires payment
  if (!paymentMethod) {
    return { error: 'اختر طريقة دفع لإتمام الاشتراك' };
  }

  // Compute amount based on interval
  const months = interval === 'year' ? 12 : 1;
  const yearlyDiscount = interval === 'year' ? 0.8 : 1; // 20% off annual
  const amountUsd = price * months * yearlyDiscount;
  const amountIqd = Math.round(amountUsd * Number(process.env.USD_IQD_RATE ?? 1480));

  // Create pending invoice first
  const { data: invoice, error: invErr } = await supabase
    .from('invoices')
    .insert({
      tenant_id: tenantId,
      subscription_id: currentSub?.id ?? null,
      invoice_number: `INV-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      amount_usd: amountUsd,
      subtotal_usd: amountUsd,
      status: 'pending',
      payment_method: paymentMethod,
      period_start: new Date().toISOString(),
      period_end: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: `ترقية إلى خطة ${newPlan.name_ar} (${interval === 'year' ? 'سنوي' : 'شهري'})`,
    })
    .select('id, invoice_number')
    .single();

  if (invErr || !invoice) return { error: 'تعذر إنشاء الفاتورة' };

  // Log billing event
  await supabase.from('billing_events').insert({
    tenant_id: tenantId,
    event_type: 'plan.change.initiated',
    subscription_id: currentSub?.id ?? null,
    invoice_id: invoice.id,
    from_plan_id: tenant.plan_id,
    to_plan_id: planId,
    amount_usd: amountUsd,
    metadata: { interval, paymentMethod, isDowngrade },
  });

  // Create payment session
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  try {
    const payment = await createPayment({
      gateway: paymentMethod,
      amount: amountIqd,
      orderId: invoice.id,
      description: `اشتراك ${newPlan.name_ar} — ${invoice.invoice_number}`,
      callbackUrl: `${origin}/api/billing/callback?invoice_id=${invoice.id}&plan_id=${planId}&interval=${interval}`,
    });

    // Link payment id to invoice
    await supabase
      .from('invoices')
      .update({ external_payment_id: payment.id })
      .eq('id', invoice.id);

    if (payment.redirectUrl) {
      redirect(payment.redirectUrl);
    }
    redirect(`/dashboard/billing/invoice/${invoice.id}/pay?paymentId=${payment.id}`);
  } catch (err) {
    await supabase
      .from('invoices')
      .update({ status: 'failed' })
      .eq('id', invoice.id);
    return { error: 'تعذر بدء عملية الدفع، حاول مرة أخرى' };
  }
}

async function isDowngradeFrom(
  supabase: Awaited<ReturnType<typeof createClient>>,
  fromPlanId: string,
  toPlanId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('subscription_plans')
    .select('id, price_usd')
    .in('id', [fromPlanId, toPlanId]);

  const from = data?.find((p) => p.id === fromPlanId);
  const to = data?.find((p) => p.id === toPlanId);
  if (!from || !to) return false;
  return Number(to.price_usd) < Number(from.price_usd);
}

async function applyPlanChange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: {
    tenantId: string;
    fromPlanId: string | null;
    toPlanId: string;
    subscriptionId: string | null;
    interval: 'month' | 'year';
  }
) {
  const periodEnd = new Date(
    Date.now() + (input.interval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000
  ).toISOString();

  // Update tenant's plan
  await supabase
    .from('tenants')
    .update({ plan_id: input.toPlanId })
    .eq('id', input.tenantId);

  // Update or create subscription
  if (input.subscriptionId) {
    await supabase
      .from('subscriptions')
      .update({
        plan_id: input.toPlanId,
        status: 'active',
        billing_interval: input.interval,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd,
        cancel_at_period_end: false,
      })
      .eq('id', input.subscriptionId);
  } else {
    await supabase.from('subscriptions').insert({
      tenant_id: input.tenantId,
      plan_id: input.toPlanId,
      status: 'active',
      billing_interval: input.interval,
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd,
    });
  }

  await supabase.from('billing_events').insert({
    tenant_id: input.tenantId,
    event_type: 'plan.changed',
    subscription_id: input.subscriptionId,
    from_plan_id: input.fromPlanId,
    to_plan_id: input.toPlanId,
    metadata: { interval: input.interval },
  });
}

// ============================================
// Cancel subscription
// ============================================

export async function cancelSubscriptionAction(
  _prev: BillingActionState,
  formData: FormData
): Promise<BillingActionState> {
  const { supabase, tenantId, role } = await getCtx();
  if (role !== 'owner') return { error: 'فقط المالك يمكنه الإلغاء' };

  const immediate = formData.get('immediate') === 'on';

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, plan_id, current_period_end')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub) return { error: 'لا يوجد اشتراك نشط' };

  if (immediate) {
    // Downgrade to Free immediately
    const { data: freePlan } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('slug', 'free')
      .single();

    if (!freePlan) return { error: 'خطأ في النظام' };

    await applyPlanChange(supabase, {
      tenantId,
      fromPlanId: sub.plan_id,
      toPlanId: freePlan.id,
      subscriptionId: sub.id,
      interval: 'month',
    });
    await supabase.rpc('provision_usage_counters', {
      p_tenant_id: tenantId,
      p_plan_id: freePlan.id,
    });

    await supabase
      .from('subscriptions')
      .update({ status: 'canceled', canceled_at: new Date().toISOString() })
      .eq('id', sub.id);
  } else {
    // Cancel at period end
    await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('id', sub.id);
  }

  await supabase.from('billing_events').insert({
    tenant_id: tenantId,
    event_type: immediate ? 'subscription.canceled.immediate' : 'subscription.cancel_at_period_end',
    subscription_id: sub.id,
    metadata: { immediate },
  });

  revalidatePath('/dashboard/billing');
  return {
    success: immediate
      ? 'تم إلغاء الاشتراك وتحويلك للخطة المجانية'
      : 'سيتم إلغاء الاشتراك في نهاية الفترة الحالية',
  };
}

// ============================================
// Reactivate canceled subscription
// ============================================

export async function reactivateSubscriptionAction(): Promise<BillingActionState> {
  const { supabase, tenantId, role } = await getCtx();
  if (role !== 'owner') return { error: 'صلاحيات غير كافية' };

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, status, cancel_at_period_end, current_period_end')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub) return { error: 'لا يوجد اشتراك' };

  await supabase
    .from('subscriptions')
    .update({ cancel_at_period_end: false, status: 'active' })
    .eq('id', sub.id);

  await supabase.from('billing_events').insert({
    tenant_id: tenantId,
    event_type: 'subscription.reactivated',
    subscription_id: sub.id,
  });

  revalidatePath('/dashboard/billing');
  return { success: 'تم إعادة تفعيل الاشتراك' };
}

// ============================================
// Entitlement check helper (used by other actions)
// ============================================

export async function checkFeatureAccess(
  tenantId: string,
  featureKey: string
): Promise<{ allowed: boolean; limit: number | null; current: number }> {
  const supabase = await createClient();

  const { data: limitRow } = await supabase
    .from('plan_entitlements')
    .select('limit_value, is_enabled, subscription_plans!inner(tenants!inner(id))')
    .eq('subscription_plans.tenants.id', tenantId)
    .eq('feature_key', featureKey)
    .maybeSingle();

  if (!limitRow || !limitRow.is_enabled) {
    return { allowed: false, limit: 0, current: 0 };
  }

  if (limitRow.limit_value === null) {
    return { allowed: true, limit: null, current: 0 };
  }

  const metricMap: Record<string, string> = {
    products: 'products',
    orders_per_month: 'orders',
    ai_messages_per_month: 'ai_messages',
  };
  const metric = metricMap[featureKey];
  if (!metric) return { allowed: true, limit: limitRow.limit_value, current: 0 };

  const period = new Date();
  period.setDate(1);
  const periodStart = period.toISOString().split('T')[0];

  const { data: usage } = await supabase
    .from('usage_counters')
    .select('current_value')
    .eq('tenant_id', tenantId)
    .eq('metric', metric)
    .eq('period_start', periodStart)
    .maybeSingle();

  const current = usage?.current_value ?? 0;
  return {
    allowed: current < limitRow.limit_value,
    limit: limitRow.limit_value,
    current,
  };
}
