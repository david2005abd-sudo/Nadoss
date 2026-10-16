import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Runs daily at 4 AM — computes SaaS metrics snapshot + tenant health scores.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supa = createAdminClient();

  const [{ data: snapshotResult, error: snapErr }, { data: healthResult, error: healthErr }] =
    await Promise.all([
      supa.rpc('compute_saas_metrics_snapshot', { p_date: new Date().toISOString().split('T')[0] }),
      supa.rpc('recompute_tenant_health'),
    ]);

  return NextResponse.json({
    ok: !snapErr && !healthErr,
    snapshot: { ok: !snapErr, error: snapErr?.message },
    health: { tenants_updated: healthResult ?? 0, ok: !healthErr, error: healthErr?.message },
  });
}
