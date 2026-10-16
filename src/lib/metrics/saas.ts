import { createClient } from '@/lib/supabase/server';

export interface SaasMetricsSummary {
  mrr: number;
  arr: number;
  payingTenants: number;
  activeTenants: number;
  trialTenants: number;
  arpu: number;
  churnRate30d: number;
  netRevenueRetention: number;
  ltv: number;
  cac: number;
  ltvCacRatio: number;
  paybackMonths: number;
  newMrr30d: number;
  churnedMrr30d: number;
}

export async function computeSaasMetrics(): Promise<SaasMetricsSummary> {
  const supabase = await createClient();

  // Current snapshot
  const { data: latest } = await supabase
    .from('saas_metrics_daily')
    .select('*')
    .order('metric_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 30-day lookback
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const { data: history } = await supabase
    .from('saas_metrics_daily')
    .select('metric_date, mrr_usd, paying_tenants, churned_tenants')
    .gte('metric_date', since30)
    .order('metric_date');

  const { data: churnEvents } = await supabase
    .from('churn_events')
    .select('event_type, mrr_change_usd')
    .gte('created_at', since30);

  const mrr = Number(latest?.mrr_usd ?? 0);
  const arr = mrr * 12;
  const payingTenants = latest?.paying_tenants ?? 0;
  const activeTenants = latest?.active_tenants ?? 0;
  const trialTenants = latest?.trial_tenants ?? 0;
  const arpu = payingTenants > 0 ? mrr / payingTenants : 0;

  const startMrr = Number(history?.[0]?.mrr_usd ?? 0);
  const startTenants = history?.[0]?.paying_tenants ?? 0;

  // Churn rate (30d)
  const churnedTenants = history?.reduce((s, d) => s + (d.churned_tenants ?? 0), 0) ?? 0;
  const churnRate30d = startTenants > 0 ? churnedTenants / startTenants : 0;

  // Net Revenue Retention
  const expansion = churnEvents
    ?.filter((e) => e.event_type === 'upgraded')
    .reduce((s, e) => s + Number(e.mrr_change_usd ?? 0), 0) ?? 0;
  const contraction = churnEvents
    ?.filter((e) => e.event_type === 'downgraded')
    .reduce((s, e) => s + Math.abs(Number(e.mrr_change_usd ?? 0)), 0) ?? 0;
  const churnedMrr = churnEvents
    ?.filter((e) => e.event_type === 'canceled')
    .reduce((s, e) => s + Math.abs(Number(e.mrr_change_usd ?? 0)), 0) ?? 0;

  const nrr = startMrr > 0 ? (startMrr + expansion - contraction - churnedMrr) / startMrr : 1;

  // LTV = ARPU / monthly churn rate
  const monthlyChurn = churnRate30d;
  const ltv = monthlyChurn > 0 ? arpu / monthlyChurn : arpu * 24;

  // CAC (estimated — needs marketing spend data, use placeholder)
  const cac = Number(process.env.SAAS_CAC_USD ?? 150);

  const ltvCacRatio = cac > 0 ? ltv / cac : 0;
  const paybackMonths = arpu > 0 ? cac / arpu : 0;

  return {
    mrr,
    arr,
    payingTenants,
    activeTenants,
    trialTenants,
    arpu,
    churnRate30d,
    netRevenueRetention: nrr,
    ltv,
    cac,
    ltvCacRatio,
    paybackMonths,
    newMrr30d: expansion,
    churnedMrr30d: churnedMrr,
  };
}
