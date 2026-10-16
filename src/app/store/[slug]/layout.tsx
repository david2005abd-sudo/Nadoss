import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CartProvider } from '@/lib/cart/context';
import { CartButton } from '@/components/store/cart-button';
import { CartDrawer } from '@/components/store/cart-drawer';

async function getTenant(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('tenants')
    .select('id, name, slug, logo_url, phone, address, is_active')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getTenant(slug);
  if (!tenant) return { title: 'المتجر غير موجود' };
  return {
    title: `${tenant.name} — نادوس`,
    description: `تسوق من ${tenant.name} عبر نادوس`,
  };
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenant(slug);
  if (!tenant) notFound();

  return (
    <CartProvider tenantSlug={slug}>
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link href={`/store/${slug}`} className="flex items-center gap-2.5">
              {tenant.logo_url ? (
                <img
                  src={tenant.logo_url}
                  alt={tenant.name}
                  className="h-9 w-9 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nados-primary text-sm font-bold text-white">
                  {tenant.name.charAt(0)}
                </div>
              )}
              <span className="text-lg font-bold text-gray-900">{tenant.name}</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href={`/store/${slug}`} className="hover:text-nados-primary">
                الرئيسية
              </Link>
              <Link href={`/store/${slug}/products`} className="hover:text-nados-primary">
                المنتجات
              </Link>
            </nav>

            <CartButton />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

        <footer className="border-t border-gray-100 bg-white py-8 mt-12">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
            <p>{tenant.name} — مدعوم بواسطة نادوس</p>
            {tenant.phone && <p className="mt-1">📞 {tenant.phone}</p>}
          </div>
        </footer>

        <CartDrawer storeSlug={slug} />
      </div>
    </CartProvider>
  );
}
