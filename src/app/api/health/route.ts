import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const START_TIME = Date.now();

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'fail'; latencyMs?: number; error?: string }> = {};

  // 1. App liveness (always true if this handler runs)
  checks.app = { status: 'ok' };

  // 2. Database connectivity
  const dbStart = Date.now();
  try {
    const supa = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
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

  // 3. External services (lightweight — no full API calls)
  checks.openai = {
    status: process.env.OPENAI_API_KEY ? 'ok' : 'fail',
    error: process.env.OPENAI_API_KEY ? undefined : 'Missing API key',
  };
  checks.whatsapp = {
    status: process.env.WHATSAPP_ACCESS_TOKEN ? 'ok' : 'fail',
    error: process.env.WHATSAPP_ACCESS_TOKEN ? undefined : 'Missing access token',
  };
  checks.stripe_iraqpay = {
    status: process.env.ZAINCASH_SECRET ? 'ok' : 'fail',
  };

  const allOk = Object.values(checks).every((c) => c.status === 'ok');
  const status = allOk ? 200 : 503;

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
      checks,
    },
    {
      status,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    }
  );
}
