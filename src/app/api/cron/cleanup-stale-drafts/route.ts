import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Runs daily at 3 AM — archives draft orders older than 30 days.
 * Prevents DB bloat from abandoned bot conversations.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supa = createAdminClient();
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: archived } = await supa
    .from('orders')
    .update({ status: 'cancelled', notes: 'أُلغي تلقائيًا — مسودة قديمة' })
    .eq('status', 'draft')
    .lt('created_at', cutoff)
    .is('deleted_at', null)
    .select('id');

  return NextResponse.json({ archived: archived?.length ?? 0 });
}
