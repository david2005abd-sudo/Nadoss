import Link from 'next/link';
import { Plus, Package, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatIQD } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ProductRowActions } from '@/components/dashboard/product-row-actions';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; created?: string; updated?: string }>;
}) {
  const { q, status, created, updated } = await searchParams;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const tenantId = membership?.tenant_id;

  let query = supabase
    .from('products')
    .select('id, name_ar, name, price_iqd, stock, low_stock_threshold, images, is_active, is_featured, created_at, categories(name_ar)')
    .eq('tenant_id', tenantId!)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (q) query = query.or(`name_ar.ilike.%${q}%,name.ilike.%${q}%`);
  if (status === 'active') query = query.eq('is_active', true);
  if (status === 'inactive') query = query.eq('is_active', false);
  if (status === 'low') query = query.lte('stock', 5);

  const { data: products } = await query.limit(100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المنتجات</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            إدارة كتالوج منتجاتك والمخزون
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="h-4 w-4" />
            منتج جديد
          </Button>
        </Link>
      </div>

      {created && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          تم إنشاء المنتج بنجاح
        </div>
      )}
      {updated && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          تم تحديث المنتج
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <form className="flex-1 min-w-60">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="ابحث عن منتج..."
              className="w-full rounded-lg border border-gray-300 bg-white pr-9 pl-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
            />
          </div>
        </form>

        <div className="flex gap-1 text-sm">
          {[
            { v: '', l: 'الكل' },
            { v: 'active', l: 'نشط' },
            { v: 'inactive', l: 'معطّل' },
            { v: 'low', l: 'مخزون منخفض' },
          ].map((opt) => (
            <Link
              key={opt.v}
              href={opt.v ? `/dashboard/products?status=${opt.v}` : '/dashboard/products'}
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

      {products && products.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">المنتج</th>
                  <th className="px-4 py-3 text-right font-medium">الفئة</th>
                  <th className="px-4 py-3 text-right font-medium">السعر</th>
                  <th className="px-4 py-3 text-right font-medium">المخزون</th>
                  <th className="px-4 py-3 text-right font-medium">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => {
                  const images = Array.isArray(p.images) ? (p.images as string[]) : [];
                  const cat = p.categories as unknown as { name_ar: string } | null;
                  const lowStock = p.stock <= (p.low_stock_threshold ?? 5);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {images[0] ? (
                              <img src={images[0]} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-300">
                                <Package className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/products/${p.id}`}
                              className="font-medium text-gray-900 hover:text-nados-primary truncate block max-w-xs"
                            >
                              {p.name_ar || p.name}
                            </Link>
                            {p.is_featured && (
                              <span className="text-xs text-amber-600">مميز</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {cat?.name_ar ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {formatIQD(p.price_iqd)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            p.stock === 0
                              ? 'bg-red-50 text-red-700'
                              : lowStock
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
                            p.is_active
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {p.is_active ? 'نشط' : 'معطّل'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-left">
                        <ProductRowActions
                          id={p.id}
                          name={p.name_ar || p.name}
                          isActive={p.is_active}
                        />
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
          <Package className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-gray-500">
            {q || status ? 'لا توجد منتجات مطابقة' : 'لم تضف أي منتجات بعد'}
          </p>
          {!q && !status && (
            <Link href="/dashboard/products/new" className="mt-4 inline-block">
              <Button>
                <Plus className="h-4 w-4" />
                أضف منتجك الأول
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
