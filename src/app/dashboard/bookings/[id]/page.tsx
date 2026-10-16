import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Calendar, Clock, User, Phone, MapPin, DollarSign, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatIQD } from '@/lib/utils';
import { BookingStatusBadge } from '@/components/dashboard/booking-status-badge';
import { BookingStatusUpdater } from '@/components/dashboard/booking-status-updater';
import { RescheduleForm } from '@/components/dashboard/reschedule-form';
import { BOOKING_STATUS_TRANSITIONS } from '@/lib/validations/booking';

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .limit(1)
    .single();

  const { data: booking } = await supabase
    .from('bookings')
    .select(
      `id, booking_number, customer_name, customer_phone, scheduled_at, duration_minutes,
       status, notes, price_iqd, payment_status, source, created_at, updated_at,
       service_categories(name_ar, color, duration_minutes, price_iqd),
       staff_members(name, phone),
       customers(id)`
    )
    .eq('id', id)
    .eq('tenant_id', membership!.tenant_id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!booking) notFound();

  const service = booking.service_categories as unknown as { name_ar: string; color: string } | null;
  const staff = booking.staff_members as unknown as { name: string; phone: string | null } | null;
  const allowed = BOOKING_STATUS_TRANSITIONS[booking.status] ?? [];
  const dt = new Date(booking.scheduled_at);

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
            <h1 className="text-2xl font-bold text-gray-900">{booking.booking_number}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {dt.toLocaleDateString('ar-IQ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}{' '}
              — {dt.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <section className="rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
              <Calendar className="h-4 w-4" />
              تفاصيل الموعد
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="flex items-center gap-2 text-gray-500">
                  <Clock className="h-4 w-4" />
                  المدة
                </dt>
                <dd className="font-medium text-gray-900">{booking.duration_minutes} دقيقة</dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex items-center gap-2 text-gray-500">
                  الخدمة
                </dt>
                <dd className="flex items-center gap-1.5 font-medium text-gray-900">
                  {service && (
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: service.color }}
                    />
                  )}
                  {service?.name_ar ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex items-center gap-2 text-gray-500">
                  <User className="h-4 w-4" />
                  الموظف
                </dt>
                <dd className="font-medium text-gray-900">{staff?.name ?? 'غير محدد'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex items-center gap-2 text-gray-500">
                  <DollarSign className="h-4 w-4" />
                  السعر
                </dt>
                <dd className="font-bold text-nados-primary">{formatIQD(booking.price_iqd)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex items-center gap-2 text-gray-500">
                  حالة الدفع
                </dt>
                <dd
                  className={`font-medium ${
                    booking.payment_status === 'paid' ? 'text-green-700' : 'text-gray-600'
                  }`}
                >
                  {{
                    pending: 'معلّق',
                    paid: 'مدفوع',
                    refunded: 'مُرجع',
                  }[booking.payment_status] ?? booking.payment_status}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
              <User className="h-4 w-4" />
              العميل
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{booking.customer_name}</p>
              <a
                href={`tel:${booking.customer_phone}`}
                className="flex items-center gap-2 text-gray-600 hover:text-nados-primary"
              >
                <Phone className="h-3.5 w-3.5" />
                {booking.customer_phone}
              </a>
              <a
                href={`https://wa.me/${booking.customer_phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
              >
                واتساب
              </a>
            </div>
          </section>

          {booking.notes && (
            <section className="rounded-xl border border-gray-100 bg-white p-5">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                <FileText className="h-4 w-4" />
                ملاحظات
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-line">{booking.notes}</p>
            </section>
          )}
        </div>

        <aside className="space-y-5">
          <BookingStatusUpdater
            bookingId={booking.id}
            currentStatus={booking.status}
            allowed={allowed}
          />

          {['pending', 'confirmed'].includes(booking.status) && (
            <RescheduleForm
              bookingId={booking.id}
              currentScheduledAt={booking.scheduled_at}
              currentDuration={booking.duration_minutes}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
