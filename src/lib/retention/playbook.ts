import { createAdminClient } from '@/lib/supabase/server';

export interface RetentionAction {
  tenantId: string;
  action: 'email_nudge' | 'whatsapp_nudge' | 'support_call' | 'discount_offer';
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Generates retention actions based on tenant health.
 * Run daily via cron or manually from admin dashboard.
 */
export async function generateRetentionActions(): Promise<RetentionAction[]> {
  const supa = createAdminClient();

  const { data: atRisk } = await supa
    .from('tenant_health')
    .select(
      'tenant_id, health_score, risk_level, days_since_last_order, orders_last_30d, revenue_last_30d'
    )
    .in('risk_level', ['high', 'critical'])
    .order('health_score', { ascending: true });

  const actions: RetentionAction[] = [];

  for (const t of atRisk ?? []) {
    // Critical: no orders in 30+ days
    if (t.risk_level === 'critical' && (t.days_since_last_order ?? 0) > 30) {
      actions.push({
        tenantId: t.tenant_id,
        action: 'support_call',
        reason: `لا طلبات منذ ${t.days_since_last_order} يومًا — اتصل شخصيًا`,
        priority: 'high',
      });
    }
    // High risk: 14-30 days inactive
    else if (t.risk_level === 'high' && (t.days_since_last_order ?? 0) > 14) {
      actions.push({
        tenantId: t.tenant_id,
        action: 'whatsapp_nudge',
        reason: `غير نشط منذ ${t.days_since_last_order} يومًا — أرسل واتساب مع نصائح`,
        priority: 'high',
      });
    }
    // Medium: low volume but still active
    else if ((t.orders_last_30d ?? 0) < 5) {
      actions.push({
        tenantId: t.tenant_id,
        action: 'email_nudge',
        reason: `حجم طلبات منخفض (${t.orders_last_30d}/30ي) — أرسل نصائح تحسين المتجر`,
        priority: 'medium',
      });
    }
  }

  return actions;
}
