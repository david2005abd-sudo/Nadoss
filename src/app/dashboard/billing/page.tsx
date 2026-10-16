import Link from 'next/link';
import {
  CheckCircle2, Sparkles, Zap, Crown, Building2, ArrowLeft, AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatIQD } from '@/lib/utils';
import { PlanCard } from '@/components/dashboard/plan-card';
import { UsageMeter } from '@/components/dashboard/usage-meter';
import { CancelSubscriptionCard } from '@/components/dashboard/cancel-subscription-card';

const PLAN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  free: Sparkles,
  starter: Zap,
  pro: Crown,
  enterprise: Building2,
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .limit(1)
    .single();

  const tenantId = membership!.tenant_id;
  const isOwner = membership!.role === 'owner';

  const [
    { data: tenant },
    { data: plans },
    { data: currentSub },
    { data: usage },
    { data: invoices },
  ] = await Promise.all([
    supabase.from('tenants').select('id, name, plan_id').eq('id', tenantId).single(),
    supabase
      .from('subscription_plans')
      .select('id, name_ar, name, slug, price_usd, interval, max_products, max_orders_per_month, max_ai_messages, features, sort_order')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('subscriptions')
      .select('id, plan_id, status, billing_interval, current_period_start, current_period_end, cancel_at_period_end, canceled_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('usage_counters')
      .select('metric, current_value, limit_value, period_start')
      .eq('tenant_id', tenantId)
      .in('metric', ['products', 'orders', 'ai_messages']),
    supabase
      .from('invoices')
      .select('id, invoice_number, amount_usd, status, paid_at, created_at, notes')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(12),
  ]);

  const currentPlan = plans?.find((p) => p.id === tenant?.plan_id);
  const isCanceled = currentSub?.cancel_at_period_end || currentSub?.status === 'canceled';

  return (
    <div className="space-y-6">
      {status === 'paid' && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          تم تفعيل اشتراكك بنجاح
        </div>
      )}
      {status === 'failed' && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          لم تكتمل عملية الدفع، حاول مرة أخرى
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">الاشتراك والفواتير</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          إدارة خطتك وحدود الاستخدام وسجل المدفوعات
        </p>
      </div>

      {/* Current plan summary */}
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-start gap-4">
            {currentPlan && (() => {
              const Icon = PLAN_ICONS[currentPlan.slug] ?? Sparkles;
              return (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-nados-primary">
                  <Icon className="h-6 w-6" />
                </div>
              );
            })()}
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                خطة {currentPlan?.name_ar ?? 'غير محددة'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {currentPlan?.price_usd === 0
                  ? 'مجانية للأبد'
                  : `${currentPlan?.price_usd}$ / ${currentSub?.billing_interval === 'year' ? 'سنويًا' : 'شهريًا'}`}
              </p>
              {currentSub?.current_period_end && currentSub.status === 'active' && (
                <p className="text-xs text-gray-400 mt-1">
                  {isCanceled ? 'ينتهي في' : 'يتجدد في'}{' '}
                  {new Date(currentSub.current_period_end).toLocaleDateString('ar-IQ')}
                </p>
              )}
            </div>
          </div>

          {isCanceled && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              سيتم الإلغاء في نهاية الفترة
            </span>
          )}
        </div>
      </section>

      {/* Usage meters */}
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="font-semibold text-gray-900 mb-4">حدود الاستخدام — الشهر الحالي</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(usage ?? []).map((u) => (
            <UsageMeter
              key={u.metric}
              metric={u.metric}
              current={u.current_value}
              limit={u.limit_value}
            />
          ))}
        </div>
      </section>

      {/* Plans grid */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900">متاحة للترقية</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(plans ?? []).map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlanId={tenant?.plan_id ?? null}
              canChange={isOwner}
            />
          ))}
        </div>
      </section>

      {/* Cancel */}
      {currentPlan && currentPlan.slug !== 'free' && currentSub && isOwner && (
        <CancelSubscriptionCard
          isCanceled={isCanceled}
          periodEnd={currentSub.current_period_end}
        />
      )}

      {/* Invoices */}
      <section className="rounded-xl border border-gray-100 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">سجل الفواتير</h2>
        </div>
        {invoices && invoices.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-900 font-mono">
                    {inv.invoice_number}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{inv.notes}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    ${inv.amount_usd}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      inv.status === 'paid'
                        ? 'bg-green-50 text-green-700'
                        : inv.status === 'failed'
                          ? 'bg-red-50 text-red-700'
                          : inv.status === 'refunded'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {{
                      paid: 'مدفوعة',
                      pending: 'معلّقة',
                      failed: 'فشلت',
                      refunded: 'مُرجعة',
                    }[inv.status] ?? inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            لا توجد فواتير بعد
          </div>
        )}
      </section>
    </div>
  );
}
