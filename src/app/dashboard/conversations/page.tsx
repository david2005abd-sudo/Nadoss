import Link from 'next/link';
import { MessageSquare, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  let query = supabase
    .from('conversations')
    .select('id, channel, phone, status, last_message_at, customer_id')
    .eq('tenant_id', membership!.tenant_id)
    .order('last_message_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (q) query = query.or(`phone.ilike.%${q}%`);

  const { data: conversations } = await query.limit(100);

  // Fetch last message per conversation
  const ids = (conversations ?? []).map((c) => c.id);
  const { data: lastMessages } = ids.length
    ? await supabase
        .from('messages')
        .select('conversation_id, content, sender_type, created_at')
        .in('conversation_id', ids)
        .order('created_at', { ascending: false })
    : { data: [] };

  const lastByConv = new Map<string, { content: string | null; sender_type: string }>();
  for (const m of lastMessages ?? []) {
    if (!lastByConv.has(m.conversation_id)) {
      lastByConv.set(m.conversation_id, {
        content: m.content,
        sender_type: m.sender_type,
      });
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">المحادثات</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          رسائل واتساب الواردة وتحويلات البوت إلى طلبات
        </p>
      </div>

      <form>
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="ابحث برقم الهاتف..."
            className="w-full rounded-lg border border-gray-300 bg-white pr-9 pl-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
          />
        </div>
      </form>

      {conversations && conversations.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white divide-y divide-gray-50">
          {conversations.map((c) => {
            const last = lastByConv.get(c.id);
            return (
              <Link
                key={c.id}
                href={`/dashboard/conversations/${c.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{c.phone ?? '—'}</span>
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                      {c.channel}
                    </span>
                    {c.status === 'closed' && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        مغلقة
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {last
                      ? `${last.sender_type === 'customer' ? '' : '📤 '}${last.content?.slice(0, 80) ?? ''}`
                      : 'لا رسائل'}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {c.last_message_at
                    ? new Date(c.last_message_at).toLocaleDateString('ar-IQ', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-gray-500">لا توجد محادثات بعد</p>
        </div>
      )}
    </div>
  );
}
