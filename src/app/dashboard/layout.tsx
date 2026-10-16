import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export const dynamic = process.env.NEXT_EXPORT === 'true' ? 'force-static' : 'force-dynamic';

export const metadata = {
  title: 'لوحة التحكم',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
