import Link from 'next/link';
import { ShoppingCart, Plus, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatIQD } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/dashboard/order-status-badge';

const STATUS_FILTERS = [
  { v: '', l: 'الكل' },
  { v: 'pending', l: 'بانتظار' },
  { v: 'confirmed', l: 'مؤكد' },
  { v: 'preparing', l: 'يُحضَّر' },
  { v: 'shipped', l: 'مشحون' },
  { v: 'delivered', l: 'مُسلَّم' },
  { v: 'cancelled', l: 'ملغي' },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const tenantId = membership!.tenant_id;

  let query = supabase
    .from('orders')
    .select(
      'id, order_number, status, payment_method, payment_status, total_iqd, source, created_at, customers(name, phone), iraq_governorates(name_ar)'
    )
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (q) query = query.ilike('order_number', `%${q}%`);

  const { data: orders } = await query.limit(100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الطلبات</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            متابعة وإدارة جميع الطلبات
          </p>
        </div>
        <Link href="/dashboard/orders/new">
          <Button>
            <Plus className="h-4 w-4" />
            طلب يدوي
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form className="flex-1 min-w-60">
          {status && <input type="hidden" name="status" value={status} />}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="ابحث برقم الطلب..."
              className="w-full rounded-lg border border-gray-300 bg-white pr-9 pl-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
            />
          </div>
        </form>

        <div className="flex gap-1 text-sm flex-wrap">
          {STATUS_FILTERS.map((opt) => (
            <Link
              key={opt.v}
              href={
                opt.v
                  ? `/dashboard/orders?status=${opt.v}${q ? `&q=${q}` : ''}`
                  : `/dashboard/orders${q ? `?q=${q}` : ''}`
              }
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                (status ?? '') === opt.v
                  ? 'bg-nados-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.l}
            </Link>
          ))}
        </div>
      </div>

      {orders && orders.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">رقم الطلب</th>
                  <th className="px-4 py-3 text-right font-medium">العميل</th>
                  <th className="px-4 py-3 text-right font-medium">المحافظة</th>
                  <th className="px-4 py-3 text-right font-medium">الدفع</th>
                  <th className="px-4 py-3 text-right font-medium">الإجمالي</th>
                  <th className="px-4 py-3 text-right font-medium">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o) => {
                  const customer = o.customers as unknown as { name: string | null; phone: string } | null;
                  const gov = o.iraq_governorates as unknown as { name_ar: string } | null;
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/orders/${o.id}`}
                          className="font-medium text-gray-900 hover:text-nados-primary"
                        >
                          {o.order_number}
                        </Link>
                        {o.source !== 'manual' && (
                          <span className="mr-2 rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">
                            {o.source === 'store' ? 'متجر' : o.source}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900">{customer?.name ?? '—'}</p>
                        <p className="text-xs text-gray-500">{customer?.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{gov?.name_ar ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600">
                          {paymentLabel(o.payment_method)}
                        </span>
                        <span
                          className={`mr-2 inline-block rounded-full px-2 py-0.5 text-xs ${
                            o.payment_status === 'paid'
                              ? 'bg-green-50 text-green-700'
                              : o.payment_status === 'failed'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {paymentStatusLabel(o.payment_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                        {formatIQD(o.total_iqd)}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(o.created_at).toLocaleDateString('ar-IQ', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
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
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-gray-500">
            {status || q ? 'لا توجد طلبات مطابقة' : 'لا توجد طلبات بعد'}
          </p>
        </div>
      )}
    </div>
  );
}

function paymentLabel(m: string) {
  return (
    { cod: 'COD', zaincash: 'زين كاش', fib: 'FIB', qicard: 'كي كارد', nasspay: 'ناس باي' } as Record<string, string>
  )[m] ?? m;
}

function paymentStatusLabel(s: string) {
  return (
    { pending: 'معلّق', paid: 'مدفوع', failed: 'فشل', refunded: 'مُرجَع' } as Record<string, string>
  )[s] ?? s;
}
