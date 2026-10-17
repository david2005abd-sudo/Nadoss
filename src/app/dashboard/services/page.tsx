'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';
import { formatIQD } from '@/lib/utils';
import type { Service } from '@/lib/nasaq/seed';

const BLANK = { name: '', description: '', price: 0, duration: '30 دقيقة' };

export default function ServicesPage() {
 const [q, setQ] = useState('');
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState<Service | null>(null);
 const [form, setForm] = useState<Partial<Service>>(BLANK);

 return (
  <DashboardModule
   title="الخدمات"
   subtitle="عرّف خدماتك ومدتها وأسعارها التقديرية للعملاء."
   actions={() => (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm(BLANK); setOpen(true); }}>
     <IconPlus size={16} /> خدمة جديدة
    </button>
   )}
  >
   {({ project, patch }) => {
    const filtered = project.services.filter((s) => !q || s.name.includes(q) || (s.description ?? '').includes(q));

    function save() {
     const name = form.name?.trim();
     if (!name) return;
     if (editing) {
      patch({ services: project.services.map((s) => (s.id === editing.id ? ({ ...s, ...form, name } as Service) : s)) });
     } else {
      patch({ services: [...project.services, { id: `srv_${Date.now().toString(36)}`, name, description: form.description ?? '', price: Number(form.price ?? 0), duration: form.duration || '30 دقيقة', status: 'نشط' }] });
     }
     setOpen(false);
    }

    return (
     <>
      <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث عن خدمة..." />

      {filtered.length > 0 ? (
       <div className="table-wrap">
        <table className="data-table">
         <thead>
          <tr>
           <th>الخدمة</th>
           <th>الوصف</th>
           <th>السعر</th>
           <th>المدة</th>
           <th>إجراءات</th>
          </tr>
         </thead>
         <tbody>
          {filtered.map((s) => (
           <tr key={s.id}>
            <td className="font-bold text-text-primary">{s.name}</td>
            <td className="text-muted">{s.description || '—'}</td>
            <td className="font-bold">{formatIQD(s.price)}</td>
            <td><span className="badge badge-muted">{s.duration}</span></td>
            <td>
             <div className="flex gap-1">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditing(s); setForm(s); setOpen(true); }}>تعديل</button>
              <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => patch({ services: project.services.filter((x) => x.id !== s.id) })}>حذف</button>
             </div>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      ) : (
       <div className="table-wrap">
        <EmptyState title={q ? 'لا توجد خدمات مطابقة' : 'لا توجد خدمات بعد'} description="أضف خدمتك الأولى لتظهر للعملاء على الموقع." />
       </div>
      )}

      {open && (
       <Modal
        title={editing ? 'تعديل خدمة' : 'خدمة جديدة'}
        onClose={() => setOpen(false)}
        footer={
         <>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ الخدمة</button>
         </>
        }
       >
        <Field label="اسم الخدمة">
         <input id="mod-srv-name" className="form-control" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="مثال: فحص شامل للمركبة" />
        </Field>
        <Field label="الوصف">
         <textarea id="mod-srv-desc" className="form-control" rows={3} value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </Field>
        <div className="grid-2">
         <Field label="السعر">
          <input id="mod-srv-price" type="number" className="form-control" value={form.price ?? 0} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
         </Field>
         <Field label="المدة المتوقعة">
          <input id="mod-srv-dur" className="form-control" value={form.duration ?? ''} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="45 دقيقة" />
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
