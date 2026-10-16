'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { IconTruck } from '@/components/nasaq/icons';
import { formatIQD } from '@/lib/utils';

const CITIES = [
  { city: 'الرياض', fee: 0 },
  { city: 'جدة', fee: 5000 },
  { city: 'الدمام', fee: 5000 },
  { city: 'مكة المكرمة', fee: 6000 },
  { city: 'المدينة المنورة', fee: 7000 },
  { city: 'بريدة', fee: 7000 },
  { city: 'حائل', fee: 8000 },
  { city: 'تبوك', fee: 8000 },
  { city: 'أبها', fee: 9000 },
];

const DELIVERY_STATUSES = ['جديد', 'قيد التجهيز', 'بانتظار التوصيل'];

export default function DeliveryPage() {
  const [q, setQ] = useState('');

  return (
    <DashboardModule title="التوصيل والشحن" subtitle="متابعة مناديب التوصيل ومناطق التغطية وحالات الشحن.">
      {({ project, patch }) => {
        const orders = project.orders.filter((o) => DELIVERY_STATUSES.includes(o.status));
        const filtered = orders.filter((o) => !q || (o.customer ?? '').includes(q));

        function advance(id: string) {
          const order = project.orders.find((o) => o.id === id);
          if (!order) return;
          const idx = DELIVERY_STATUSES.indexOf(order.status);
          const next = DELIVERY_STATUSES[Math.min(idx + 1, DELIVERY_STATUSES.length - 1)];
          patch({ orders: project.orders.map((o) => (o.id === id ? { ...o, status: next } : o)) });
        }

        return (
          <>
            <div className="grid-3 sm:grid-cols-3">
              <div className="card"><span className="text-xs text-muted">طلبات قيد التوصيل</span><p className="kpi-value">{orders.length}</p></div>
              <div className="card"><span className="text-xs text-muted">بانتظار التجهيز</span><p className="kpi-value">{orders.filter((o) => o.status === 'قيد التجهيز').length}</p></div>
              <div className="card"><span className="text-xs text-muted">بانتظار التوصيل</span><p className="kpi-value">{orders.filter((o) => o.status === 'بانتظار التوصيل').length}</p></div>
            </div>

            {filtered.length > 0 ? (
              <>
                <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث باسم العميل..." />
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>رقم الطلب</th>
                        <th>العميل</th>
                        <th>التاريخ</th>
                        <th>الإجمالي</th>
                        <th>حالة الشحن</th>
                        <th>إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((o) => (
                        <tr key={o.id}>
                          <td className="font-bold text-text-primary">{o.number}</td>
                          <td>{o.customer}</td>
                          <td className="text-muted">{o.date}</td>
                          <td className="font-bold">{formatIQD(o.total)}</td>
                          <td><StatusBadge status={o.status} /></td>
                          <td>
                            {o.status !== 'بانتظار التوصيل' && (
                              <button type="button" className="btn btn-primary btn-sm" onClick={() => advance(o.id)}>
                                <IconTruck size={16} /> تحويل للمرحلة التالية
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="table-wrap">
                <EmptyState title="لا توجد طلبات لوجستية بعد" description="ستظهر الطلبات النشطة هنا عند استقبال طلبات جديدة." />
              </div>
            )}

            <div className="card">
              <span className="text-xs text-muted">مناطق التغطية ورسوم التوصيل التجريبية</span>
              <div className="mt-3 grid-2 sm:grid-cols-3">
                {CITIES.map((c) => (
                  <div key={c.city} className="flex items-center justify-between rounded-md border border-border p-2">
                    <span className="text-sm font-bold">{c.city}</span>
                    <span className="badge badge-muted">{c.fee === 0 ? 'مجاني (تجريبي)' : formatIQD(c.fee)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      }}
    </DashboardModule>
  );
}
