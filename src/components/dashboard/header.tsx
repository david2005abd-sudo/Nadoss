'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, User } from 'lucide-react';

export function DashboardHeader({
  user,
}: {
  user: { phone: string; role: string };
}) {
  const router = useRouter();
  const roleLabels: Record<string, string> = {
    owner: 'مالك',
    admin: 'مدير',
    staff: 'موظف',
  };

  async function handleLogout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Static preview without Supabase — just navigate away
    }
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur lg:px-6">
      <div className="w-10 lg:hidden" />
      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 text-sm sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="leading-tight">
            <p className="font-medium text-gray-900">{user.phone || 'زائر'}</p>
            <p className="text-xs text-gray-500">{roleLabels[user.role] ?? user.role}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">خروج</span>
        </button>
      </div>
    </header>
  );
}
