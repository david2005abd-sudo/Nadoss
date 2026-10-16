'use client';

import { logoutAction } from '@/app/(auth)/actions';
import { LogOut, User } from 'lucide-react';

export function DashboardHeader({
  user,
}: {
  user: { phone: string; role: string };
}) {
  const roleLabels: Record<string, string> = {
    owner: 'مالك',
    admin: 'مدير',
    staff: 'موظف',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur px-4 lg:px-6">
      <div className="lg:hidden w-10" />
      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="leading-tight">
            <p className="text-gray-900 font-medium">{user.phone}</p>
            <p className="text-xs text-gray-500">{roleLabels[user.role] ?? user.role}</p>
          </div>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </form>
      </div>
    </header>
  );
}
