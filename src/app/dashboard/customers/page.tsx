'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, KpiCard, Modal, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus, IconUsers } from '@/components/nasaq/icons';
import { formatIQD } from '@/lib/utils';
import type { Customer } from '@/lib/nasaq/seed';

const BLANK = { name: '', phone: '', city: '' };

export default function CustomersPage() {
 const [q, setQ] = useState('');
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState<Customer | null>(null);
 const [form, setForm] = useState<Partial<Customer>>(BLANK);

 return (
  <DashboardModule
   title="العملاء"
   subtitle="قاعدة بيانات العملاء وسجل مشترياتهم."
   actions={() => (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm(BLANK); setOpen(true); }}>
     <IconPlus size={16} /> عميل جديد
    </button>
   )}
  >
   {({ project, patch }) => {
    const filtered = project.customers.filter((c) => !q || c.name.includes(q) || c.phone.includes(q));
    const totalSpent = project.customers.reduce((s, c) => s + (c.totalSpent ?? 0), 0);
    const avg = project.customers.length ? Math.round(totalSpent / project.customers.length) : 0;

    function save() {
     const name = form.name?.trim();
     if (!name) return;
     if (editing) {
      patch({ customers: project.customers.map((c) => (c.id === editing.id ? ({ ...c, ...form, name } as Customer) : c)) });
     } else {
      patch({
       customers: [{
        id: `c_${Date.now().toString(36)}`,
        name,
        phone: form.phone ?? '',
        city: form.city ?? '—',
        ordersCount: 0,
        totalSpent: 0,
        lastActivity: 'اليوم',
       }, ...project.customers],
      });
     }
     setOpen(false);
    }

    return (
     <>
      <div className="grid-4 nq-reveal nq-stagger">
       <KpiCard label="عدد العملاء" value={project.customers.length} icon={<IconUsers size={18} />} tone="purple" />
       <KpiCard label="إجمالي المشتريات" value={formatIQD(totalSpent)} icon={<IconUsers size={18} />} tone="green" />
       <KpiCard label="متوسط قيمة العميل" value={formatIQD(avg)} icon={<IconUsers size={18} />} tone="amber" />
       <KpiCard label="أكثر العملاء نشاطًا" value={project.customers[0]?.name ?? '—'} icon={<IconUsers size={18} />} tone="teal" />
      </div>

      <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث باسم العميل أو رقمه..." />

      {filtered.length > 0 ? (
       <div className="table-wrap nq-reveal">
        <table className="data-table">
         <thead>
          <tr>
           <th>العميل</th>
           <th>الهاتف</th>
           <th>المدينة</th>
           <th>الطلبات</th>
           <th>إجمالي المشتريات</th>
           <th>آخر نشاط</th>
           <th>إجراءات</th>
          </tr>
         </thead>
         <tbody>
          {filtered.map((c) => (
           <tr key={c.id}>
            <td className="font-bold text-text-primary">{c.name}</td>
            <td dir="ltr" className="text-muted">{c.phone}</td>
            <td><span className="badge badge-muted">{c.city}</span></td>
            <td>{c.ordersCount}</td>
            <td className="font-bold">{formatIQD(c.totalSpent)}</td>
            <td className="text-muted">{c.lastActivity}</td>
            <td>
             <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditing(c); setForm(c); setOpen(true); }}>تعديل</button>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      ) : (
       <div className="table-wrap nq-reveal">
        <EmptyState title={q ? 'لا توجد نتائج مطابقة' : 'لا يوجد عملاء بعد'} description="أضف أول عميل لك لبدء المتابعة." />
       </div>
      )}

      {open && (
       <Modal
        title={editing ? 'تعديل عميل' : 'عميل جديد'}
        onClose={() => setOpen(false)}
        footer={
         <>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ العميل</button>
         </>
        }
       >
        <Field label="اسم العميل">
         <input id="mod-cust-name" className="form-control" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="الاسم الكامل" />
        </Field>
        <Field label="رقم الهاتف">
         <input id="mod-cust-phone" className="form-control" value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="05XXXXXXXX" />
        </Field>
        <Field label="المدينة">
         <input id="mod-cust-city" className="form-control" value={form.city ?? ''} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="الرياض" />
        </Field>
       </Modal>
      )}
     </>
    );
   }}
  </DashboardModule>
 );
}
