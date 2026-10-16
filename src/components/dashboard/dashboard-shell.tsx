'use client';

import { useStore } from '@/lib/supabase/use-store';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

/**
 * Dashboard chrome that resolves the signed-in merchant's store in the
 * browser (static-export friendly) and feeds it to the sidebar/header.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const store = useStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar tenantName={store.storeName ?? 'متجري'} />
      <div className="lg:pr-64">
        <DashboardHeader
          user={{ phone: store.phone ?? '', role: store.role ?? 'owner' }}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
