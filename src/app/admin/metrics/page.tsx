import {
  DollarSign, TrendingUp, Users, AlertTriangle, Target,
  ArrowUpRight, ArrowDownRight, Activity, HeartPulse,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { computeSaasMetrics } from '@/lib/metrics/saas';
import { formatIQD } from '@/lib/utils';

export const revalidate = 300;

export default async function MetricsPage() {
  const metrics = await computeSaasMetrics();
  const supabase = await createClient();

  // 30-day MRR trend
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const { data: trend } = await supabase
    .from('saas_metrics_daily')
    .select('metric_date, mrr_usd, active_tenants, total_orders, total_gmv_iqd')
    .gte('metric_date', since30)
    .order('metric_date');

  const { data: atRiskTenants } = await supabase
    .from('tenant_health')
    .select('tenant_id, health_score, risk_level, days_since_last_order, orders_last_30d')
    .in('risk_level', ['high', 'critical'])
    .order('health_score', { ascending: true })
    .limit(10);

  const { data: topTenants } = await supabase
    .from('tenant_health')
    .select('tenant_id, health_score, revenue_last_30d, orders_last_30d')
    .eq('risk_level', 'low')
    .order('revenue_last_30d', { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">مقاييس SaaS</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          نظرة استراتيجية على أداء منصة نادوس
        </p>
      </div>

      {/* Primary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="MRR (الإيراد الشهري المتكرر)"
          value={`$${metrics.mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          tone="primary"
          sub={`ARR: $${metrics.arr.toLocaleString('en-US')}`}
        />
        <MetricCard
          label="ARPU (متوسط الإيراد لكل مشترك)"
          value={`$${metrics.arpu.toFixed(2)}`}
          icon={Target}
          tone="green"
          sub={`${metrics.payingTenants} مشترك مدفوع`}
        />
        <MetricCard
          label="معدل التسرب (30 يومًا)"
          value={`${(metrics.churnRate30d * 100).toFixed(1)}%`}
          icon={ArrowDownRight}
          tone={metrics.churnRate30d > 0.05 ? 'danger' : 'warning'}
          sub={`${metrics.churnedMrr30d.toFixed(2)}$ MRR مفقود`}
        />
        <MetricCard
          label="NRR (الاحتفاظ الصافي بالإيراد)"
          value={`${(metrics.netRevenueRetention * 100).toFixed(0)}%`}
          icon={Activity}
          tone={metrics.netRevenueRetention >= 1 ? 'green' : 'warning'}
          sub={metrics.netRevenueRetention >= 1 ? 'ينمو بدون عملاء جدد' : 'أقل من 100% — يحتاج تحسين'}
        />
      </div>

      {/* Unit economics */}
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="font-semibold text-gray-900 mb-4">اقتصاديات الوحدة (Unit Economics)</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <UnitStat label="LTV (قيمة العميل مدى الحياة)" value={`$${metrics.ltv.toFixed(0)}`} />
          <UnitStat label="CAC (تكلفة اكتساب العميل)" value={`$${metrics.cac.toFixed(0)}`} />
          <UnitStat
            label="نسبة LTV/CAC"
            value={`${metrics.ltvCacRatio.toFixed(1)}:1`}
            status={
              metrics.ltvCacRatio >= 3
                ? 'good'
                : metrics.ltvCacRatio >= 2
                  ? 'warn'
                  : 'bad'
            }
            hint={metrics.ltvCacRatio >= 3 ? 'صحي (≥3:1)' : 'يحتاج تحسين (الهدف ≥3:1)'}
          />
          <UnitStat
            label="فترة استرداد CAC"
            value={`${metrics.paybackMonths.toFixed(1)} شهر`}
            status={
              metrics.paybackMonths <= 12
                ? 'good'
                : metrics.paybackMonths <= 18
                  ? 'warn'
                  : 'bad'
            }
            hint={metrics.paybackMonths <= 12 ? 'صحي (<12 شهرًا)' : 'طويل (>12 شهرًا)'}
          />
        </div>
      </section>

      {/* Tenant distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="إجمالي المتاجر النشطة"
          value={String(metrics.activeTenants)}
          icon={Users}
          tone="primary"
        />
        <MetricCard
          label="المتاجر المدفوعة"
          value={String(metrics.payingTenants)}
          icon={TrendingUp}
          tone="green"
        />
        <MetricCard
          label="التجارب المجانية"
          value={String(metrics.trialTenants)}
          icon={HeartPulse}
          tone="warning"
        />
      </div>

      {/* MRR trend (simple text-based chart) */}
      {trend && trend.length > 1 && (
        <section className="rounded-xl border border-gray-100 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-4">تطور MRR — آخر 30 يومًا</h2>
          <MiniBarChart
            data={trend.map((d) => ({
              label: d.metric_date,
              value: Number(d.mrr_usd),
            }))}
          />
        </section>
      )}

      {/* At-risk tenants */}
      <section className="rounded-xl border border-gray-100 bg-white">
        <div className="border-b border-gray-100 px-5 py-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <h2 className="font-semibold text-gray-900">متاجر في خطر (تحتاج تدخل)</h2>
        </div>
        {atRiskTenants && atRiskTenants.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {atRiskTenants.map((t) => (
              <div key={t.tenant_id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 font-mono">{t.tenant_id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">
                    آخر طلب: {t.days_since_last_order ?? '—'} يومًا ·{' '}
                    {t.orders_last_30d} طلب/30 يومًا
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">{t.health_score}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      t.risk_level === 'critical'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-orange-50 text-orange-700'
                    }`}
                  >
                    {t.risk_level === 'critical' ? 'حرج' : 'عالي'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            جميع المتاجر في حالة جيدة
          </div>
        )}
      </section>

      {/* Top tenants */}
      <section className="rounded-xl border border-gray-100 bg-white">
        <div className="border-b border-gray-100 px-5 py-4 flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4 text-green-600" />
          <h2 className="font-semibold text-gray-900">أفضل 10 متاجر</h2>
        </div>
        {topTenants && topTenants.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {topTenants.map((t) => (
              <div key={t.tenant_id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 font-mono">{t.tenant_id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">{t.orders_last_30d} طلب/30 يومًا</p>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {formatIQD(t.revenue_last_30d)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-sm text-gray-400">لا توجد بيانات</div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'primary' | 'green' | 'warning' | 'danger';
  sub?: string;
}) {
  const tones = {
    primary: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-red-50 text-red-600',
  };
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 truncate">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function UnitStat({
  label,
  value,
  status,
  hint,
}: {
  label: string;
  value: string;
  status?: 'good' | 'warn' | 'bad';
  hint?: string;
}) {
  const statusColors = {
    good: 'text-green-700',
    warn: 'text-amber-700',
    bad: 'text-red-700',
  };
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${status ? statusColors[status] : 'text-gray-900'}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const step = Math.ceil(data.length / 30);
  const sampled = data.filter((_, i) => i % step === 0);

  return (
    <div className="flex items-end gap-1 h-32">
      {sampled.map((d, i) => {
        const height = (d.value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${d.label}: $${d.value}`}>
            <div
              className="w-full rounded-t bg-nados-primary/80 transition-all hover:bg-nados-primary"
              style={{ height: `${Math.max(4, height)}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
