import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getAdapter } from '@/lib/delivery/registry';
import type { ShipmentStatus } from '@/lib/delivery/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  const adapter = getAdapter(provider);
  if (!adapter) {
    return NextResponse.json({ error: 'Unknown provider' }, { status: 404 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v;
  });

  let parsed;
  try {
    parsed = await adapter.parseWebhook(payload, headers);
  } catch (err) {
    console.error(`[webhook:${provider}] parse error`, err);
    return NextResponse.json({ error: 'Parse failed' }, { status: 400 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // Find shipment by tracking number
  const { data: shipment } = await admin
    .from('shipments')
    .select('id, tenant_id, order_id, status')
    .eq('tracking_number', parsed.trackingNumber)
    .maybeSingle();

  if (!shipment) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Idempotency: skip no-op updates
  if (shipment.status === parsed.status) {
    return NextResponse.json({ ok: true, unchanged: true });
  }

  // Update shipment
  await admin
    .from('shipments')
    .update({
      status: parsed.status,
      raw_response: payload as never,
    })
    .eq('id', shipment.id);

  // Map shipment status to order status (business rule)
  const orderStatus = mapShipmentToOrderStatus(parsed.status);
  if (orderStatus) {
    await admin
      .from('orders')
      .update({ status: orderStatus })
      .eq('id', shipment.order_id)
      .eq('tenant_id', shipment.tenant_id);
  }

  // Audit log
  await admin.from('audit_log').insert({
    tenant_id: shipment.tenant_id,
    action: `shipment.webhook.${provider}`,
    entity_type: 'shipment',
    entity_id: shipment.id,
    old_values: { status: shipment.status },
    new_values: {
      status: parsed.status,
      description: parsed.description,
      driverName: parsed.driverName ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}

function mapShipmentToOrderStatus(s: ShipmentStatus): string | null {
  switch (s) {
    case 'picked_up':
    case 'in_transit':
    case 'out_for_delivery':
      return 'shipped';
    case 'delivered':
      return 'delivered';
    case 'returned':
      return 'returned';
    case 'failed':
      return null; // stay shipped, log only
    default:
      return null;
  }
}
