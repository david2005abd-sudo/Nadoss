'use client';

import Link from 'next/link';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { useStore } from '@/lib/supabase/use-store';

export default function DashboardPage() {
  const store = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">نظرة عامة</h1>
        <p className="mt-1 text-sm text-gray-500">ملخص أداء متجرك</p>
      </div>

      {!store.loading && !store.tenantId && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">لم تسجّل الدخول بعد</h2>
          <p className="mt-1 text-sm text-amber-800">
            سجّل الدخول لعرض إحصائيات متجرك، أو أنشئ متجرًا جديدًا مجانًا.
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href="/login"
              className="rounded-lg bg-nados-primary px-4 py-2 text-sm font-medium text-white hover:bg-nados-primary-dark"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              إنشاء متجر مجاني
            </Link>
          </div>
        </div>
      )}

      <DashboardStats />
    </div>
  );
}
