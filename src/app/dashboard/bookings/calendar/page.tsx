import Link from 'next/link';
import { ArrowRight, List } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { BookingCalendar } from '@/components/dashboard/booking-calendar';

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const tenantId = membership!.tenant_id;

  // Compute week start (Sunday)
  const baseDate = week ? new Date(week) : new Date();
  const weekStart = new Date(baseDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const { data: bookings } = await supabase
    .from('bookings')
    .select(
      'id, booking_number, customer_name, customer_phone, scheduled_at, duration_minutes, status, service_categories(name_ar, color), staff_members(name)'
    )
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .gte('scheduled_at', weekStart.toISOString())
    .lt('scheduled_at', weekEnd.toISOString())
    .in('status', ['pending', 'confirmed', 'in_progress', 'completed'])
    .order('scheduled_at');

  const prevWeek = new Date(weekStart);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-nados-primary"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للحجوزات
        </Link>
        <div className="mt-2 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">عرض التقويم</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {weekStart.toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long' })} —{' '}
              {new Date(weekEnd.getTime() - 1).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long' })}
            </p>
          </div>
          <Link href="/dashboard/bookings">
            <Button variant="outline">
              <List className="h-4 w-4" />
              عرض القائمة
            </Button>
          </Link>
        </div>
      </div>

      <BookingCalendar
        weekStart={weekStart.toISOString()}
        bookings={(bookings ?? []) as never}
      />

      <div className="flex items-center justify-between">
        <Link href={`/dashboard/bookings/calendar?week=${prevWeek.toISOString().split('T')[0]}`}>
          <Button variant="outline">← الأسبوع السابق</Button>
        </Link>
        <Link href="/dashboard/bookings/calendar">
          <Button variant="ghost">هذا الأسبوع</Button>
        </Link>
        <Link href={`/dashboard/bookings/calendar?week=${nextWeek.toISOString().split('T')[0]}`}>
          <Button variant="outline">الأسبوع التالي →</Button>
        </Link>
      </div>
    </div>
  );
}
