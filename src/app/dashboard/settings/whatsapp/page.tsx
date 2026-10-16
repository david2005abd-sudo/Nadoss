import { createClient } from '@/lib/supabase/server';
import { WhatsAppSetupCard } from '@/components/dashboard/whatsapp-setup-card';

export default async function WhatsAppSettingsPage() {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const { data: numbers } = await supabase
    .from('whatsapp_numbers')
    .select('id, phone_number_id, display_phone_number, waba_id, is_active')
    .eq('tenant_id', membership!.tenant_id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إعداد واتساب</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          اربط رقم واتساب Business لاستقبال الطلبات تلقائيًا
        </p>
      </div>

      <WhatsAppSetupCard
        existing={numbers ?? []}
        webhookUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/webhooks/whatsapp`}
        verifyToken={process.env.WHATSAPP_VERIFY_TOKEN ?? ''}
      />
    </div>
  );
}
