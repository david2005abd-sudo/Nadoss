import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CheckoutForm } from '@/components/store/checkout-form';

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('public_storefronts')
    .select('id, name, slug')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!tenant) notFound();

  const { data: governorates } = await supabase
    .from('iraq_governorates')
    .select('id, name_ar, delivery_fee_iqd')
    .eq('is_active', true)
    .order('id');

  return (
    <CheckoutForm
      slug={slug}
      tenantName={tenant.name}
      governorates={governorates ?? []}
    />
  );
}
