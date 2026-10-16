import { notFound } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { BookingWizard } from '@/components/store/booking-wizard';

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('public_storefronts')
    .select('id, name, slug, phone')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!tenant) notFound();

  const [{ data: services }, { data: staff }] = await Promise.all([
    supabase
      .from('service_categories')
      .select('id, name_ar, duration_minutes, price_iqd, color')
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name_ar'),
    supabase
      .from('staff_members')
      .select('id, name')
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)
      .order('name'),
  ]);

  if (!services || services.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
        <h1 className="mt-4 text-xl font-bold text-gray-900">الحجز غير متاح حاليًا</h1>
        <p className="mt-2 text-sm text-gray-500">
          {tenant.name} لم تضف خدمات بعد
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="text-center py-6">
        <h1 className="text-3xl font-bold text-gray-900">احجز موعدك</h1>
        <p className="mt-2 text-gray-600">اختر الخدمة والوقت المناسبين — في خطوات بسيطة</p>
      </header>

      <BookingWizard
        tenantSlug={slug}
        tenantName={tenant.name}
        services={services}
        staff={staff ?? []}
      />
    </div>
  );
}
