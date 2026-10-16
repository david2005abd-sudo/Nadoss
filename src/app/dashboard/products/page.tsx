import Link from 'next/link';
import { formatIQD } from '@/lib/utils';
import { Package, Plus, Search } from 'lucide-react';

export const dynamic = process.env.NEXT_EXPORT === 'true' ? 'force-static' : 'force-dynamic';

export const metadata = { title: 'المنتجات' };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const products: {
    id: string;
    name_ar: string;
    name: string;
    price_iqd: number;
    stock: number;
    is_active: boolean;
    is_featured: boolean;
  }[] = [];
  const error: string | null = null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المنتجات</h1>
          <p className="mt-0.5 text-sm text-gray-500">إدارة كتالوج منتجاتك والمخزون</p>
        </div>
        <button
          disabled
          className="inline-flex items-center gap-2 rounded-lg bg-nados-primary px-4 py-2.5 text-sm font-medium text-white opacity-60"
          title="يتطلب تهيئة قاعدة البيانات"
        >
          <Plus className="h-4 w-4" />
          منتج جديد
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <form className="max-w-md">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="ابحث عن منتج..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
          />
        </div>
      </form>

      {products.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 text-right font-medium">المنتج</th>
                <th className="px-4 py-3 text-right font-medium">السعر</th>
                <th className="px-4 py-3 text-right font-medium">المخزون</th>
                <th className="px-4 py-3 text-right font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.name_ar || p.name}</p>
                    {p.is_featured && <span className="text-xs text-amber-600">مميز</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    {formatIQD(p.price_iqd)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.stock === 0
                          ? 'bg-red-50 text-red-700'
                          : p.stock <= 5
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {p.stock} قطعة
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p.is_active ? 'نشط' : 'معطّل'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-gray-500">
            {q || status ? 'لا توجد منتجات مطابقة' : 'لم تضف أي منتجات بعد'}
          </p>
        </div>
      )}
    </div>
  );
}
