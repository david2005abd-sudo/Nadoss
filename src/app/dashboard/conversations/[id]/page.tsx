import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Sparkles, Bot, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, channel, phone, status, customer_id, customers(name)')
    .eq('id', id)
    .eq('tenant_id', membership!.tenant_id)
    .maybeSingle();

  if (!conversation) notFound();

  const { data: messages } = await supabase
    .from('messages')
    .select('id, direction, sender_type, content, content_type, ai_extraction, created_at')
    .eq('conversation_id', id)
    .eq('tenant_id', membership!.tenant_id)
    .order('created_at', { ascending: true })
    .limit(200);

  const { data: linkedOrders } = await supabase
    .from('orders')
    .select('id, order_number, status, total_iqd, created_at, source')
    .eq('tenant_id', membership!.tenant_id)
    .in(
      'id',
      (
        await supabase
          .from('ai_extractions')
          .select('order_id')
          .eq('conversation_id', id)
          .not('order_id', 'is', null)
      ).data?.map((e) => e.order_id) ?? []
    );

  const customer = conversation.customers as unknown as { name: string | null } | null;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/dashboard/conversations"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-nados-primary"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للمحادثات
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {customer?.name ?? conversation.phone ?? 'عميل'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {conversation.phone} — {conversation.channel}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {(messages ?? []).map((m) => {
            const isCustomer = m.sender_type === 'customer';
            return (
              <div
                key={m.id}
                className={`flex gap-2 ${isCustomer ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isCustomer ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {isCustomer ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[75%] ${isCustomer ? '' : 'text-left'}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line ${
                      isCustomer
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-blue-50 text-gray-900'
                    }`}
                  >
                    {m.content}
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">
                    {new Date(m.created_at).toLocaleString('ar-IQ')}
                  </p>
                  {m.ai_extraction && (
                    <details className="mt-1 text-[10px] text-gray-400">
                      <summary className="cursor-pointer inline-flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        تفاصيل الاستخراج
                      </summary>
                      <pre className="mt-1 overflow-x-auto rounded bg-gray-50 p-2 text-right" dir="ltr">
                        {JSON.stringify(m.ai_extraction, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <aside className="space-y-5">
          <section className="rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="font-semibold text-gray-900 mb-3">الطلبات المرتبطة</h2>
            {linkedOrders && linkedOrders.length > 0 ? (
              <div className="space-y-2">
                {linkedOrders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/dashboard/orders/${o.id}`}
                    className="block rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {o.order_number}
                      </span>
                      <span className="text-xs text-gray-500">{o.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">لا طلبات مرتبطة</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
