import Link from 'next/link';
import { CalendarDays, Plus, Search, List, LayoutGrid } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { BookingStatusBadge } from '@/components/dashboard/booking-status-badge';
import { BOOKING_STATUS_LABELS } from '@/lib/validations/booking';

const STATUS_FILTERS = [
  { v: '', l: 'الكل' },
  { v: 'pending', l: 'بانتظار' },
  { v: 'confirmed', l: 'مؤكد' },
  { v: 'in_progress', l: 'جارٍ' },
  { v: 'completed', l: 'مكتمل' },
  { v: 'cancelled', l: 'ملغي' },
];

const RANGE_FILTERS = [
  { v: 'today', l: 'اليوم' },
  { v: 'week', l: 'هذا الأسبوع' },
  { v: 'month', l: 'هذا الشهر' },
  { v: 'all', l: 'الكل' },
];

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; range?: string }>;
}) {
  const { status, q, range = 'today' } = await searchParams;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const tenantId = membership!.tenant_id;

  let query = supabase
    .from('bookings')
    .select(
      'id, booking_number, customer_name, customer_phone, scheduled_at, duration_minutes, status, source, price_iqd, service_categories(name_ar, color), staff_members(name)'
    )
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('scheduled_at', { ascending: true });

  // Range filter
  const now = new Date();
  if (range === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    query = query.gte('scheduled_at', start).lt('scheduled_at', end);
  } else if (range === 'week') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString();
    query = query.gte('scheduled_at', start).lt('scheduled_at', end);
  } else if (range === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
    query = query.gte('scheduled_at', start).lt('scheduled_at', end);
  }

  if (status) query = query.eq('status', status);
  if (q) {
    query = query.or(`customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,booking_number.ilike.%${q}%`);
  }

  const { data: bookings } = await query.limit(200);

  // Stats for header
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const { count: todayCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('scheduled_at', todayStart)
    .lt('scheduled_at', todayEnd)
    .is('deleted_at', null)
    .in('status', ['pending', 'confirmed', 'in_progress']);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الحجوزات والمواعيد</h1>
          <p className="text-sm text-gray-500 mt-0.5">            {todayCount ?? 0} موعد اليوم · إدارة كاملة للمواعيد
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/bookings/calendar">
            <Button variant="outline">
              <LayoutGrid className="h-4 w-4" />
              عرض التقويم
            </Button>
          </Link>
          <Link href="/dashboard/bookings/new">
            <Button>
              <Plus className="h-4 w-4" />
              حجز جديد
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form className="flex-1 min-w-60">
          {status && <input type="hidden" name="status" value={status} />}
          {range && <input type="hidden" name="range" value={range} />}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="ابحث بالاسم أو الهاتف أو رقم الحجز..."
              className="w-full rounded-lg border border-gray-300 bg-white pr-9 pl-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
            />
          </div>
        </form>

        <div className="flex gap-1 text-sm">
          {RANGE_FILTERS.map((opt) => (
            <Link
              key={opt.v}
              href={`/dashboard/bookings?range=${opt.v}${status ? `&status=${status}` : ''}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                range === opt.v
                  ? 'bg-nados-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.l}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex gap-1 flex-wrap">
        {STATUS_FILTERS.map((opt) => (
          <Link
            key={opt.v}
            href={`/dashboard/bookings?range=${range}${opt.v ? `&status=${opt.v}` : ''}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              (status ?? '') === opt.v
                ? 'bg-nados-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {opt.l}
          </Link>
        ))}
      </div>

      {bookings && bookings.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">الموعد</th>
                  <th className="px-4 py-3 text-right font-medium">العميل</th>
                  <th className="px-4 py-3 text-right font-medium">الخدمة</th>
                  <th className="px-4 py-3 text-right font-medium">الموظف</th>
                  <th className="px-4 py-3 text-right font-medium">المدة</th>
                  <th className="px-4 py-3 text-right font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b) => {
                  const service = b.service_categories as unknown as { name_ar: string; color: string } | null;
                  const staff = b.staff_members as unknown as { name: string } | null;
                  const dt = new Date(b.scheduled_at);
                  const isToday = dt.toDateString() === now.toDateString();
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/bookings/${b.id}`}
                          className="font-medium text-gray-900 hover:text-nados-primary block"
                        >
                          {dt.toLocaleDateString('ar-IQ', { weekday: 'short', day: 'numeric', month: 'short' })}
                          {isToday && (
                            <span className="mr-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">
                              اليوم
                            </span>
                          )}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {dt.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900">{b.customer_name}</p>
                        <p className="text-xs text-gray-500">{b.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-gray-700"
                        >
                          {service && (
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: service.color }}
                            />
                          )}
                          {service?.name_ar ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{staff?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{b.duration_minutes} د</td>
                      <td className="px-4 py-3">
                        <BookingStatusBadge status={b.status} />
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
          <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-gray-500">
            {status || q ? 'لا توجد حجوزات مطابقة' : 'لا توجد حجوزات في هذه الفترة'}
          </p>
          <Link href="/dashboard/bookings/new" className="mt-4 inline-block">
            <Button>
              <Plus className="h-4 w-4" />
              إنشاء حجز
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
