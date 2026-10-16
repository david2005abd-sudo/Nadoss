import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'لوحة التحكم',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    redirect('/login?error=not-configured');
  }

  if (!user) redirect('/login');

  let tenantName = 'متجري';
  let role = 'owner';

  try {
    const supabase = await createClient();
    const { data: membership } = await supabase
      .from('memberships')
      .select('tenant_id, role, tenants(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (membership) {
      role = membership.role;
      const tenants = membership.tenants as unknown as { name: string } | null;
      if (tenants?.name) tenantName = tenants.name;
    }
  } catch {
    // Tables not migrated yet — fall back to defaults
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar tenantName={tenantName} />
      <div className="lg:pr-64">
        <DashboardHeader user={{ phone: user.phone ?? '', role }} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
