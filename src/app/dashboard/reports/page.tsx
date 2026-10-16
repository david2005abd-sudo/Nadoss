import { createClient } from '@/lib/supabase/server';
import { formatIQD } from '@/lib/utils';
import { TrendingUp, ShoppingBag, Package, Users, Award } from 'lucide-react';

export const revalidate = 60;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = range === '90d' ? 90 : range === '30d' ? 30 : 7;
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id')
    .limit(1)
    .single();

  const tenantId = membership!.tenant_id;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: deliveredOrders } = await supabase
    .from('orders')
    .select('id, total_iqd, subtotal_iqd, created_at, source, governorate_id, iraq_governorates(name_ar)')
    .eq('tenant_id', tenantId)
    .eq('status', 'delivered')
    .gte('created_at', since)
    .is('deleted_at', null);

  const delivered = deliveredOrders ?? [];
  const revenue = delivered.reduce((s, o) => s + o.total_iqd, 0);
  const subtotalRevenue = delivered.reduce((s, o) => s + o.subtotal_iqd, 0);

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('created_at', since)
    .is('deleted_at', null);
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_id, product_name, quantity, total_price_iqd, orders!inner(tenant_id, status, created_at)')
    .eq('tenant_id', tenantId)
    .eq('orders.status', 'delivered')
    .gte('orders.created_at', since);

  // Top products
  const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const item of orderItems ?? []) {
    const key = item.product_id ?? item.product_name;
    const cur = productMap.get(key) ?? { name: item.product_name, qty: 0, revenue: 0 };
    cur.qty += item.quantity;
    cur.revenue += item.total_price_iqd;
    productMap.set(key, cur);
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Top governorates
  const govMap = new Map<string, { name: string; count: number; revenue: number }>();
  for (const o of delivered) {
    const gov = o.iraq_governorates as unknown as { name_ar: string } | null;
    const key = gov?.name_ar ?? 'غير معروف';
    const cur = govMap.get(key) ?? { name: gov?.name_ar ?? 'غير معروف', count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += o.total_iqd;
    govMap.set(key, cur);
  }
  const topGovernorates = Array.from(govMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const aov = delivered.length > 0 ? Math.round(revenue / delivered.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            نظرة تحليلية على أداء متجرك
          </p>
        </div>

        <div className="flex gap-1">
          {[
            { v: '7d', l: '7 أيام' },
            { v: '30d', l: '30 يومًا' },
            { v: '90d', l: '90 يومًا' },
          ].map((opt) => (
            <a
              key={opt.v}
              href={`/dashboard/reports?range=${opt.v}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                (range ?? '7d') === opt.v
                  ? 'bg-nados-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.l}
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="الإيرادات (مُسلَّمة)"
          value={formatIQD(revenue)}
          icon={TrendingUp}
          tone="primary"
        />
        <StatCard
          label="عدد الطلبات"
          value={String(orderCount ?? 0)}
          icon={ShoppingBag}
          tone="green"
        />
        <StatCard
          label="متوسط قيمة الطلب"
          value={formatIQD(aov)}
          icon={Package}
          tone="purple"
        />
        <StatCard
          label="إيراد المنتجات (بدون توصيل)"
          value={formatIQD(subtotalRevenue)}
          icon={Users}
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="rounded-xl border border-gray-100 bg-white p-5">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
            <Award className="h-4 w-4" /> أفضل 10 منتجات
          </h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.qty} قطعة</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {formatIQD(p.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">لا توجد بيانات</p>
          )}
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-4">أفضل المحافظات</h2>
          {topGovernorates.length > 0 ? (
            <div className="space-y-3">
              {topGovernorates.map((g, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{g.name}</p>
                    <p className="text-xs text-gray-500">{g.count} طلب</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {formatIQD(g.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">لا توجد بيانات</p>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'primary' | 'green' | 'purple' | 'amber';
}) {
  const tones = {
    primary: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
