import { createClient } from '@/lib/supabase/server';

export interface QuotaCheck {
  allowed: boolean;
  current: number;
  limit: number | null; // null = unlimited
  remaining: number | null;
}

const FEATURE_METRIC: Record<string, string> = {
  products: 'products',
  orders_per_month: 'orders',
  ai_messages_per_month: 'ai_messages',
};

/**
 * Check whether a tenant can consume one more unit of a metered feature.
 * Call this BEFORE inserting (products/orders) or processing (AI).
 */
export async function checkQuota(
  tenantId: string,
  featureKey: 'products' | 'orders_per_month' | 'ai_messages_per_month'
): Promise<QuotaCheck> {
  const supabase = await createClient();

  const { data: entitlement } = await supabase
    .from('plan_entitlements')
    .select('limit_value, is_enabled, subscription_plans!inner(tenants!inner(id, plan_id))')
    .eq('subscription_plans.tenants.id', tenantId)
    .eq('feature_key', featureKey)
    .maybeSingle();

  if (!entitlement || !entitlement.is_enabled) {
    return { allowed: false, current: 0, limit: 0, remaining: 0 };
  }

  const limit = entitlement.limit_value as number | null;
  if (limit === null) {
    return { allowed: true, current: 0, limit: null, remaining: null };
  }

  const metric = FEATURE_METRIC[featureKey];

  // For 'products' we count live products (not monthly counter)
  if (metric === 'products') {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .is('deleted_at', null);

    const current = count ?? 0;
    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(0, limit - current),
    };
  }

  // For orders/ai_messages we use the monthly counter
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
    allowed: current < limit,
    current,
    limit,
    remaining: Math.max(0, limit - current),
  };
}

/**
 * Increment a metered counter (after the operation succeeds).
 */
export async function incrementUsage(
  tenantId: string,
  metric: 'orders' | 'ai_messages' | 'products'
): Promise<void> {
  const supabase = await createClient();
  const period = new Date();
  period.setDate(1);
  const periodStart = period.toISOString().split('T')[0];

  await supabase
    .from('usage_counters')
    .upsert(
      {
        tenant_id: tenantId,
        metric,
        period_start: periodStart,
        current_value: 1,
      },
      {
        onConflict: 'tenant_id,metric,period_start',
        ignoreDuplicates: false,
      }
    );

  // Atomic increment via RPC (fallback if above caused new row semantics)
  await supabase.rpc('increment_usage_counter', {
    p_tenant_id: tenantId,
    p_metric: metric,
  });
}
