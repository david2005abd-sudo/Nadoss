'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';
import type { Booking } from '@/lib/nasaq/seed';

const STATUSES = ['بانتظار التأكيد', 'مؤكد', 'ملغي'];

export default function BookingsPage() {
 const [q, setQ] = useState('');
 const [filter, setFilter] = useState('');
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState<Booking | null>(null);
 const [form, setForm] = useState<Partial<Booking>>({});

 return (
  <DashboardModule
   title="الحجوزات والمواعيد"
   subtitle="جدولة مواعيد العملاء وتأكيدها أو إلغائها."
   actions={() => (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm({ status: 'بانتظار التأكيد' }); setOpen(true); }}>
     <IconPlus size={16} /> حجز جديد
    </button>
   )}
  >
   {({ project, patch }) => {
    const statuses = Array.from(new Set(project.bookings.map((b) => b.status)));
    const filters = [{ v: '', l: 'الكل' }, ...statuses.map((s) => ({ v: s, l: s }))];
    const filtered = project.bookings.filter((b) => (!q || (b.customer ?? '').includes(q)) && (!filter || b.status === filter));

    function save() {
     const customer = form.customer?.trim();
     if (!customer) return;
     if (editing) {
      patch({ bookings: project.bookings.map((b) => (b.id === editing.id ? ({ ...b, ...form, customer } as Booking) : b)) });
     } else {
      patch({
       bookings: [{
        id: `bk_${Date.now().toString(36)}`,
        customer,
        service: form.service ?? project.services[0]?.name ?? 'خدمة عامة',
        date: form.date ?? '2026-10-16',
        time: form.time ?? '10:00',
        status: form.status ?? 'بانتظار التأكيد',
       }, ...project.bookings],
      });
     }
     setOpen(false);
    }

    return (
     <>
      <TableToolbar
       search={q}
       onSearchChange={setQ}
       searchPlaceholder="ابحث باسم العميل..."
       filters={filters}
       activeFilter={filter}
       onFilterChange={setFilter}
      />

      {filtered.length > 0 ? (
       <div className="table-wrap">
        <table className="data-table">
         <thead>
          <tr>
           <th>المعرف</th>
           <th>العميل</th>
           <th>الخدمة</th>
           <th>التاريخ</th>
           <th>الوقت</th>
           <th>الحالة</th>
           <th>إجراءات</th>
          </tr>
         </thead>
         <tbody>
          {filtered.map((b) => (
           <tr key={b.id}>
            <td className="font-bold text-text-primary">{b.id.slice(-6)}</td>
            <td>{b.customer}</td>
            <td className="text-muted">{b.service}</td>
            <td className="text-muted">{b.date}</td>
            <td dir="ltr">{b.time}</td>
            <td><StatusBadge status={b.status} /></td>
            <td>
             <div className="flex flex-wrap gap-1">
              {b.status !== 'مؤكد' && (
               <button type="button" className="btn btn-primary btn-sm" onClick={() => patch({ bookings: project.bookings.map((x) => (x.id === b.id ? { ...x, status: 'مؤكد' } : x)) })}>تأكيد</button>
              )}
              {b.status !== 'ملغي' && (
               <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => patch({ bookings: project.bookings.map((x) => (x.id === b.id ? { ...x, status: 'ملغي' } : x)) })}>إلغاء</button>
              )}
             </div>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      ) : (
       <div className="table-wrap">
        <EmptyState title={q || filter ? 'لا توجد حجوزات مطابقة' : 'لا توجد حجوزات بعد'} description="أضف أول موعد ليظهر في جدول العملاء." />
       </div>
      )}

      {open && (
       <Modal
        title={editing ? 'تعديل حجز' : 'حجز جديد'}
        onClose={() => setOpen(false)}
        footer={
         <>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ الحجز</button>
         </>
        }
       >
        <Field label="اسم العميل">
         <input id="mod-bk-cust" className="form-control" value={form.customer ?? ''} onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))} />
        </Field>
        <Field label="الخدمة">
         <select id="mod-bk-srv" className="form-control" value={form.service ?? ''} onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}>
          <option value="">— اختر —</option>
          {project.services.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
         </select>
        </Field>
        <div className="grid-2">
         <Field label="التاريخ">
          <input id="mod-bk-date" type="date" className="form-control" value={form.date ?? ''} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
         </Field>
         <Field label="الوقت">
          <input id="mod-bk-time" type="time" className="form-control" value={form.time ?? ''} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
         </Field>
        </div>
       </Modal>
      )}
     </>
    );
   }}
  </DashboardModule>
 );
}
