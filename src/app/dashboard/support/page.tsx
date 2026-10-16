import Link from 'next/link';
import { LifeBuoy, Plus, Search, Clock, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { TicketStatusBadge } from '@/components/dashboard/ticket-status-badge';
import { TICKET_CATEGORY_LABELS, TICKET_PRIORITY_LABELS } from '@/lib/validations/support';

const STATUS_FILTERS = [
  { v: '', l: 'الكل' },
  { v: 'open', l: 'مفتوحة' },
  { v: 'in_progress', l: 'قيد المعالجة' },
  { v: 'waiting', l: 'بانتظار العميل' },
  { v: 'resolved', l: 'تم الحل' },
  { v: 'closed', l: 'مغلقة' },
];

export default async function SupportTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; category?: string; created?: string; updated?: string }>;
}) {
  const { status, q, category, created, updated } = await searchParams;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .limit(1)
    .single();

  const tenantId = membership!.tenant_id;

  let query = supabase
    .from('support_tickets')
    .select(
      'id, subject, status, priority, category, sla_due_at, sla_breached, last_activity_at, created_at, assigned_to, related_order_id'
    )
    .eq('tenant_id', tenantId)
    .order('last_activity_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (category) query = query.eq('category', category);
  if (q) query = query.ilike('subject', `%${q}%`);

  const { data: tickets } = await query.limit(100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الدعم الفني</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            تذاكر الدعم والتواصل مع الفريق
          </p>
        </div>
        <Link href="/dashboard/support/new">
          <Button>
            <Plus className="h-4 w-4" />
            تذكرة جديدة
          </Button>
        </Link>
      </div>

      {created && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          تم إنشاء التذكرة بنجاح
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <form className="flex-1 min-w-60">
          {status && <input type="hidden" name="status" value={status} />}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="ابحث في التذاكر..."
              className="w-full rounded-lg border border-gray-300 bg-white pr-9 pl-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
            />
          </div>
        </form>

        <div className="flex gap-1 text-sm flex-wrap">
          {STATUS_FILTERS.map((opt) => (
            <Link
              key={opt.v}
              href={opt.v ? `/dashboard/support?status=${opt.v}` : '/dashboard/support'}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                (status ?? '') === opt.v
                  ? 'bg-nados-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.l}
            </Link>
          ))}
        </div>
      </div>

      {tickets && tickets.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">الموضوع</th>
                  <th className="px-4 py-3 text-right font-medium">التصنيف</th>
                  <th className="px-4 py-3 text-right font-medium">الأولوية</th>
                  <th className="px-4 py-3 text-right font-medium">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium">SLA</th>
                  <th className="px-4 py-3 text-right font-medium">آخر نشاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tickets.map((t) => {
                  const slaUrgent =
                    t.sla_due_at &&
                    !t.sla_breached &&
                    ['open', 'in_progress', 'waiting'].includes(t.status) &&
                    new Date(t.sla_due_at).getTime() - Date.now() < 60 * 60 * 1000;
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/support/${t.id}`}
                          className="font-medium text-gray-900 hover:text-nados-primary truncate block max-w-md"
                        >
                          {t.subject}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {TICKET_CATEGORY_LABELS[t.category] ?? t.category}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            t.priority === 'urgent'
                              ? 'bg-red-50 text-red-700'
                              : t.priority === 'high'
                                ? 'bg-orange-50 text-orange-700'
                                : t.priority === 'medium'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {TICKET_PRIORITY_LABELS[t.priority] ?? t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <TicketStatusBadge status={t.status} />
                      </td>
                      <td className="px-4 py-3">
                        {t.sla_breached ? (
                          <span className="inline-flex items-center gap-1 text-xs text-red-700">
                            <AlertTriangle className="h-3 w-3" />
                            متأخرة
                          </span>
                        ) : slaUrgent ? (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                            <Clock className="h-3 w-3" />
                            قريبة
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">على الوقت</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(t.last_activity_at).toLocaleDateString('ar-IQ', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
          <LifeBuoy className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-gray-500">
            {status || q ? 'لا توجد تذاكر مطابقة' : 'لا توجد تذاكر بعد'}
          </p>
        </div>
      )}
    </div>
  );
}
