'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';
import type { Vehicle } from '@/lib/nasaq/seed';

const BLANK = { plate: '', model: '', owner: '', lastService: '' };

export default function VehiclesPage() {
 const [q, setQ] = useState('');
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState<Vehicle | null>(null);
 const [form, setForm] = useState<Partial<Vehicle>>(BLANK);

 return (
  <DashboardModule
   title="المركبات"
   subtitle="سجل مركبات العملاء وتاريخ الفحص والصيانة الدورية."
   actions={() => (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm(BLANK); setOpen(true); }}>
     <IconPlus size={16} /> مركبة جديدة
    </button>
   )}
  >
   {({ project, patch }) => {
    const filtered = project.vehicles.filter(
     (v) => !q || (v.owner ?? '').includes(q) || (v.model ?? '').includes(q) || (v.plate ?? '').includes(q)
    );

    function save() {
     const owner = form.owner?.trim();
     if (!owner) return;
     if (editing) {
      patch({ vehicles: project.vehicles.map((v) => (v.id === editing.id ? ({ ...v, ...form, owner } as Vehicle) : v)) });
     } else {
      patch({
       vehicles: [...project.vehicles, {
        id: `vh_${Date.now().toString(36)}`,
        plate: form.plate || '—',
        model: form.model || '—',
        owner,
        lastService: form.lastService || '—',
       }],
      });
     }
     setOpen(false);
    }

    return (
     <>
      <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث باسم المالك أو الموديل..." />

      {filtered.length > 0 ? (
       <div className="table-wrap">
        <table className="data-table">
         <thead>
          <tr>
           <th>رقم اللوحة</th>
           <th>الموديل والسنة</th>
           <th>العميل المالك</th>
           <th>آخر صيانة / فحص</th>
           <th>إجراءات</th>
          </tr>
         </thead>
         <tbody>
          {filtered.map((v) => (
           <tr key={v.id}>
            <td className="font-bold text-text-primary" dir="ltr">{v.plate}</td>
            <td>{v.model}</td>
            <td>{v.owner}</td>
            <td className="text-muted">{v.lastService}</td>
            <td>
             <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditing(v); setForm(v); setOpen(true); }}>تعديل</button>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      ) : (
       <div className="table-wrap">
        <EmptyState
         title={q ? 'لا توجد مركبات مطابقة' : 'لا توجد مركبات بعد'}
         description="اربط مركبات العملاء لتتبع مواعيد الفحص والصيانة الدورية."
        />
       </div>
      )}

      {open && (
       <Modal
        title={editing ? 'تعديل مركبة' : 'مركبة جديدة'}
        onClose={() => setOpen(false)}
        footer={
         <>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ</button>
         </>
        }
       >
        <Field label="رقم اللوحة">
         <input className="form-control" dir="ltr" value={form.plate ?? ''} onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))} placeholder="أ ب ج 1234" />
        </Field>
        <Field label="الموديل والسنة">
         <input className="form-control" value={form.model ?? ''} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} placeholder="تويوتا كامري 2022" />
        </Field>
        <Field label="العميل المالك">
         <input className="form-control" value={form.owner ?? ''} onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))} />
        </Field>
        <Field label="آخر صيانة / فحص">
         <input type="date" className="form-control" value={form.lastService ?? ''} onChange={(e) => setForm((f) => ({ ...f, lastService: e.target.value }))} />
        </Field>
       </Modal>
      )}
     </>
    );
   }}
  </DashboardModule>
 );
}
