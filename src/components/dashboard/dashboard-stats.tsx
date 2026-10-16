'use client';

import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Plus,
  Truck,
  Bot,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '@/lib/supabase/use-store';
import { formatIQD } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  draft: 'مسودة',
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  preparing: 'قيد التحضير',
  ready: 'جاهز',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
  returned: 'مرتجع',
};

type RecentOrder = {
  id: string;
  order_number: string;
  total_iqd: number;
  status: string;
  created_at: string;
};

export function DashboardStats() {
  const store = useStore();
  const [productsCount, setProductsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    if (!store.tenantId) return;
    let cancelled = false;

    async function load() {
      try {
        const supabase = createClient();
        const [{ count: pc }, { count: oc }, { count: cc }, { data: orders }, { data: revenue }] =
          await Promise.all([
            supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('tenant_id', store.tenantId!)
              .is('deleted_at', null),
            supabase
              .from('orders')
              .select('*', { count: 'exact', head: true })
              .eq('tenant_id', store.tenantId!)
              .is('deleted_at', null),
            supabase
              .from('customers')
              .select('*', { count: 'exact', head: true })
              .eq('tenant_id', store.tenantId!)
              .is('deleted_at', null),
            supabase
              .from('orders')
              .select('id, order_number, total_iqd, status, created_at')
              .eq('tenant_id', store.tenantId!)
              .is('deleted_at', null)
              .order('created_at', { ascending: false })
              .limit(5),
            supabase
              .from('orders')
              .select('total_iqd')
              .eq('tenant_id', store.tenantId!)
              .eq('status', 'delivered')
              .is('deleted_at', null),
          ]);

        if (cancelled) return;
        setProductsCount(pc ?? 0);
        setOrdersCount(oc ?? 0);
        setCustomersCount(cc ?? 0);
        setTotalRevenue((revenue ?? []).reduce((sum, o) => sum + (o.total_iqd ?? 0), 0));
        setRecentOrders(orders ?? []);
      } catch {
        // tables not migrated yet — leave zeros
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [store.tenantId]);

  const stats = [
    { label: 'المنتجات', value: String(productsCount), icon: Package, tone: 'text-blue-600 bg-blue-50' },
    { label: 'الطلبات', value: String(ordersCount), icon: ShoppingCart, tone: 'text-green-600 bg-green-50' },
    { label: 'العملاء', value: String(customersCount), icon: Users, tone: 'text-purple-600 bg-purple-50' },
    { label: 'الإيرادات', value: formatIQD(totalRevenue), icon: TrendingUp, tone: 'text-amber-600 bg-amber-50' },
  ];

  const showSetup = !store.loading && !store.tenantId;

  return (
    <div className="space-y-6">
      {showSetup && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="flex items-center gap-2 font-semibold text-blue-900">
            <Sparkles className="h-4 w-4" />
            ابدأ بخطوات سريعة
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:shadow"
            >
              <Plus className="h-4 w-4 text-nados-primary" />
              أنشئ متجرك
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:shadow"
            >
              <Truck className="h-4 w-4 text-nados-primary" />
              اربط شركة توصيل
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:shadow"
            >
              <Bot className="h-4 w-4 text-nados-primary" />
              فعّل بوت الواتساب
            </Link>
          </div>
        </div>
      )}

      {store.storeName && (
        <p className="text-sm text-gray-600">
          المتجر: <span className="font-medium text-gray-900">{store.storeName}</span>
          {store.role ? ` — ${store.role === 'owner' ? 'مالك' : store.role === 'admin' ? 'مدير' : 'موظف'}` : ''}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {store.loading ? '—' : stat.value}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">آخر الطلبات</h2>
          <Link href="/dashboard/orders" className="text-sm text-nados-primary hover:underline">
            عرض الكل
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{order.order_number}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('ar-IQ')}
                  </p>
                </div>
                <div className="mr-4 shrink-0 text-left">
                  <p className="text-sm font-semibold text-gray-900">{formatIQD(order.total_iqd)}</p>
                  <p className="text-xs text-gray-500">{statusLabels[order.status] ?? order.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            لا توجد طلبات بعد — شارك رابط متجرك لتبدأ البيع
          </div>
        )}
      </div>
    </div>
  );
}
