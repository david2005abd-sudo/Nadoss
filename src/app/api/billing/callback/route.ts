import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { verifyCallback, type PaymentGateway } from '@/lib/payments/iraqpay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const token = sp.get('token');
  const invoiceId = sp.get('invoice_id');
  const planId = sp.get('plan_id');
  const interval = (sp.get('interval') ?? 'month') as 'month' | 'year';
  const gateway = (sp.get('gateway') ?? 'zaincash') as PaymentGateway;

  if (!token || !invoiceId || !planId) {
    return NextResponse.redirect(
      new URL('/dashboard/billing?status=invalid', request.url)    );
  }

  try {
    const event = await verifyCallback(token, gateway);
    await applyBillingUpdate({ event, invoiceId, planId, interval });
    return NextResponse.redirect(
      new URL(`/dashboard/billing?status=${event.status}`, request.url)
    );
  } catch (err) {
    console.error('[billing/callback GET]', err);
    return NextResponse.redirect(
      new URL('/dashboard/billing?status=failed', request.url)
    );
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const sp = request.nextUrl.searchParams;
  const invoiceId = sp.get('invoice_id');
  const planId = sp.get('plan_id');
  const interval = (sp.get('interval') ?? 'month') as 'month' | 'year';
  const gateway = (request.headers.get('x-gateway') ?? 'fib') as PaymentGateway;

  if (!invoiceId || !planId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  try {
    const event = await verifyCallback(body, gateway);
    await applyBillingUpdate({ event, invoiceId, planId, interval });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[billing/callback POST]', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
  }
}

async function applyBillingUpdate(input: {
  event: { id: string; status: string; amount?: number };
  invoiceId: string;
  planId: string;
  interval: 'month' | 'year';
}) {
  const supa = admin();

  // Idempotency
  const { data: invoice } = await supa
    .from('invoices')
    .select('id, tenant_id, status, amount_usd, subscription_id')
    .eq('id', input.invoiceId)
    .maybeSingle();

  if (!invoice) return;
  if (invoice.status === 'paid') return;

  if (input.event.status !== 'paid') {
    if (input.event.status === 'failed') {
      await supa.from('invoices').update({ status: 'failed' }).eq('id', invoice.id);
    }
    return;
  }

  // Mark invoice paid
  await supa
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      external_payment_id: input.event.id,
    })
    .eq('id', invoice.id);

  // Resolve plan
  const { data: newPlan } = await supa
    .from('subscription_plans')
    .select('id, name_ar')
    .eq('id', input.planId)
    .single();

  if (!newPlan) return;

  const { data: tenant } = await supa
    .from('tenants')
    .select('id, plan_id')
    .eq('id', invoice.tenant_id)
    .single();

  if (!tenant) return;

  const periodEnd = new Date(
    Date.now() + (input.interval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000
  ).toISOString();

  // Update tenant plan
  await supa.from('tenants').update({ plan_id: newPlan.id }).eq('id', tenant.id);

  // Upsert subscription
  if (invoice.subscription_id) {
    await supa
      .from('subscriptions')
      .update({
        plan_id: newPlan.id,
        status: 'active',
        billing_interval: input.interval,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd,
        cancel_at_period_end: false,
        canceled_at: null,
      })
      .eq('id', invoice.subscription_id);
  } else {
    const { data: created } = await supa
      .from('subscriptions')
      .insert({
        tenant_id: tenant.id,
        plan_id: newPlan.id,
        status: 'active',
        billing_interval: input.interval,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd,
      })
      .select('id')
      .single();

    if (created) {
      await supa
        .from('invoices')
        .update({ subscription_id: created.id })
        .eq('id', invoice.id);
    }
  }

  // Provision usage counters
  await supa.rpc('provision_usage_counters', {
    p_tenant_id: tenant.id,
    p_plan_id: newPlan.id,
  });

  // Billing event
  await supa.from('billing_events').insert({
    tenant_id: tenant.id,
    event_type: 'subscription.activated',
    invoice_id: invoice.id,
    from_plan_id: tenant.plan_id,
    to_plan_id: newPlan.id,
    amount_usd: invoice.amount_usd,
    metadata: { interval: input.interval, gateway_event_id: input.event.id },
  });

  // Audit
  await supa.from('audit_log').insert({
    tenant_id: tenant.id,
    action: 'billing.subscription.activated',
    entity_type: 'subscription',
    entity_id: invoice.subscription_id,
    new_values: { plan: newPlan.name_ar, interval: input.interval },
  });
}
