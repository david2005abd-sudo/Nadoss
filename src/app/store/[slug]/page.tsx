import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatIQD } from '@/lib/utils';
import { ShoppingBag, Phone } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getTenant(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('tenants')
    .select('id, name, slug, phone, is_active')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const tenant = await getTenant(slug);
    if (!tenant) return { title: 'المتجر غير موجود' };
    return {
      title: tenant.name,
      description: `تسوق من ${tenant.name} — الدفع عند الاستلام متاح في كل العراق`,
    };
  } catch {
    return { title: 'المتجر' };
  }
}

export default async function StoreHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let tenant: { id: string; name: string; phone: string | null } | null = null;
  let products: {
    id: string;
    name_ar: string;
    name: string;
    price_iqd: number;
    images: unknown;
    stock: number;
  }[] = [];
  let dbError = false;

  try {
    tenant = await getTenant(slug);
    if (tenant) {
      const supabase = await createClient();
      const { data } = await supabase
        .from('products')
        .select('id, name_ar, name, price_iqd, images, stock')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(24);
      products = data ?? [];
    }
  } catch {
    dbError = true;
  }

  if (!tenant) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href={`/store/${slug}`} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nados-primary text-sm font-bold text-white">
              {tenant.name.charAt(0)}
            </div>
            <span className="text-lg font-bold text-gray-900">{tenant.name}</span>
          </Link>
          {tenant.phone && (
            <a
              href={`tel:${tenant.phone}`}
              className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700"
            >
              <Phone className="h-4 w-4" />
              تواصل معنا
            </a>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="rounded-2xl border border-gray-100 bg-gradient-to-l from-blue-50 via-white to-green-50 p-8 text-center md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            مرحبًا بك في {tenant.name}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            تصفح منتجاتنا واطلب الآن — الدفع عند الاستلام متاح في جميع المحافظات العراقية
          </p>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-gray-900">المنتجات</h2>

          {dbError && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              تعذر تحميل المنتجات حاليًا
            </div>
          )}

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => {
                const images = Array.isArray(p.images) ? (p.images as string[]) : [];
                const image = images[0];
                const displayName = p.name_ar || p.name;
                return (
                  <div
                    key={p.id}
                    className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={displayName}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-gray-300">
                          لا صورة
                        </div>
                      )}
                      {p.stock <= 0 && (
                        <span className="absolute right-2 top-2 rounded-md bg-gray-900/80 px-2 py-1 text-xs text-white">
                          نفذت الكمية
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-3">
                      <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
                        {displayName}
                      </h3>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-base font-bold text-nados-primary">
                          {formatIQD(p.price_iqd)}
                        </span>
                      </div>
                      <button
                        disabled={p.stock <= 0}
                        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-nados-primary px-3 py-2 text-xs font-medium text-white transition hover:bg-nados-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {p.stock <= 0 ? 'غير متوفر' : 'اطلب الآن'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !dbError && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-400">
                لا توجد منتجات بعد
              </div>
            )
          )}
        </section>
      </main>

      <footer className="mt-12 border-t border-gray-100 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
          <p>{tenant.name} — مدعوم بواسطة نادوس</p>
          {tenant.phone && <p className="mt-1">📞 {tenant.phone}</p>}
        </div>
      </footer>
    </div>
  );
}
