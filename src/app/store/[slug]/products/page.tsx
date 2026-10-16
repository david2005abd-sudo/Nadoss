import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AddToCartButton } from '@/components/store/add-to-cart-button';
import { formatIQD } from '@/lib/utils';

export const revalidate = 60;

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { slug } = await params;
  const { category, q } = await searchParams;

  const supabase = await createClient();
  const { data: tenant } = await supabase
    .from('public_storefronts')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) return null;

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_ar, name, slug')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('sort_order');

  let query = supabase
    .from('products')
    .select('id, name_ar, name, price_iqd, compare_price_iqd, images, stock, category_id')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (category) {
    const cat = categories?.find((c) => c.slug === category);
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (q) {
    query = query.or(`name_ar.ilike.%${q}%,name.ilike.%${q}%`);
  }

  const { data: products } = await query.limit(60);
  const list = products ?? [];
  const cats = categories ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">المنتجات</h1>

        <form className="w-full md:w-72">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="ابحث عن منتج..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
          />
        </form>
      </div>

      {cats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/store/${slug}/products`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !category
                ? 'bg-nados-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            الكل
          </Link>
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/store/${slug}/products?category=${c.slug}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === c.slug
                  ? 'bg-nados-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {c.name_ar || c.name}
            </Link>
          ))}
        </div>
      )}

      {list.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((p) => {
            const images = Array.isArray(p.images) ? (p.images as string[]) : [];
            const image = images[0];
            const displayName = p.name_ar || p.name;
            const hasDiscount = p.compare_price_iqd && p.compare_price_iqd > p.price_iqd;
            return (
              <div
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
              >
                <Link
                  href={`/store/${slug}/products/${p.id}`}
                  className="relative block aspect-square overflow-hidden bg-gray-50"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={displayName}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300 text-sm">
                      لا صورة
                    </div>
                  )}
                  {p.stock <= 0 && (
                    <span className="absolute top-2 right-2 rounded-md bg-gray-900/80 px-2 py-1 text-xs text-white">
                      نفذت الكمية
                    </span>
                  )}
                </Link>

                <div className="flex flex-1 flex-col p-3">
                  <Link href={`/store/${slug}/products/${p.id}`}>
                    <h3 className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-nados-primary">
                      {displayName}
                    </h3>
                  </Link>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-base font-bold text-nados-primary">
                      {formatIQD(p.price_iqd)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatIQD(p.compare_price_iqd!)}
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <AddToCartButton
                      product={{
                        id: p.id,
                        name: displayName,
                        priceIqd: p.price_iqd,
                        stock: p.stock,
                        image,
                      }}
                      size="sm"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center text-gray-400">
          لا توجد منتجات مطابقة
        </div>
      )}
    </div>
  );
}
