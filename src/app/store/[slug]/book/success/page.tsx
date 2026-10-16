import Link from 'next/link';
import { CheckCircle2, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ number?: string }>;
}) {
  const { slug } = await params;
  const { number } = await searchParams;

  const supabase = await createClient();
  const { data: tenant } = await supabase
    .from('public_storefronts')
    .select('name, phone, slug')
    .eq('slug', slug)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="rounded-2xl border border-green-100 bg-green-50 p-8">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
        <h1 className="mt-4 text-2xl font-bold text-green-900">تم استلام حجزك!</h1>
        {number && (
          <p className="mt-2 text-sm text-green-800 font-mono">رقم الحجز: {number}</p>
        )}
        <p className="mt-3 text-sm text-green-700">
          سيتواصل معك فريق {tenant?.name ?? 'المتجر'} لتأكيد الموعد
        </p>

        {tenant?.phone && (
          <a
            href={`tel:${tenant.phone}`}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white border border-green-200 px-4 py-2 text-sm text-green-800 hover:bg-green-100"
          >
            <Phone className="h-4 w-4" />
            {tenant.phone}
          </a>
        )}
      </div>

      <div className="mt-6">
        <Link href={`/store/${slug}`} className="text-sm text-nados-primary hover:underline">
          مواصلة التسوق
        </Link>
      </div>
    </div>
  );
}
