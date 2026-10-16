import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StaffCreateForm } from '@/components/dashboard/staff-form';

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const { data: staff } = await supabase
    .from('staff_members')
    .select('id, name, phone, role, is_active')
    .eq('tenant_id', membership!.tenant_id)
    .order('name');

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
        <h1 className="mt-2 text-2xl font-bold text-gray-900">الموظفون</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          الفريق المسؤول عن تقديم الخدمات
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          {staff && staff.length > 0 ? (
            <div className="space-y-2">
              {staff.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">
                      {s.role ?? 'موظف'} {s.phone && `· ${s.phone}`}
                      {!s.is_active && ' · معطّل'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-gray-500">لا يوجد موظفون</p>
            </div>
          )}
        </div>

        <StaffCreateForm />
      </div>
    </div>
  );
}
