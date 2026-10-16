import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { NewTicketForm } from '@/components/dashboard/new-ticket-form';

export default async function NewTicketPage() {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number')
    .eq('tenant_id', membership!.tenant_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/dashboard/support"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-nados-primary"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للتذاكر
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">تذكرة دعم جديدة</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          اشرح مشكلتك بتفصيل وسيتواصل معك الفريق قريبًا
        </p>
      </div>

      <NewTicketForm recentOrders={recentOrders ?? []} />
    </div>
  );
}
