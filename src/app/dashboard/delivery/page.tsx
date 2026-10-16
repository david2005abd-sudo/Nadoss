import { Truck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { listAdapters } from '@/lib/delivery/registry';
import { DeliveryProviderCard } from '@/components/dashboard/delivery-provider-card';
import { RecentShipments } from '@/components/dashboard/recent-shipments';

export default async function DeliveryPage() {
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .limit(1)
    .single();

  const tenantId = membership!.tenant_id;

  const [{ data: companies }, { data: accounts }, { data: shipments }] = await Promise.all([
    supabase
      .from('delivery_companies')
      .select('id, name_ar, name_en, slug, api_type, supports_cod, logo_url, sort_order')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('tenant_delivery_accounts')
      .select('id, delivery_company_id, is_default, is_active, created_at')
      .eq('tenant_id', tenantId),
    supabase
      .from('shipments')
      .select(
        'id, tracking_number, status, created_at, delivery_companies(name_ar), orders(order_number, customers(name, phone))'
      )
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const adapters = listAdapters();
  const adaptersBySlug = new Map(adapters.map((a) => [a.slug, a]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">التوصيل</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          اربط شركات التوصيل العراقية وأنشئ الشحنات تلقائيًا
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">شركات التوصيل المتاحة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(companies ?? []).map((c) => {
            const adapter = adaptersBySlug.get(c.slug);
            const account = accounts?.find((a) => a.delivery_company_id === c.id);
            return (
              <DeliveryProviderCard
                key={c.id}
                company={c}
                supported={!!adapter}
                account={
                  account
                    ? { id: account.id, isActive: account.is_active, isDefault: account.is_default }
                    : null
                }
                credentialFields={
                  adapter ? credentialFieldsFor(adapter.slug) : []
                }
              />
            );
          })}
        </div>
      </section>

      <RecentShipments shipments={(shipments ?? []) as never} />
    </div>
  );
}

function credentialFieldsFor(slug: string): { key: string; label: string; type?: string }[] {
  switch (slug) {
    case 'hi-express':
      return [
        { key: 'apiKey', label: 'API Key', type: 'password' },
        { key: 'environment', label: 'البيئة (production / staging)', type: 'text' },
      ];
    case 'boxy':
      return [
        { key: 'apiKey', label: 'API Key', type: 'password' },
        { key: 'tenantId', label: 'Tenant ID', type: 'text' },
        { key: 'courierPreference', label: 'تفضيل الشريك (auto / cheapest / fastest)', type: 'text' },
      ];
    case 'galina':
      return [
        { key: 'apiKey', label: 'API Key', type: 'password' },
        { key: 'tenantId', label: 'Tenant ID', type: 'text' },
        { key: 'supplierId', label: 'Supplier ID', type: 'text' },
        { key: 'baseUrl', label: 'API Base URL', type: 'text' },
      ];
    default:
      return [
        { key: 'apiKey', label: 'API Key', type: 'password' },
      ];
  }
}
