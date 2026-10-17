'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';
import { formatIQD } from '@/lib/utils';
import type { DigitalItem } from '@/lib/nasaq/seed';

const BLANK = { name: '', type: 'كود تفعيل فوري', price: 0, availableCodes: 0, sampleCode: 'DEMO-CODE-XXXX', deliveryStatus: 'جاهز للتسليم' };
const TYPES = ['كود تفعيل فوري', 'رصيد فوري', 'تفعيل تلقائي', 'رابط تنزيل'];

export default function DigitalDeliveryPage() {
 const [q, setQ] = useState('');
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState<DigitalItem | null>(null);
 const [form, setForm] = useState<Partial<DigitalItem>>(BLANK);
 const [revealed, setRevealed] = useState<string | null>(null);

 return (
  <DashboardModule
   title="التسليم الرقمي"
   subtitle="إدارة الأكواد والملفات الرقمية واشتراكات التسليم الفوري."
   actions={() => (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm(BLANK); setOpen(true); }}>
     <IconPlus size={16} /> منتج رقمي جديد
    </button>
   )}
  >
   {({ project, patch }) => {
    const filtered = project.digitalItems.filter((d) => !q || d.name.includes(q) || (d.type ?? '').includes(q));
    const totalCodes = project.digitalItems.reduce((s, d) => s + (d.availableCodes ?? 0), 0);

    function save() {
     const name = form.name?.trim();
     if (!name) return;
     if (editing) {
      patch({ digitalItems: project.digitalItems.map((d) => (d.id === editing.id ? ({ ...d, ...form, name } as DigitalItem) : d)) });
     } else {
      patch({ digitalItems: [...project.digitalItems, { id: `dig_${Date.now().toString(36)}`, name, type: form.type || 'كود تفعيل فوري', price: Number(form.price ?? 0), availableCodes: Number(form.availableCodes ?? 0), sampleCode: form.sampleCode || 'DEMO-CODE-XXXX', deliveryStatus: form.deliveryStatus || 'جاهز للتسليم' }] });
     }
     setOpen(false);
    }

    function mask(code: string) {
     return `${code.slice(0, 12)}…`;
    }

    return (
     <>
      <div className="grid-3 sm:grid-cols-3 nq-reveal">
       <div className="card"><span className="text-xs text-muted">منتجات رقمية</span><p className="kpi-value">{project.digitalItems.length}</p></div>
       <div className="card"><span className="text-xs text-muted">أكواد متاحة</span><p className="kpi-value">{totalCodes}</p></div>
       <div className="card"><span className="text-xs text-muted">طلبات مكتملة</span><p className="kpi-value">{project.orders.filter((o) => o.status?.includes('تم تسليم الكود')).length}</p></div>
      </div>

      <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث عن منتج رقمي..." />

      {filtered.length > 0 ? (
       <div className="table-wrap nq-reveal">
        <table className="data-table">
         <thead>
          <tr>
           <th>المنتج</th>
           <th>نوع التسليم</th>
           <th>السعر</th>
           <th>الأكواد المتاحة</th>
           <th>رمز </th>
           <th>الحالة</th>
           <th>إجراءات</th>
          </tr>
         </thead>
         <tbody>
          {filtered.map((d) => (
           <tr key={d.id}>
            <td className="font-bold text-text-primary">{d.name}</td>
            <td><span className="badge badge-muted">{d.type}</span></td>
            <td className="font-bold">{formatIQD(d.price)}</td>
            <td>
             <span className={`badge ${d.availableCodes === 0 ? 'badge-danger' : d.availableCodes <= 10 ? 'badge-warning' : 'badge-success'}`}>
              {d.availableCodes}
             </span>
            </td>
            <td dir="ltr" className="font-mono text-xs">
             {revealed === d.id ? d.sampleCode : mask(d.sampleCode)}
             <button type="button" className="btn btn-outline btn-sm mr-2" onClick={() => setRevealed(revealed === d.id ? null : d.id)}>
              {revealed === d.id ? 'إخفاء' : 'عرض'}
             </button>
            </td>
            <td><StatusBadge status={d.deliveryStatus} /></td>
            <td>
             <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditing(d); setForm(d); setOpen(true); }}>تعديل</button>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      ) : (
       <div className="table-wrap nq-reveal">
        <EmptyState title={q ? 'لا توجد منتجات مطابقة' : 'لا توجد منتجات رقمية بعد'} description="أضف منتجًا رقميًا ليتم تسليمه فورًا للعملاء." />
       </div>
      )}

      {open && (
       <Modal
        title={editing ? 'تعديل منتج رقمي' : 'منتج رقمي جديد'}
        onClose={() => setOpen(false)}
        footer={
         <>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ</button>
         </>
        }
       >
        <Field label="اسم المنتج">
         <input id="mod-dig-name" className="form-control" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </Field>
        <div className="grid-2 nq-reveal nq-stagger">
         <Field label="نوع التسليم">
          <select id="mod-dig-type" className="form-control" value={form.type ?? ''} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
           {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
         </Field>
         <Field label="السعر">
          <input id="mod-dig-price" type="number" className="form-control" value={form.price ?? 0} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
         </Field>
        </div>
        <div className="grid-2 nq-reveal nq-stagger">
         <Field label="عدد الأكواد المتاحة">
          <input type="number" className="form-control" value={form.availableCodes ?? 0} onChange={(e) => setForm((f) => ({ ...f, availableCodes: Number(e.target.value) }))} />
         </Field>
         <Field label="رمز " help="مُقنَّع افتراضيًا لحماية البيانات.">
          <input className="form-control" dir="ltr" value={form.sampleCode ?? ''} onChange={(e) => setForm((f) => ({ ...f, sampleCode: e.target.value }))} />
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
