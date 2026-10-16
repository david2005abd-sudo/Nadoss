import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Get tenant info
  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role, tenants(id, name, slug)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (!membership) redirect('/login');

  const tenant = membership.tenants as unknown as { id: string; name: string; slug: string } | null;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar tenantName={tenant?.name ?? 'متجري'} />
      <div className="lg:pr-64">
        <DashboardHeader user={{ phone: user.phone ?? '', role: membership.role }} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
