import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AddToCartButton } from '@/components/store/add-to-cart-button';
import { formatIQD } from '@/lib/utils';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('public_storefronts')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) notFound();

  const { data: product } = await supabase
    .from('products')
    .select('id, name_ar, name, description_ar, description, price_iqd, compare_price_iqd, images, stock, attributes')
    .eq('tenant_id', tenant.id)
    .eq('id', id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle();

  if (!product) notFound();

  const images = Array.isArray(product.images) ? (product.images as string[]) : [];
  const displayName = product.name_ar || product.name;
  const description = product.description_ar || product.description;
  const hasDiscount = product.compare_price_iqd && product.compare_price_iqd > product.price_iqd;
  const attributes =
    product.attributes && typeof product.attributes === 'object'
      ? (product.attributes as Record<string, unknown>)
      : {};

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link href={`/store/${slug}`} className="hover:text-nados-primary">الرئيسية</Link>
        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        <Link href={`/store/${slug}/products`} className="hover:text-nados-primary">المنتجات</Link>
        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        <span className="text-gray-900 truncate">{displayName}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
            {images[0] ? (
              <img src={images[0]} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300">
                لا صورة
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((img, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg border border-gray-100">
                  <img src={img} alt={`${displayName} ${i + 2}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{displayName}</h1>
            {product.stock > 0 ? (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                متوفر ({product.stock} قطعة)
              </p>
            ) : (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                نفذت الكمية
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-nados-primary">
              {formatIQD(product.price_iqd)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatIQD(product.compare_price_iqd!)}
                </span>
                <span className="rounded-md bg-nados-danger px-2 py-0.5 text-xs text-white">
                  وفّر {formatIQD(product.compare_price_iqd! - product.price_iqd)}
                </span>
              </>
            )}
          </div>

          {description && (
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
              {description}
            </div>
          )}

          {Object.keys(attributes).length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">المواصفات</h3>
              <dl className="space-y-1.5 text-sm">
                {Object.entries(attributes).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-gray-500">{k}</dt>
                    <dd className="text-gray-900">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="pt-2">
            <AddToCartButton
              product={{
                id: product.id,
                name: displayName,
                priceIqc: undefined as never, // ignore
                priceIqd: product.price_iqd,
                stock: product.stock,
                image: images[0],
              } as never}
              size="lg"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
