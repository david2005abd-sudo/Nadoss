'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';
import type { Property } from '@/lib/nasaq/seed';

const BLANK = { name: '', price: '', city: '', type: 'فيلا سكنية', status: 'متاح للعرض', area: '' };
const TYPES = ['فيلا سكنية', 'شقة تمليك', 'مكتب تجاري', 'أرض سكنية', 'عمارة سكنية'];
const STATUSES = ['متاح للعرض', 'محجوز / مباع '];

export default function PropertiesPage() {
 const [q, setQ] = useState('');
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState<Property | null>(null);
 const [form, setForm] = useState<Partial<Property>>(BLANK);

 return (
  <DashboardModule
   title="العقارات"
   subtitle="إدارة الوحدات العقارية للبيع أو الإيجار وحالة العرض."
   actions={() => (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm(BLANK); setOpen(true); }}>
     <IconPlus size={16} /> وحدة جديدة
    </button>
   )}
  >
   {({ project, patch }) => {
    const filtered = project.properties.filter((p) => !q || p.name.includes(q) || (p.city ?? '').includes(q));
    const available = project.properties.filter((p) => p.status === 'متاح للعرض').length;

    function save() {
     const name = form.name?.trim();
     if (!name) return;
     if (editing) {
      patch({ properties: project.properties.map((p) => (p.id === editing.id ? ({ ...p, ...form, name } as Property) : p)) });
     } else {
      patch({
       properties: [...project.properties, {
        id: `prop_${Date.now().toString(36)}`,
        name,
        price: form.price || '0 د.ع',
        city: form.city || project.city,
        type: form.type || 'فيلا سكنية',
        status: form.status || 'متاح للعرض',
        area: form.area || '—',
       }],
      });
     }
     setOpen(false);
    }

    return (
     <>
      <div className="grid-3 sm:grid-cols-2 lg:grid-cols-4">
       <div className="card"><span className="text-xs text-muted">إجمالي الوحدات</span><p className="kpi-value">{project.properties.length}</p></div>
       <div className="card"><span className="text-xs text-muted">متاحة للعرض</span><p className="kpi-value">{available}</p></div>
       <div className="card"><span className="text-xs text-muted">المدينة</span><p className="kpi-value">{project.city}</p></div>
       <div className="card"><span className="text-xs text-muted">حجوزات المعاينة</span><p className="kpi-value">{project.bookings.length}</p></div>
      </div>

      <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث باسم الوحدة أو المدينة..." />

      {filtered.length > 0 ? (
       <div className="table-wrap nq-reveal">
        <table className="data-table">
         <thead>
          <tr>
           <th>العقار</th>
           <th>النوع</th>
           <th>السعر</th>
           <th>المدينة</th>
           <th>المساحة</th>
           <th>الحالة</th>
           <th>إجراءات</th>
          </tr>
         </thead>
         <tbody>
          {filtered.map((p) => (
           <tr key={p.id}>
            <td className="font-bold text-text-primary">{p.name}</td>
            <td><span className="badge badge-muted">{p.type}</span></td>
            <td className="font-bold">{p.price}</td>
            <td>{p.city}</td>
            <td className="text-muted">{p.area}</td>
            <td><StatusBadge status={p.status} /></td>
            <td>
             <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditing(p); setForm(p); setOpen(true); }}>تعديل</button>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      ) : (
       <div className="table-wrap nq-reveal">
        <EmptyState title={q ? 'لا توجد وحدات مطابقة' : 'لا توجد عقارات بعد'} description="أضف أول وحدة عقارية ليظهر للعملاء." />
       </div>
      )}

      {open && (
       <Modal
        title={editing ? 'تعديل وحدة' : 'وحدة عقارية جديدة'}
        onClose={() => setOpen(false)}
        footer={
         <>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ الوحدة</button>
         </>
        }
       >
        <Field label="اسم الوحدة">
         <input id="mod-prop-name" className="form-control" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="فيلا الياسمين بحي الملقا" />
        </Field>
        <div className="grid-2 nq-reveal nq-stagger">
         <Field label="السعر (نص)" help="مثال: 1,250,000,000 د.ع أو 95,000,000 د.ع / سنويًا">
          <input id="mod-prop-price" className="form-control" value={form.price ?? ''} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
         </Field>
         <Field label="المساحة">
          <input className="form-control" value={form.area ?? ''} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} placeholder="320 م²" />
         </Field>
        </div>
        <div className="grid-2 nq-reveal nq-stagger">
         <Field label="المدينة">
          <input id="mod-prop-city" className="form-control" value={form.city ?? ''} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
         </Field>
         <Field label="النوع">
          <select className="form-control" value={form.type ?? ''} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
           {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
         </Field>
        </div>
        <Field label="حالة العرض">
         <select className="form-control" value={form.status ?? ''} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
         </select>
        </Field>
       </Modal>
      )}
     </>
    );
   }}
  </DashboardModule>
 );
}
