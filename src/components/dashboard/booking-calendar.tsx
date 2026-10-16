import Link from 'next/link';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from '@/lib/validations/booking';

interface BookingRow {
  id: string;
  booking_number: string;
  customer_name: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  service_categories: { name_ar: string; color: string } | null;
  staff_members: { name: string } | null;
}

const HOUR_START = 8;
const HOUR_END = 22;

export function BookingCalendar({
  weekStart,
  bookings,
}: {
  weekStart: string;
  bookings: BookingRow[];
}) {
  const start = new Date(weekStart);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

  // Group bookings by day + hour
  const bySlot = new Map<string, BookingRow[]>();
  for (const b of bookings) {
    const d = new Date(b.scheduled_at);
    const key = `${d.toDateString()}-${d.getHours()}`;
    const arr = bySlot.get(key) ?? [];
    arr.push(b);
    bySlot.set(key, arr);
  }

  const todayStr = new Date().toDateString();

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
      <div className="min-w-[900px]">
        {/* Header row: days */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-100">
          <div className="border-l border-gray-100 px-3 py-3 text-xs font-medium text-gray-500">
            الساعة
          </div>
          {days.map((d) => {
            const isToday = d.toDateString() === todayStr;
            return (
              <div
                key={d.toISOString()}
                className={`border-l border-gray-100 px-3 py-3 text-center ${
                  isToday ? 'bg-blue-50/40' : ''
                }`}
              >
                <p className={`text-xs font-medium ${isToday ? 'text-nados-primary' : 'text-gray-500'}`}>
                  {d.toLocaleDateString('ar-IQ', { weekday: 'short' })}
                </p>
                <p className={`mt-0.5 text-sm font-bold ${isToday ? 'text-nados-primary' : 'text-gray-900'}`}>
                  {d.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Hour rows */}
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-50 last:border-b-0">
            <div className="border-l border-gray-100 bg-gray-50/40 px-3 py-2 text-xs text-gray-500 font-mono text-center">
              {String(hour).padStart(2, '0')}:00
            </div>
            {days.map((d) => {
              const key = `${d.toDateString()}-${hour}`;
              const items = bySlot.get(key) ?? [];
              const isToday = d.toDateString() === todayStr;

              return (
                <div
                  key={key}
                  className={`min-h-[60px] border-l border-gray-100 p-1 space-y-1 ${
                    isToday ? 'bg-blue-50/20' : ''
                  }`}
                >
                  {items.map((b) => {
                    const svc = b.service_categories;
                    return (
                      <Link
                        key={b.id}
                        href={`/dashboard/bookings/${b.id}`}
                        className={`block rounded-md px-2 py-1 text-xs leading-tight hover:opacity-90 transition-opacity ${
                          BOOKING_STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-700'
                        }`}
                        style={{
                          borderRight: svc ? `3px solid ${svc.color}` : undefined,
                        }}
                        title={`${b.customer_name} — ${svc?.name_ar ?? ''} (${BOOKING_STATUS_LABELS[b.status]})`}
                      >
                        <p className="font-medium truncate">
                          {new Date(b.scheduled_at).toLocaleTimeString('ar-IQ', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          {b.customer_name}
                        </p>
                        <p className="truncate opacity-80">{svc?.name_ar}</p>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
