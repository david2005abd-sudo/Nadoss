import Link from 'next/link';
import { ArrowRight, Briefcase, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatIQD } from '@/lib/utils';
import { ServiceCategoryCreateForm } from '@/components/dashboard/service-category-form';
import { ServiceCategoryRowActions } from '@/components/dashboard/service-category-row-actions';

export default async function ServiceCategoriesPage() {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const { data: services } = await supabase
    .from('service_categories')
    .select('id, name_ar, name_en, slug, duration_minutes, price_iqd, color, is_active')
    .eq('tenant_id', membership!.tenant_id)
    .is('deleted_at', null)
    .order('name_ar');

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
        <h1 className="mt-2 text-2xl font-bold text-gray-900">الخدمات</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          إدارة الخدمات المتاحة للحجز
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          {services && services.length > 0 ? (
            <div className="space-y-2">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{s.name_ar}</p>
                      <p className="text-xs text-gray-500">
                        {s.duration_minutes} دقيقة — {formatIQD(s.price_iqd)}
                        {!s.is_active && ' · معطّل'}
                      </p>
                    </div>
                  </div>
                  <ServiceCategoryRowActions id={s.id} name={s.name_ar} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-gray-500">لا توجد خدمات</p>
            </div>
          )}
        </div>

        <ServiceCategoryCreateForm />
      </div>
    </div>
  );
}
