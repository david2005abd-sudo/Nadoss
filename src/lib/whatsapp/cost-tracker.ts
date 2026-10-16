import { createClient } from '@/lib/supabase/server';

export interface WhatsAppCostRecord {
  freeQuotaUsed: number;
  freeQuotaRemaining: number;
  billableMessages: number;
  chargedUsd: number;
  absorbedUsd: number;
}

export interface WhatsAppMonthlySummary {
  messagesSent: number;
  freeQuotaUsed: number;
  freeQuotaTotal: number;
  billableMessages: number;
  totalCostUsd: number;
  chargedToTenantUsd: number;
  absorbedByPlatformUsd: number;
  planSlug: string;
  projectedMonthEndUsd: number;
}

const FREE_TIER = 1000;
const IRAQ_RATE = 0.0079;

/**
 * Record a single WhatsApp message sent and return cost impact.
 * Called from the processor AFTER a successful send.
 */
export async function recordWhatsAppMessage(
  tenantId: string,
  messageType: 'service' | 'utility' | 'marketing' = 'service'
): Promise<WhatsAppCostRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('record_whatsapp_message', {
    p_tenant_id: tenantId,
    p_message_type: messageType,
  });

  if (error || !data) {
    console.error('[whatsapp:cost] record failed', error);
    return null;
  }

  return data as WhatsAppCostRecord;
}

/**
 * Get current month summary + projection.
 */
export async function getWhatsAppMonthlySummary(
  tenantId: string
): Promise<WhatsAppMonthlySummary | null> {
  const supabase = await createClient();

  const period = new Date();
  period.setDate(1);
  const periodStart = period.toISOString().split('T')[0];

  const { data: usage } = await supabase
    .from('whatsapp_usage')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('period_start', periodStart)
    .maybeSingle();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('subscription_plans(slug)')
    .eq('id', tenantId)
    .single();

  const planSlug = (tenant?.subscription_plans as unknown as { slug: string } | null)?.slug ?? 'free';

  const messagesSent = usage?.messages_sent ?? 0;
  const billable = Math.max(0, messagesSent - FREE_TIER);
  const totalCost = billable * IRAQ_RATE;

  // Projection: extrapolate by day of month
  const dayOfMonth = new Date().getDate();
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const projectedMonthEnd =
    dayOfMonth > 0 ? (totalCost / dayOfMonth) * daysInMonth : totalCost;

  return {
    messagesSent,
    freeQuotaUsed: Math.min(messagesSent, FREE_TIER),
    freeQuotaTotal: FREE_TIER,
    billableMessages: billable,
    totalCostUsd: totalCost,
    chargedToTenantUsd: Number(usage?.cost_charged_to_tenant_usd ?? 0),
    absorbedByPlatformUsd: Number(usage?.cost_absorbed_by_platform_usd ?? 0),
    planSlug,
    projectedMonthEndUsd: projectedMonthEnd,
  };
}

/**
 * Check if tenant is approaching their monthly limit.
 * Returns a warning level for UI/notification.
 */
export async function checkWhatsAppQuota(tenantId: string): Promise<{
  level: 'ok' | 'warning' | 'critical' | 'exceeded';
  used: number;
  limit: number;
  remaining: number;
  estimatedExtraCostUsd: number;
}> {
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('subscription_plans(max_ai_messages, slug)')
    .eq('id', tenantId)
    .single();

  const plan = tenant?.subscription_plans as unknown as {
    max_ai_messages: number;
    slug: string;
  } | null;
  const limit = plan?.max_ai_messages ?? 200;

  const period = new Date();
  period.setDate(1);
  const periodStart = period.toISOString().split('T')[0];

  const { data: usage } = await supabase
    .from('whatsapp_usage')
    .select('messages_sent')
    .eq('tenant_id', tenantId)
    .eq('period_start', periodStart)
    .maybeSingle();

  const used = usage?.messages_sent ?? 0;
  const remaining = Math.max(0, limit - used);
  const pct = limit > 0 ? used / limit : 1;

  let level: 'ok' | 'warning' | 'critical' | 'exceeded' = 'ok';
  if (used >= limit) level = 'exceeded';
  else if (pct >= 0.9) level = 'critical';
  else if (pct >= 0.7) level = 'warning';

  return {
    level,
    used,
    limit,
    remaining,
    estimatedExtraCostUsd: remaining > 0 ? 0 : (used - limit) * IRAQ_RATE,
  };
}

export const WHATSAPP_RATE_IQD = IRAQ_RATE;
export const WHATSAPP_FREE_TIER = FREE_TIER;
