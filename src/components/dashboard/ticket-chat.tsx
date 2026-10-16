'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Send, Lock, Loader2 } from 'lucide-react';
import { replyTicketAction } from '@/app/dashboard/support/actions';
import { subscribeToTicket, broadcastTyping, type TicketMessage } from '@/lib/support/realtime';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  ticketId: string;
  initialMessages: TicketMessage[];
  currentUserId: string;
  isStaff: boolean;
}

export function TicketChat({ ticketId, initialMessages, currentUserId, isStaff }: Props) {
  const [messages, setMessages] = useState<TicketMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Realtime subscription
  useEffect(() => {
    const unsubscribe = subscribeToTicket(ticketId, {
      onMessage: (msg) => {
        // Skip internal notes for non-staff
        if (msg.is_internal && !isStaff) return;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      },
      onTyping: (indicator) => {
        if (indicator.user_id === currentUserId) return;
        setTypingUsers((prev) => {
          const next = new Map(prev);
          if (indicator.is_typing) next.set(indicator.user_id, indicator.user_name);
          else next.delete(indicator.user_id);
          return next;
        });
      },
    });

    return unsubscribe;
  }, [ticketId, currentUserId, isStaff]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    broadcastTyping(ticketId, currentUserId, 'أنت', true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      broadcastTyping(ticketId, currentUserId, 'أنت', false);
    }, 2000);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const content = input.trim();
    const internal = isInternal;
    setInput('');
    setIsInternal(false);
    broadcastTyping(ticketId, currentUserId, 'أنت', false);

    // Optimistic
    const optimistic: TicketMessage = {
      id: `optimistic-${Date.now()}`,
      ticket_id: ticketId,
      tenant_id: '',
      sender_id: currentUserId,
      sender_type: isStaff ? 'staff' : 'customer',
      sender_name: null,
      content,
      content_type: 'text',
      attachments: [],
      is_internal: internal,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    startTransition(async () => {
      const fd = new FormData();
      fd.append('ticketId', ticketId);
      fd.append('content', content);
      if (internal) fd.append('isInternal', 'on');
      const result = await replyTicketAction({}, fd);
      if (result?.error) {
        // Rollback
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setInput(content);
        alert(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col rounded-xl border border-gray-100 bg-white" style={{ height: 'calc(100vh - 220px)' }}>
      <div className="border-b border-gray-100 px-5 py-3">
        <h2 className="font-semibold text-gray-900 text-sm">المحادثة</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m) => {
          const isOwn = m.sender_id === currentUserId;
          const isSystem = m.sender_type === 'system';
          const isInternalMsg = m.is_internal;

          if (isSystem) {
            return (
              <div key={m.id} className="text-center">
                <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                  {m.content}
                </span>
              </div>
            );          }

          return (
            <div key={m.id} className={cn('flex', isOwn ? 'justify-start' : 'justify-end')}>
              <div className={cn('max-w-[75%] space-y-1')}>
                {!isOwn && (
                  <p className="text-xs text-gray-500 px-1">
                    {m.sender_type === 'staff' ? 'الدعم الفني' : 'العميل'}
                  </p>
                )}
                <div
                  className={cn(
                    'rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line',
                    isInternalMsg
                      ? 'bg-amber-50 text-amber-900 border border-amber-100'
                      : isOwn
                        ? 'bg-nados-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                  )}
                >
                  {isInternalMsg && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 mb-1">
                      <Lock className="h-3 w-3" />
                      ملاحظة داخلية
                    </span>
                  )}
                  {m.content}
                </div>
                <p className="text-[10px] text-gray-400 px-1">
                  {new Date(m.created_at).toLocaleString('ar-IQ')}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />

        {typingUsers.size > 0 && (
          <p className="text-xs text-gray-400 italic">
            {Array.from(typingUsers.values()).join('، ')} يكتب...
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-100 p-3 space-y-2">
        {isStaff && (
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              ملاحظة داخلية (لا تظهر للعميل)
            </span>
          </label>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="اكتب رسالتك..."
            rows={2}
            className="flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" disabled={!input.trim() || isPending} size="icon">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
