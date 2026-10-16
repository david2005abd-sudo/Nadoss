import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Runs every 2 hours — flags SLA-breached tickets.
 * Slack/email notification could be wired here.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supa = createAdminClient();
  const now = new Date().toISOString();

  const { data: breached } = await supa
    .from('support_tickets')
    .update({ sla_breached: true })
    .in('status', ['open', 'in_progress', 'waiting'])
    .eq('sla_breached', false)
    .lt('sla_due_at', now)
    .select('id, tenant_id, subject, priority');

  return NextResponse.json({
    flagged: breached?.length ?? 0,
    tickets: breached?.map((t) => ({ id: t.id, priority: t.priority })) ?? [],
  });
}
