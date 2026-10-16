import Link from 'next/link';
import { formatIQD } from '@/lib/utils';
import { ShoppingCart, Search } from 'lucide-react';

export const dynamic = process.env.NEXT_EXPORT === 'true' ? 'force-static' : 'force-dynamic';

export const metadata = { title: 'الطلبات' };

const STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة',
  pending: 'بانتظار',
  confirmed: 'مؤكد',
  preparing: 'يُحضَّر',
  ready: 'جاهز',
  shipped: 'مشحون',
  delivered: 'مُسلَّم',
  cancelled: 'ملغي',
  returned: 'مرتجع',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  preparing: 'bg-indigo-50 text-indigo-700',
  ready: 'bg-purple-50 text-purple-700',
  shipped: 'bg-cyan-50 text-cyan-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  returned: 'bg-orange-50 text-orange-700',
};

const STATUS_FILTERS = [
  { v: '', l: 'الكل' },
  { v: 'pending', l: 'بانتظار' },
  { v: 'confirmed', l: 'مؤكد' },
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

  const orders: {
    id: string;
    order_number: string;
    status: string;
    payment_method: string;
    total_iqd: number;
    created_at: string;
  }[] = [];
  const error: string | null = null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الطلبات</h1>
        <p className="mt-0.5 text-sm text-gray-500">متابعة وإدارة جميع الطلبات</p>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <form className="min-w-60 flex-1">
          {status && <input type="hidden" name="status" value={status} />}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="ابحث برقم الطلب..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
            />
          </div>
        </form>

        <div className="flex flex-wrap gap-1 text-sm">
          {STATUS_FILTERS.map((opt) => (
            <Link
              key={opt.v}
              href={
                opt.v
                  ? `/dashboard/orders?status=${opt.v}`
                  : '/dashboard/orders'
              }
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                (status ?? '') === opt.v
                  ? 'bg-nados-primary text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.l}
            </Link>
          ))}
        </div>
      </div>

      {orders.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">رقم الطلب</th>
                  <th className="px-4 py-3 text-right font-medium">الدفع</th>
                  <th className="px-4 py-3 text-right font-medium">الإجمالي</th>
                  <th className="px-4 py-3 text-right font-medium">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{o.order_number}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{o.payment_method ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900">
                      {formatIQD(o.total_iqd)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                      {new Date(o.created_at).toLocaleDateString('ar-IQ')}
                    </td>
                  </tr>
                ))}
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
