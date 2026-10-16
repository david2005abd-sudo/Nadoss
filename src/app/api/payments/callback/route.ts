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
  const gatewayValue = url.searchParams.get('gateway') ?? 'zaincash';
  if (!['zaincash', 'fib', 'qicard', 'nasspay'].includes(gatewayValue)) {
    return NextResponse.json({ error: 'Unsupported payment gateway' }, { status: 400 });
  }
  const gateway = gatewayValue as PaymentGateway;

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    const event = await verifyCallback(token, gateway);
    const publicOrder = await applyPaymentUpdate(event);
    if (publicOrder) {
      return NextResponse.redirect(
        new URL(
          `/store/${publicOrder.slug}/order/${publicOrder.id}?token=${encodeURIComponent(publicOrder.accessToken)}`,
          request.url
        )
      );
    }
    return NextResponse.redirect(new URL('/payment/result?status=processing', request.url));
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

  const gatewayValue = request.headers.get('x-gateway') ?? 'fib';
  if (!['zaincash', 'fib', 'qicard', 'nasspay'].includes(gatewayValue)) {
    return NextResponse.json({ error: 'Unsupported payment gateway' }, { status: 400 });
  }
  const gateway = gatewayValue as PaymentGateway;

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
}): Promise<{ id: string; slug: string; accessToken: string } | null> {
  if (!event.orderId) return null;

  const admin = getAdminClient();

  const { data: order } = await admin
    .from('orders')
    .select('id, tenant_id, total_iqd, payment_status, status, public_access_token')
    .eq('id', event.orderId)
    .maybeSingle();

  if (!order) return null;

  const newPaymentStatus =
    event.status === 'paid'
      ? 'paid'
      : event.status === 'refunded'
        ? 'refunded'
        : event.status === 'failed'
          ? 'failed'
          : 'pending';

  if (order.status === 'cancelled' && newPaymentStatus === 'paid') {
    throw new Error('Paid callback received for a cancelled order; manual reconciliation is required');
  }

  // Do not let delayed callbacks regress a paid/refunded order to pending or failed.
  if (order.payment_status === 'paid' && newPaymentStatus !== 'refunded') {
    return getPublicOrderContext(admin, order);
  }
  if (order.payment_status === 'refunded' && newPaymentStatus !== 'refunded') {
    return getPublicOrderContext(admin, order);
  }
  if (order.payment_status === 'failed' && newPaymentStatus === 'pending') {
    return getPublicOrderContext(admin, order);
  }
  if (order.payment_status === 'failed' && newPaymentStatus === 'failed' && order.status === 'pending') {
    const { error: releaseError } = await admin.rpc('cancel_unpaid_store_order', { p_order_id: order.id });
    if (releaseError) throw new Error('Unable to release stock for failed payment');
    return getPublicOrderContext(admin, order);
  }
  if (order.payment_status === 'failed' && newPaymentStatus === 'failed' && order.status !== 'pending') {
    return getPublicOrderContext(admin, order);
  }
  if (order.payment_status === newPaymentStatus && ['paid', 'refunded'].includes(newPaymentStatus)) {
    return getPublicOrderContext(admin, order);
  }

  // Never mark an order paid unless the verified provider amount matches our database total.
  if (
    newPaymentStatus === 'paid' &&
    (event.amount == null || Math.round(event.amount) !== order.total_iqd)
  ) {
    throw new Error('Verified payment amount does not match order total');
  }

  const newOrderStatus =
    newPaymentStatus === 'paid' && order.status === 'pending'
      ? 'confirmed'
      : order.status;

  const { error: updateError } = await admin
    .from('orders')
    .update({
      payment_status: newPaymentStatus,
      status: newPaymentStatus === 'failed' ? 'cancelled' : newOrderStatus,
    })
    .eq('id', order.id);

  if (updateError) {
    throw new Error('Unable to persist verified payment status');
  }

  if (newPaymentStatus === 'failed') {
    const { error: releaseError } = await admin.rpc('cancel_unpaid_store_order', { p_order_id: order.id });
    if (releaseError) throw new Error('Unable to release stock for failed payment');
  }

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

  return getPublicOrderContext(admin, order);
}

async function getPublicOrderContext(
  admin: ReturnType<typeof getAdminClient>,
  order: { id: string; tenant_id: string; public_access_token: string | null }
): Promise<{ id: string; slug: string; accessToken: string } | null> {
  if (!order.public_access_token) return null;

  const { data: tenant } = await admin
    .from('tenants')
    .select('slug')
    .eq('id', order.tenant_id)
    .maybeSingle();

  if (!tenant?.slug) return null;
  return { id: order.id, slug: tenant.slug, accessToken: order.public_access_token };
}
