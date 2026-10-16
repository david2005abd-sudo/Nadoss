import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { verifyCallback, type PaymentGateway } from '@/lib/payments/iraqpay';

// Service-role client (bypasses RLS) — used ONLY for webhook side-effects
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function GET(request: NextRequest) {
  // ZainCash sends JWT token in query string
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const gateway = (url.searchParams.get('gateway') ?? 'zaincash') as PaymentGateway;

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    const event = await verifyCallback(token, gateway);
    await applyPaymentUpdate(event);
    return NextResponse.redirect(
      new URL(`/payment/result?status=${event.status}`, request.url)
    );
  } catch (err) {
    console.error('[payments/callback GET]', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const gateway = (request.headers.get('x-gateway') ?? 'fib') as PaymentGateway;

  try {
    const event = await verifyCallback(body, gateway);
    await applyPaymentUpdate(event);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[payments/callback POST]', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
  }
}

async function applyPaymentUpdate(event: {
  id: string;
  status: string;
  orderId?: string;
  amount?: number;
}) {
  if (!event.orderId) return;

  const admin = getAdminClient();

  const { data: order } = await admin
    .from('orders')
    .select('id, tenant_id, total_iqd, payment_status, status')
    .eq('id', event.orderId)
    .maybeSingle();

  if (!order) return;

  const newPaymentStatus =
    event.status === 'paid'
      ? 'paid'
      : event.status === 'refunded'
        ? 'refunded'
        : event.status === 'failed'
          ? 'failed'
          : 'pending';

  // Idempotency: skip if already paid
  if (order.payment_status === 'paid' && newPaymentStatus === 'paid') return;

  const newOrderStatus =
    newPaymentStatus === 'paid' && order.status === 'pending'
      ? 'confirmed'
      : order.status;

  await admin
    .from('orders')
    .update({
      payment_status: newPaymentStatus,
      status: newOrderStatus,
    })
    .eq('id', order.id);

  // Audit
  await admin.from('audit_log').insert({
    tenant_id: order.tenant_id,
    action: 'payment.callback',
    entity_type: 'order',
    entity_id: order.id,
    old_values: { payment_status: order.payment_status, status: order.status },
    new_values: {
      payment_status: newPaymentStatus,
      status: newOrderStatus,
      gateway_event_id: event.id,
      gateway_amount: event.amount ?? null,
    },
  });

  // Increment customer stats + usage counter (best-effort)
  const { data: fullOrder } = await admin
    .from('orders')
    .select('customer_id')
    .eq('id', order.id)
    .maybeSingle();

  if (fullOrder?.customer_id && newPaymentStatus === 'paid') {
    await admin.rpc('increment_customer_stats', {
      p_customer_id: fullOrder.customer_id,
      p_amount: order.total_iqd,
    });
  }
}
