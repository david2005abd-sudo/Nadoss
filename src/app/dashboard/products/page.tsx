'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatIQD } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '@/lib/supabase/use-store';
import { Package, Plus, Search } from 'lucide-react';

export const dynamic = process.env.NEXT_EXPORT === 'true' ? 'force-static' : 'force-dynamic';

export const metadata = { title: 'المنتجات' };

type Product = {
  id: string;
  name_ar: string;
  name: string;
  price_iqd: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const store = useStore();
  const [params, setParams] = useState<{ q?: string; status?: string }>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void searchParams.then(setParams);
  }, [searchParams]);

  const { q, status } = params;

  useEffect(() => {
    if (!store.tenantId) return;
    let cancelled = false;

    async function load() {
      try {
        const supabase = createClient();
        let query = supabase
          .from('products')
          .select('id, name_ar, name, price_iqd, stock, is_active, is_featured')
          .eq('tenant_id', store.tenantId!)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (q) query = query.or(`name_ar.ilike.%${q}%,name.ilike.%${q}%`);
        if (status === 'active') query = query.eq('is_active', true);
        if (status === 'inactive') query = query.eq('is_active', false);
        if (status === 'low') query = query.lte('stock', 5);

        const { data, error: qError } = await query.limit(100);
        if (cancelled) return;
        if (qError) setError(qError.message);
        else setProducts(data ?? []);
      } catch {
        if (!cancelled) setError('تعذر تحميل المنتجات');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [store.tenantId, q, status]);

  const FILTERS = [
    { v: '', l: 'الكل' },
    { v: 'active', l: 'نشط' },
    { v: 'inactive', l: 'معطّل' },
    { v: 'low', l: 'مخزون منخفض' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المنتجات</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {store.loading ? 'جارٍ التحميل...' : `${products.length} منتج`}
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-nados-primary px-4 py-2 text-sm font-medium text-white hover:bg-nados-primary-dark"
        >
          <Plus className="h-4 w-4" />
          منتج جديد
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="ابحث عن منتج..."
            className="w-full rounded-lg border border-gray-200 py-2 pr-9 pl-3 text-sm focus:border-nados-primary focus:outline-none"
          />
        </form>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <Link
              key={f.v}
              href={`/dashboard/products${f.v ? `?status=${f.v}` : ''}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                (status ?? '') === f.v
                  ? 'bg-nados-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.l}
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
