import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Runs daily (configure in vercel.json).
 * Responsibilities: * 1. Downgrade tenants whose cancel_at_period_end subscriptions just expired
 * 2. Flag past_due subscriptions (renewal failed / no gateway auto-charge in Iraq)
 * 3. Send reminders 3 days before period end
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel)
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const now = new Date();
  let downgraded = 0;
  let flagged = 0;

  // 1. Expired cancel-at-period-end → downgrade to Free
  const { data: expired } = await supa
    .from('subscriptions')
    .select('id, tenant_id, plan_id, current_period_end')
    .eq('status', 'active')
    .eq('cancel_at_period_end', true)
    .lt('current_period_end', now.toISOString());

  const { data: freePlan } = await supa
    .from('subscription_plans')
    .select('id')
    .eq('slug', 'free')
    .single();

  for (const sub of expired ?? []) {
    if (!freePlan) break;

    await supa
      .from('subscriptions')
      .update({
        status: 'canceled',
        plan_id: freePlan.id,
        canceled_at: now.toISOString(),
      })
      .eq('id', sub.id);

    await supa
      .from('tenants')
      .update({ plan_id: freePlan.id })
      .eq('id', sub.tenant_id);

    await supa.rpc('provision_usage_counters', {
      p_tenant_id: sub.tenant_id,
      p_plan_id: freePlan.id,
    });

    await supa.from('billing_events').insert({
      tenant_id: sub.tenant_id,
      event_type: 'subscription.expired.downgraded',
      subscription_id: sub.id,
      from_plan_id: sub.plan_id,
      to_plan_id: freePlan.id,
    });

    downgraded++;
  }

  // 2. Flag active subscriptions past period end (no auto-renew in Iraq)
  const { data: pastDue } = await supa
    .from('subscriptions')
    .select('id, tenant_id, plan_id')
    .eq('status', 'active')
    .eq('cancel_at_period_end', false)
    .lt('current_period_end', now.toISOString());

  for (const sub of pastDue ?? []) {
    // Grace: mark past_due, keep access for 7 more days
    await supa
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('id', sub.id);

    await supa.from('billing_events').insert({
      tenant_id: sub.tenant_id,
      event_type: 'subscription.past_due',
      subscription_id: sub.id,
    });

    flagged++;
  }

  return NextResponse.json({ downgraded, flagged });
}
