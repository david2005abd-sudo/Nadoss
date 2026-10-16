'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  MessageSquare,
  BarChart3,
  Settings,
  Store,
  LifeBuoy,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'نظرة عامة', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'المنتجات', icon: Package },
  { href: '/dashboard/orders', label: 'الطلبات', icon: ShoppingCart },
  { href: '/dashboard/customers', label: 'العملاء', icon: Users },
  { href: '/dashboard/delivery', label: 'التوصيل', icon: Truck },
  { href: '/dashboard/conversations', label: 'المحادثات', icon: MessageSquare },
  { href: '/dashboard/reports', label: 'التقارير', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'الإعدادات', icon: Settings },
  { href: '/dashboard/support', label: 'الدعم الفني', icon: LifeBuoy },
  { href: '/dashboard/knowledge', label: 'قاعدة المعرفة', icon: BookOpen },
];

export function DashboardSidebar({ tenantName }: { tenantName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed top-0 right-0 h-screen w-64 flex-col border-l border-gray-200 bg-white">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-nados-primary flex items-center justify-center text-white font-bold text-sm">
          ن
        </div>
        <span className="font-bold text-gray-900 truncate">{tenantName}</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-nados-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <Store className="h-4 w-4" />
          عرض المتجر
        </Link>
      </div>
    </aside>
  );
}
