'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';
import type { ProProject } from '@/lib/nasaq/seed';

const BLANK = { name: '', client: '', description: '', startDate: '2026-08-01', dueDate: '2026-10-16', status: 'قيد التنفيذ', files: '—' };
const STATUSES = ['قيد التنفيذ', 'منجز', 'مخطط', 'مؤجل'];

export default function PortfolioPage() {
 const [q, setQ] = useState('');
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState<ProProject | null>(null);
 const [form, setForm] = useState<Partial<ProProject>>(BLANK);

 return (
  <DashboardModule
   title="معرض الأعمال"
   subtitle="عرض نماذج الأعمال والمشاريع المنجزة لإبراز خبرتك."
   actions={() => (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm(BLANK); setOpen(true); }}>
     <IconPlus size={16} /> مشروع جديد
    </button>
   )}
  >
   {({ project, patch }) => {
    const filtered = project.proProjects.filter((p) => !q || p.name.includes(q) || (p.client ?? '').includes(q));

    function save() {
     const name = form.name?.trim();
     if (!name) return;
     if (editing) {
      patch({ proProjects: project.proProjects.map((p) => (p.id === editing.id ? ({ ...p, ...form, name } as ProProject) : p)) });
     } else {
      patch({
       proProjects: [...project.proProjects, {
        id: `prj_${Date.now().toString(36)}`,
        name,
        client: form.client ?? 'عميل خاص',
        description: form.description ?? '',
        startDate: form.startDate ?? '2026-08-01',
        dueDate: form.dueDate ?? '2026-10-16',
        status: form.status ?? 'قيد التنفيذ',
        files: form.files ?? '—',
       }],
      });
     }
     setOpen(false);
    }

    return (
     <>
      <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث عن مشروع..." />

      {filtered.length > 0 ? (
       <div className="table-wrap nq-reveal">
        <table className="data-table">
         <thead>
          <tr>
           <th>المشروع</th>
           <th>العميل</th>
           <th>تاريخ البداية</th>
           <th>تاريخ التسليم</th>
           <th>الملفات</th>
           <th>الحالة</th>
           <th>إجراءات</th>
          </tr>
         </thead>
         <tbody>
          {filtered.map((p) => (
           <tr key={p.id}>
            <td className="font-bold text-text-primary">{p.name}</td>
            <td>{p.client}</td>
            <td className="text-muted">{p.startDate}</td>
            <td className="text-muted">{p.dueDate}</td>
            <td className="text-muted">{p.files}</td>
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
        <EmptyState title={q ? 'لا توجد مشاريع مطابقة' : 'لا توجد مشاريع في المعرض بعد'} description="أضف مشروعًا منجزًا لإبراز سابقة أعمالك." />
       </div>
      )}

      {open && (
       <Modal
        title={editing ? 'تعديل مشروع' : 'مشروع جديد'}
        onClose={() => setOpen(false)}
        footer={
         <>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ</button>
         </>
        }
       >
        <Field label="اسم المشروع">
         <input id="mod-prj-name" className="form-control" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </Field>
        <Field label="العميل">
         <input id="mod-prj-client" className="form-control" value={form.client ?? ''} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} />
        </Field>
        <Field label="الوصف">
         <textarea id="mod-prj-desc" className="form-control" rows={3} value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </Field>
        <div className="grid-2 nq-reveal nq-stagger">
         <Field label="تاريخ البداية">
          <input type="date" className="form-control" value={form.startDate ?? ''} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
         </Field>
         <Field label="تاريخ التسليم">
          <input type="date" className="form-control" value={form.dueDate ?? ''} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
         </Field>
        </div>
        <Field label="الحالة">
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
