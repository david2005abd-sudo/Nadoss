'use client';

import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface TicketMessage {
  id: string;
  ticket_id: string;
  tenant_id: string;
  sender_id: string | null;
  sender_type: 'customer' | 'staff' | 'system';
  sender_name: string | null;
  content: string;
  content_type: string;
  attachments: unknown;
  is_internal: boolean;
  created_at: string;
}

export interface TypingIndicator {
  user_id: string;
  user_name: string;
  is_typing: boolean;
}

/**
 * Subscribe to realtime ticket messages.
 * Uses Supabase Realtime Broadcast (recommended for scalability).
 * Falls back to Postgres Changes if broadcast isn't configured.
 */
export function subscribeToTicket(
  ticketId: string,
  handlers: {
    onMessage: (msg: TicketMessage) => void;
    onTyping?: (indicator: TypingIndicator) => void;
  }
): () => void {
  const supabase = createClient();
  const channelName = `ticket:${ticketId}`;

  const channel: RealtimeChannel = supabase
    .channel(channelName, {
      config: { broadcast: { self: false } },
    })
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ticket_messages',
        filter: `ticket_id=eq.${ticketId}`,
      },
      (payload) => {
        handlers.onMessage(payload.new as TicketMessage);
      }
    )
    .on('broadcast', { event: 'typing' }, (payload) => {
      if (handlers.onTyping) {
        handlers.onTyping(payload.payload as TypingIndicator);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Broadcast a typing indicator (ephemeral, not persisted).
 */
export function broadcastTyping(
  ticketId: string,
  userId: string,
  userName: string,
  isTyping: boolean
): void {
  const supabase = createClient();
  const channel = supabase.channel(`ticket:${ticketId}`);
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { user_id: userId, user_name: userName, is_typing: isTyping },
  });
}
