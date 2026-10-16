import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { verifyWhatsAppSignature } from '@/lib/whatsapp/signature';
import type { WhatsAppWebhookPayload } from '@/lib/whatsapp/types';
import { processInboundMessage } from '@/lib/whatsapp/processor';

// Ensure runtime can read raw body
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// ============================================
// GET — Meta verification handshake
// ============================================
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const mode = sp.get('hub.mode');
  const token = sp.get('hub.verify_token');
  const challenge = sp.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? '', { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// ============================================
// POST — Inbound events
// ============================================
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  // Fail closed in production: missing signature configuration must never disable verification.
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Webhook verification is not configured' }, { status: 503 });
  }
  if (appSecret && !verifyWhatsAppSignature(rawBody, signature, appSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (payload.object !== 'whatsapp_business_account') {
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Process each entry/change
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'messages') continue;
      const value = change.value;

      // Handle statuses (delivery/read) — update messages table
      for (const status of value.statuses ?? []) {
        await handleStatusUpdate(status);
      }

      // Handle inbound messages
      for (const message of value.messages ?? []) {
        const phoneNumberId = value.metadata.phone_number_id;
        const contactName = value.contacts?.[0]?.profile?.name ?? null;

        // Fire-and-forget — ack quickly to Meta (<5s)
        // In production, push to a queue (BullMQ) instead
        processInboundMessage({
          phoneNumberId,
          message,
          contactName,
          supabase: admin(),
        }).catch((err) => {
          console.error('[whatsapp:processor]', err);
        });
      }
    }
  }

  // Always ack fast — Meta retries on non-2xx within 30s window
  return NextResponse.json({ ok: true });
}

async function handleStatusUpdate(status: {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
}) {
  await admin()
    .from('messages')
    .update({ external_message_id: status.id })
    .eq('external_message_id', status.id);
}
