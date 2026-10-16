import Link from 'next/link';
import { Users, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatIQD } from '@/lib/utils';

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  let query = supabase
    .from('customers')
    .select('id, name, phone, city, total_orders, total_spent_iqd, created_at, iraq_governorates(name_ar)')
    .eq('tenant_id', membership!.tenant_id)
    .is('deleted_at', null)
    .order('total_spent_iqd', { ascending: false });

  if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);

  const { data: customers } = await query.limit(200);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">العملاء</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          قائمة عملائك مع سجل الشراء
        </p>
      </div>

      <form>
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="ابحث بالاسم أو الهاتف..."
            className="w-full rounded-lg border border-gray-300 bg-white pr-9 pl-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
          />
        </div>
      </form>

      {customers && customers.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">الاسم</th>
                  <th className="px-4 py-3 text-right font-medium">الهاتف</th>
                  <th className="px-4 py-3 text-right font-medium">المحافظة</th>
                  <th className="px-4 py-3 text-right font-medium">الطلبات</th>
                  <th className="px-4 py-3 text-right font-medium">إجمالي الشراء</th>
                  <th className="px-4 py-3 text-right font-medium">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((c) => {
                  const gov = c.iraq_governorates as unknown as { name_ar: string } | null;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{c.name ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <a href={`tel:${c.phone}`} className="hover:text-nados-primary">
                          {c.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{gov?.name_ar ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-900">{c.total_orders}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                        {formatIQD(c.total_spent_iqd)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(c.created_at).toLocaleDateString('ar-IQ')}
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
          <Users className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-gray-500">
            {q ? 'لا يوجد عملاء مطابقون' : 'لا يوجد عملاء بعد'}
          </p>
        </div>
      )}
    </div>
  );
}
