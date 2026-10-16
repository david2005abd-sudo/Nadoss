'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Clock, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { updateTicketStatusAction, type TicketActionState } from '@/app/dashboard/support/actions';
import { Button } from '@/components/ui/button';
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  SLA_TARGETS_HOURS,
} from '@/lib/validations/support';

const initialState: TicketActionState = {};

export function TicketSidebar({
  ticketId,
  status,
  priority,
  category,
  slaDueAt,
  slaBreached,
  relatedOrderId,
  isStaff,
}: {
  ticketId: string;
  status: string;
  priority: string;
  category: string;
  slaDueAt: string | null;
  slaBreached: boolean;
  relatedOrderId: string | null;
  isStaff: boolean;
}) {
  const [state, formAction, isPending] = useActionState(updateTicketStatusAction, initialState);

  const slaHours = SLA_TARGETS_HOURS[priority] ?? 24;
  const slaRemaining = slaDueAt
    ? new Date(slaDueAt).getTime() - Date.now()
    : null;
  const slaRemainingHours = slaRemaining !== null ? Math.round(slaRemaining / (1000 * 60 * 60)) : null;

  return (
    <aside className="space-y-5">
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h3 className="font-semibold text-gray-900 mb-3">التفاصيل</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">التصنيف</dt>
            <dd className="text-gray-900">{TICKET_CATEGORY_LABELS[category] ?? category}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">الأولوية</dt>
            <dd className="text-gray-900">{TICKET_PRIORITY_LABELS[priority] ?? priority}</dd>
          </div>
          {relatedOrderId && (
            <div className="flex justify-between">
              <dt className="text-gray-500">الطلب المرتبط</dt>
              <dd>
                <Link
                  href={`/dashboard/orders/${relatedOrderId}`}
                  className="text-nados-primary hover:underline inline-flex items-center gap-1"
                >
                  عرض
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          اتفاقية مستوى الخدمة (SLA)
        </h3>
        <p className="text-xs text-gray-500 mb-2">
          الهدف: استجابة خلال {slaHours} ساعة
        </p>
        {slaRemainingHours !== null && ['open', 'in_progress', 'waiting'].includes(status) ? (
          slaBreached ? (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-800">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>تجاوزنا الوقت المستهدف. الفريق يعمل على تذكرتك بأولوية.</span>
            </div>
          ) : slaRemainingHours <= 0 ? (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-800">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>انتهى الوقت المستهدف</span>
            </div>
          ) : slaRemainingHours < 4 ? (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800">
              <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>متبقٍ {slaRemainingHours} ساعة</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-xs text-green-800">
              <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>متبقٍ {slaRemainingHours} ساعة</span>
            </div>
          )
        ) : (
          <p className="text-xs text-gray-400">تم الحل</p>
        )}
      </section>

      {isStaff && ['open', 'in_progress', 'waiting'].includes(status) && (
        <section className="rounded-xl border border-gray-100 bg-white p-5">
          <h3 className="font-semibold text-gray-900 mb-3">إجراءات</h3>

          {state.error && (
            <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <form action={formAction}>
              <input type="hidden" name="ticketId" value={ticketId} />
              <input type="hidden" name="newStatus" value="resolved" />
              <Button type="submit" variant="secondary" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                وضع علامة &quot;تم الحل&quot;
              </Button>
            </form>
            <form action={formAction}>
              <input type="hidden" name="ticketId" value={ticketId} />
              <input type="hidden" name="newStatus" value="closed" />
              <Button type="submit" variant="ghost" className="w-full" disabled={isPending}>
                إغلاق التذكرة
              </Button>
            </form>
          </div>
        </section>
      )}
    </aside>
  );
}
