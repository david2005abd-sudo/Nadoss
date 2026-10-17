'use client';

import { useMemo } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { KpiCard } from '@/components/nasaq/ui';
import { getIcon } from '@/components/nasaq/icons';
import { formatIQD } from '@/lib/utils';

const MONTHS = ['يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر'];

export default function AnalyticsPage() {
 return (
  <DashboardModule title="التحليلات والتقارير" subtitle="رسوم بيانية تفاعلية لنمو الطلبات والمبيعات ومقارنة الفترات.">
   {({ project }) => {
    /* ---- Derive the monthly series from the project's real orders ---- */
    const series = useMemo(() => {
     const counts = MONTHS.map(() => 0);
     const revenue = MONTHS.map(() => 0);
     for (const o of project.orders) {
      // order dates look like "YYYY-MM-DD ..." or "YYYY-MMDD"
      const m = Number((o.date ?? '').slice(5, 7));
      const idx = m === 7 ? 0 : m === 8 ? 1 : m === 9 ? 2 : m === 10 ? 3 : -1;
      if (idx < 0) continue;
      counts[idx] += 1;
      revenue[idx] += o.total ?? 0;
     }
     return { counts, revenue };
    }, [project.orders]);

    const maxCount = Math.max(1, ...series.counts);
    const totalOrders = series.counts.reduce((s, c) => s + c, 0);
    const totalRevenue = series.revenue.reduce((s, c) => s + c, 0);
    const avgOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

    const topProducts = [...project.products].sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0)).slice(0, 5);
    const topCustomers = [...project.customers].sort((a, b) => (b.totalSpent ?? 0) - (a.totalSpent ?? 0)).slice(0, 5);

    const bestMonthIdx = series.counts.indexOf(Math.max(...series.counts));

    return (
     <>
      <div className="grid-4">
       <KpiCard label="إجمالي الطلبات" value={totalOrders} icon={getIcon('cart')} tone="purple" />
       <KpiCard label="إجمالي الإيرادات" value={formatIQD(totalRevenue)} icon={getIcon('chart')} tone="green" />
       <KpiCard label="متوسط قيمة الطلب" value={formatIQD(avgOrder)} icon={getIcon('receipt')} tone="amber" />
       <KpiCard
        label="أفضل شهر "
        value={bestMonthIdx >= 0 && series.counts[bestMonthIdx] > 0 ? MONTHS[bestMonthIdx] : '—'}
        icon={getIcon('calendar')}
        tone="teal"
       />
      </div>

      <div className="grid-2">
       {/* ---------- Orders per month ---------- */}
       <div className="chart-box">
        <span className="text-xs text-muted">نمو الطلبات شهريًا </span>
        <div className="mt-4 flex h-56 items-end gap-3">
         {MONTHS.map((m, i) => (
          <div key={m} className="chart-bar-col">
           <div className="flex h-full w-full flex-col justify-end gap-1">
            <span className="block text-center text-xs font-bold">{series.counts[i]}</span>
            <div
             className={`chart-bar ${i === series.counts.length - 1 ? '' : 'secondary'}`}
             style={{ height: `${Math.round((series.counts[i] / maxCount) * 88)}%` }}
             title={`${m}: ${series.counts[i]} طلبًا`}
            />
           </div>
           <span className="text-[11px] text-muted">{m}</span>
          </div>
         ))}
        </div>
       </div>

       {/* ---------- Revenue per month ---------- */}
       <div className="chart-box">
        <span className="text-xs text-muted">الإيرادات شهريًا </span>
        <div className="mt-4 flex h-56 items-end gap-3">
         {MONTHS.map((m, i) => {
          const max = Math.max(1, ...series.revenue);
          return (
           <div key={m} className="chart-bar-col">
            <div className="flex h-full w-full flex-col justify-end gap-1">
             <span className="block text-center text-xs font-bold">{formatIQD(series.revenue[i])}</span>
             <div
              className={`chart-bar ${i === series.revenue.length - 1 ? '' : 'secondary'}`}
              style={{ height: `${Math.round((series.revenue[i] / max) * 88)}%` }}
              title={`${m}: ${formatIQD(series.revenue[i])}`}
             />
            </div>
            <span className="text-[11px] text-muted">{m}</span>
           </div>
          );
         })}
        </div>
       </div>
      </div>

      {/* ---------- Best products ---------- */}
      <div className="chart-box">
       <span className="text-xs text-muted">أفضل المنتجات (حسبالمبيعات)</span>
       {topProducts.length > 0 ? (
        <div className="table-wrap mt-3">
         <table className="data-table">
          <thead>
           <tr>
            <th>المنتج</th>
            <th>الفئة</th>
            <th>عدد المبيعات</th>
            <th>السعر</th>
            <th>إجمالي المساهم</th>
           </tr>
          </thead>
          <tbody>
           {topProducts.map((p) => (
            <tr key={p.id}>
             <td className="font-bold text-text-primary">{p.name}</td>
             <td><span className="badge badge-muted">{p.category}</span></td>
             <td>{p.sales}</td>
             <td>{formatIQD(p.price)}</td>
             <td className="font-bold">{formatIQD((p.sales ?? 0) * p.price)}</td>
            </tr>
           ))}
          </tbody>
         </table>
        </div>
       ) : (
        <div className="table-empty">لا توجد بيانات مبيعات كافية بعد.</div>
       )}
      </div>

      {/* ---------- Top customers ---------- */}
      <div className="chart-box">
       <span className="text-xs text-muted">أعلى العملاء (حسب إجمالي المشتريات)</span>
       {topCustomers.length > 0 ? (
        <div className="table-wrap mt-3">
         <table className="data-table">
          <thead>
           <tr>
            <th>العميل</th>
            <th>المدينة</th>
            <th>عدد الطلبات</th>
            <th>إجمالي المشتريات</th>
           </tr>
          </thead>
          <tbody>
           {topCustomers.map((c) => (
            <tr key={c.id}>
             <td className="font-bold text-text-primary">{c.name}</td>
             <td>{c.city}</td>
             <td>{c.ordersCount}</td>
             <td className="font-bold">{formatIQD(c.totalSpent)}</td>
            </tr>
           ))}
          </tbody>
         </table>
        </div>
       ) : (
        <div className="table-empty">لا يوجد عملاء بعد.</div>
       )}
      </div>

      <p className="text-xs text-muted">
       ملاحظة: هذه الأرقام مشتقة من بيانات هذا المشروع ال داخل النموذج الأولي فقط.
      </p>
     </>
    );
   }}
  </DashboardModule>
 );
}
