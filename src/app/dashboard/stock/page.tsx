'use client';

import Link from 'next/link';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, StatusBadge } from '@/components/nasaq/ui';
import { IconCard } from '@/components/nasaq/icons';
import { formatIQD } from '@/lib/utils';

export default function StockPage() {
  return (
    <DashboardModule title="مخزون الأكواد والبطاقات" subtitle="متابعة رصيد البطاقات الرقمية والأكواد الجاهزة للتسليم.">
      {({ project }) => {
        const items = project.digitalItems;
        const total = items.reduce((s, d) => s + (d.availableCodes ?? 0), 0);

        return (
          <>
            <div className="grid-3 sm:grid-cols-3">
              <div className="card"><span className="text-xs text-muted">إجمالي الأكواد المتاحة</span><p className="kpi-value">{total}</p></div>
              <div className="card"><span className="text-xs text-muted">عدد المنتجات الرقمية</span><p className="kpi-value">{items.length}</p></div>
              <div className="card"><span className="text-xs text-muted">منتجات منخفضة</span><p className="kpi-value">{items.filter((d) => d.availableCodes <= 10).length}</p></div>
            </div>

            {items.length > 0 ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>المنتج</th>
                      <th>نوع التسليم</th>
                      <th>السعر</th>
                      <th>الأكواد المتاحة</th>
                      <th>حالة التسليم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((d) => (
                      <tr key={d.id}>
                        <td className="font-bold text-text-primary">{d.name}</td>
                        <td><span className="badge badge-muted">{d.type}</span></td>
                        <td className="font-bold">{formatIQD(d.price)}</td>
                        <td>
                          <span className={`badge ${d.availableCodes === 0 ? 'badge-danger' : d.availableCodes <= 10 ? 'badge-warning' : 'badge-success'}`}>
                            {d.availableCodes}
                          </span>
                        </td>
                        <td><StatusBadge status={d.deliveryStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-wrap">
                <EmptyState
                  title="لا توجد بطاقات رقمية في المخزون بعد"
                  description="أضف منتجات رقمية من وحدة التسليم الرقمي لمتابعة الرصيد."
                  action={
                    <Link href="/dashboard/digitalDelivery" className="btn btn-primary btn-sm">
                      <IconCard size={16} /> الانتقال للتسليم الرقمي
                    </Link>
                  }
                />
              </div>
            )}
          </>
        );
      }}
    </DashboardModule>
  );
}
