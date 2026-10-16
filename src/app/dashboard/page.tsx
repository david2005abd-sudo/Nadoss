import { createClient } from '@/lib/supabase/server';
import { formatIQD } from '@/lib/utils';
import { ShoppingCart, Package, Users, TrendingUp } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const tenantId = membership?.tenant_id;

  const [{ count: productsCount }, { count: ordersCount }, { count: customersCount }, { data: recentOrders }] =
    await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId!).is('deleted_at', null),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId!).is('deleted_at', null),
      supabase.from('customers').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId!).is('deleted_at', null),
      supabase
        .from('orders')
        .select('id, order_number, total_iqd, status, created_at, customers(name, phone)')
        .eq('tenant_id', tenantId!)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_iqd')
    .eq('tenant_id', tenantId!)
    .eq('status', 'delivered')
    .is('deleted_at', null);

  const totalRevenue = (revenueData ?? []).reduce((sum, o) => sum + (o.total_iqd ?? 0), 0);

  const stats = [
    { label: 'المنتجات', value: productsCount ?? 0, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'الطلبات', value: ordersCount ?? 0, icon: ShoppingCart, color: 'text-green-600 bg-green-50' },
    { label: 'العملاء', value: customersCount ?? 0, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { label: 'الإيرادات', value: formatIQD(totalRevenue), icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
  ];

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">نظرة عامة</h1>
        <p className="text-sm text-gray-500 mt-1">ملخص أداء متجرك اليوم</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">آخر الطلبات</h2>
        </div>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => {
              const customer = order.customers as unknown as { name: string | null; phone: string } | null;
              return (
                <div key={order.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {customer?.name ?? customer?.phone ?? '—'}
                    </p>
                  </div>
                  <div className="text-left shrink-0 mr-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatIQD(order.total_iqd)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {statusLabels[order.status] ?? order.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            لا توجد طلبات بعد
          </div>
        )}
      </div>
    </div>
  );
}
