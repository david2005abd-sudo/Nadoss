import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { BookingForm } from '@/components/dashboard/booking-form';

export default async function NewBookingPage() {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const tenantId = membership!.tenant_id;

  const [{ data: services }, { data: staff }] = await Promise.all([
    supabase
      .from('service_categories')
      .select('id, name_ar, duration_minutes, price_iqd, color')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name_ar'),
    supabase
      .from('staff_members')
      .select('id, name')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name'),
  ]);

  if (!services || services.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-10">
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">لا توجد خدمات</h2>
          <p className="mt-1 text-sm text-gray-500">
            يجب إضافة خدمة واحدة على الأقل قبل إنشاء الحجوزات
          </p>
          <Link
            href="/dashboard/bookings/services"
            className="mt-4 inline-block rounded-lg bg-nados-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            إدارة الخدمات
          </Link>
        </div>
      </div>
    );
  }

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
        <h1 className="mt-2 text-2xl font-bold text-gray-900">حجز جديد</h1>
      </div>

      <BookingForm services={services} staff={staff ?? []} />
    </div>
  );
}
