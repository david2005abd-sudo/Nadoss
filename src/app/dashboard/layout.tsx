import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

export const dynamic = process.env.NEXT_EXPORT === 'true' ? 'force-static' : 'force-dynamic';

export const metadata = {
  title: 'لوحة التحكم',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenantName = 'متجري';
  const role = 'owner';

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar tenantName={tenantName} />
      <div className="lg:pr-64">
        <DashboardHeader user={{ phone: '', role }} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
