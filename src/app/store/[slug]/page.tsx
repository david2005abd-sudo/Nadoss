'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatIQD } from '@/lib/utils';
import { ShoppingBag, Store } from 'lucide-react';

type Tenant = { id: string; name: string; phone: string | null };
type Product = {
  id: string;
  name_ar: string;
  name: string;
  price_iqd: number;
  images: unknown;
  stock: number;
};

export default function StoreHomePage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug) {
        setMissing(true);
        setLoading(false);
        return;
      }
      try {
        const supabase = createClient();
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('id, name, slug, phone, is_active')
          .eq('slug', slug)
          .eq('is_active', true)
          .maybeSingle();

        if (cancelled) return;

        if (!tenantData) {
          setMissing(true);
          setLoading(false);
          return;
        }

        setTenant(tenantData);

        const { data: productData } = await supabase
          .from('products')
          .select('id, name_ar, name, price_iqd, images, stock')
          .eq('tenant_id', tenantData.id)
          .eq('is_active', true)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(24);

        if (!cancelled) setProducts(productData ?? []);
      } catch {
        if (!cancelled) setMissing(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-400">
        جارٍ التحميل...
      </div>
    );
  }

  if (missing || !tenant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <Store className="h-14 w-14 text-gray-300" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">المتجر غير موجود</h1>
        <p className="mt-2 text-gray-500">تأكد من الرابط أو أن المتجر مفعّل</p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-nados-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-nados-primary-dark"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{tenant.name}</h1>
            {tenant.phone && (
              <p className="text-xs text-gray-500" dir="ltr">{tenant.phone}</p>
            )}
          </div>
          <Link href="/" className="text-xs text-gray-400 hover:text-nados-primary">
            مدعوم بواسطة نادوس
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">المنتجات</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => {
              const displayName = p.name_ar || p.name;
              const image =
                Array.isArray(p.images) && p.images.length > 0
                  ? (p.images[0] as { url?: string })?.url
                  : undefined;
              return (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white"
                >
                  <div className="relative aspect-square bg-gray-100">
                    {image ? (
                      <img
                        src={image}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                    {p.stock > 0 && p.stock <= 5 && (
                      <span className="absolute right-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                        آخر {p.stock} قطعة
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
          <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-400">
            لا توجد منتجات بعد
          </div>
        )}
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
