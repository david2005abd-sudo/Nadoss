import { getWhatsAppClient } from './client';

/**
 * Lightweight outbound-only sender used by feature modules
 * (bookings, notifications, reminders) without the full processor loop.
 */
export async function sendWhatsAppMessage(input: {
  to: string;
  body: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = getWhatsAppClient();
    const phone = input.to.startsWith('+') ? input.to : `+${input.to}`;

    await client.messages.sendText({
      to: phone,
      text: { body: input.body },
    });

    return { ok: true };
  } catch (err) {
    console.error('[whatsapp:sender]', err);
    return { ok: false, error: err instanceof Error ? err.message : 'Send failed' };
  }
}
