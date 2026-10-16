import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const START_TIME = Date.now();

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'fail'; latencyMs?: number; error?: string }> = {};

  checks.app = { status: 'ok' };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    const dbStart = Date.now();
    try {
      const supa = createClient(url, key, { auth: { persistSession: false } });
      const { error } = await supa
        .from('iraq_governorates')
        .select('id', { count: 'exact', head: true })
        .limit(1);
      checks.database = error
        ? { status: 'fail', error: error.message }
        : { status: 'ok', latencyMs: Date.now() - dbStart };
    } catch (err) {
      checks.database = {
        status: 'fail',
        error: err instanceof Error ? err.message : 'unknown',
      };
    }
  } else {
    checks.database = { status: 'fail', error: 'Supabase credentials not configured' };
  }

  const allOk = Object.values(checks).every((c) => c.status === 'ok');

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      service: 'nados',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
      checks,
    },
    {
      status: allOk ? 200 : 503,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    }
  );
}
