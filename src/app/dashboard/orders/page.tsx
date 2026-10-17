'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { formatIQD } from '@/lib/utils';
import type { Order } from '@/lib/nasaq/seed';

const STATUS_OPTIONS = ['جديد', 'قيد التجهيز', 'بانتظار التوصيل', 'مكتمل', 'ملغي'];

export default function OrdersPage() {
 const [q, setQ] = useState('');
 const [filter, setFilter] = useState('');
 const [detail, setDetail] = useState<Order | null>(null);

 return (
  <DashboardModule title="الطلبات" subtitle="متابعة طلبات العملاء وتحديث الحالات خطوة بخطوة.">
   {({ project, patch }) => {
    const statusesPresent = Array.from(new Set(project.orders.map((o) => o.status)));
    const filters = [{ v: '', l: 'الكل' }, ...statusesPresent.map((s) => ({ v: s, l: s }))];

    const filtered = project.orders.filter((o) => {
     const matchQ = !q || (o.number ?? '').includes(q) || (o.customer ?? '').includes(q);
     const matchS = !filter || o.status === filter;
     return matchQ && matchS;
    });

    function setStatus(id: string, status: string) {
     patch({ orders: project.orders.map((o) => (o.id === id ? { ...o, status } : o)) });
    }

    const totalRevenue = project.orders.reduce((s, o) => s + (o.total ?? 0), 0);

    return (
     <>
      <div className="grid-3 sm:grid-cols-2 lg:grid-cols-4">
       <div className="card"><span className="text-xs text-muted">إجمالي الطلبات</span><p className="kpi-value">{project.orders.length}</p></div>
       <div className="card"><span className="text-xs text-muted">قيمة الطلبات</span><p className="kpi-value">{formatIQD(totalRevenue)}</p></div>
       <div className="card"><span className="text-xs text-muted">بانتظار المعالجة</span><p className="kpi-value">{project.orders.filter((o) => o.status === 'جديد' || o.status === 'قيد التجهيز').length}</p></div>
       <div className="card"><span className="text-xs text-muted">طلبات مكتملة</span><p className="kpi-value">{project.orders.filter((o) => o.status === 'مكتمل').length}</p></div>
      </div>

      <TableToolbar
       search={q}
       onSearchChange={setQ}
       searchPlaceholder="ابحث برقم الطلب أو اسم العميل..."
       filters={filters}
       activeFilter={filter}
       onFilterChange={setFilter}
      />

      {filtered.length > 0 ? (
       <div className="table-wrap nq-reveal">
        <table className="data-table">
         <thead>
          <tr>
           <th>رقم الطلب</th>
           <th>العميل</th>
           <th>التاريخ</th>
           <th>العناصر</th>
           <th>الإجمالي</th>
           <th>الحالة</th>
           <th>إجراءات</th>
          </tr>
         </thead>
         <tbody>
          {filtered.map((o) => (
           <tr key={o.id}>
            <td className="font-bold text-text-primary">{o.number}</td>
            <td>{o.customer}</td>
            <td className="text-muted">{o.date}</td>
            <td><span className="badge badge-muted">{o.items}</span></td>
            <td className="font-bold">{formatIQD(o.total)}</td>
            <td><StatusBadge status={o.status} /></td>
            <td>
             <div className="flex flex-wrap gap-1">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setDetail(o)}>تفاصيل</button>
              {o.status !== 'مكتمل' && (
               <button type="button" className="btn btn-primary btn-sm" onClick={() => setStatus(o.id, 'مكتمل')}>إتمام</button>
              )}
             </div>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      ) : (
       <div className="table-wrap nq-reveal">
        <EmptyState title={q || filter ? 'لا توجد طلبات مطابقة' : 'لا توجد طلبات بعد'} description="شارك رابط متجرك لتبدأ استقبال الطلبات." />
       </div>
      )}

      {detail && (
       <Modal
        title={`تفاصيل الطلب ${detail.number}`}
        onClose={() => setDetail(null)}
        footer={<button type="button" className="btn btn-outline btn-sm" onClick={() => setDetail(null)}>إغلاق</button>}
       >
        <div className="grid-2 nq-reveal">
         <div><span className="text-xs text-muted">العميل</span><p className="font-bold">{detail.customer}</p></div>
         <div><span className="text-xs text-muted">التاريخ</span><p className="font-bold">{detail.date}</p></div>
         <div><span className="text-xs text-muted">العناصر</span><p className="font-bold">{detail.items}</p></div>
         <div><span className="text-xs text-muted">الإجمالي</span><p className="font-bold">{formatIQD(detail.total)}</p></div>
        </div>
        <div>
         <span className="text-xs text-muted">الحالة الحالية</span>
         <div className="mt-1"><StatusBadge status={detail.status} /></div>
        </div>
        <Field label="تحديث الحالة">
         <select
          id="modal-ord-status"
          className="form-control"
          value={detail.status}
          onChange={(e) => { const next = e.target.value; setStatus(detail.id, next); setDetail({ ...detail, status: next }); }}
         >
          {STATUS_OPTIONS.map((s) => (
           <option key={s} value={s}>{s}</option>
          ))}
         </select>
        </Field>
        <p className="text-xs text-muted">يُحفظ سجل تغييرات حالة الطلب داخل قاعدة البيانات.</p>
       </Modal>
      )}
     </>
    );
   }}
  </DashboardModule>
 );
}
