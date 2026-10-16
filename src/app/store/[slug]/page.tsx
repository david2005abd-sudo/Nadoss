import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AddToCartButton } from '@/components/store/add-to-cart-button';
import { formatIQD } from '@/lib/utils';

export const revalidate = 60;

export default async function StoreHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) return null;

  // Featured products
  const { data: featured } = await supabase
    .from('products')
    .select('id, name_ar, name, price_iqd, images, stock, is_featured')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .eq('is_featured', true)
    .is('deleted_at', null)
    .limit(6);

  // All products (latest)
  const { data: products } = await supabase
    .from('products')
    .select('id, name_ar, name, price_iqd, compare_price_iqd, images, stock')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(12);

  const featuredList = featured ?? [];
  const productList = products ?? [];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-l from-blue-50 via-white to-green-50 border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          مرحبًا بك في {tenant.name}
        </h1>
        <p className="mt-3 text-gray-600 max-w-2xl">
          تصفح منتجاتنا واطلب الآن — الدفع عند الاستلام متاح في جميع المحافظات.
        </p>
        <Link
          href={`/store/${slug}/products`}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-nados-primary px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          تصفح كل المنتجات
        </Link>
      </section>

      {/* Featured */}
      {featuredList.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">منتجات مميزة</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">            {featuredList.map((p) => (
              <ProductCard key={p.id} product={p} slug={slug} />
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">أحدث المنتجات</h2>
          <Link href={`/store/${slug}/products`} className="text-sm text-nados-primary hover:underline">
            عرض الكل
          </Link>
        </div>

        {productList.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productList.map((p) => (
              <ProductCard key={p.id} product={p} slug={slug} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-400">
            لا توجد منتجات بعد
          </div>
        )}
      </section>
    </div>
  );
}

interface ProductRow {
  id: string;
  name_ar: string | null;
  name: string;
  price_iqd: number;
  compare_price_iqd?: number | null;
  images: unknown;
  stock: number;
  is_featured?: boolean;
}

function ProductCard({ product, slug }: { product: ProductRow; slug: string }) {
  const images = Array.isArray(product.images) ? (product.images as string[]) : [];
  const image = images[0];
  const displayName = product.name_ar || product.name;
  const hasDiscount =
    product.compare_price_iqd && product.compare_price_iqd > product.price_iqd;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md">
      <Link href={`/store/${slug}/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-gray-50">
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
        {product.stock <= 0 && (
          <span className="absolute top-2 right-2 rounded-md bg-gray-900/80 px-2 py-1 text-xs text-white">
            نفذت الكمية
          </span>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 rounded-md bg-nados-danger px-2 py-1 text-xs text-white">
            خصم
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link href={`/store/${slug}/products/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-nados-primary">
            {displayName}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-nados-primary">
            {formatIQD(product.price_iqd)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatIQD(product.compare_price_iqd!)}
            </span>
          )}
        </div>

        <div className="mt-3">
          <AddToCartButton
            product={{
              id: product.id,
              name: displayName,
              priceIqd: product.price_iqd,
              stock: product.stock,
              image,
            }}
            size="sm"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
