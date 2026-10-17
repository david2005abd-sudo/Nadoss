'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';

type ProjectFile = { id: string; name: string; type: string; size: string; date: string; status: string };

const INITIAL: ProjectFile[] = [
 { id: 'f_1', name: 'مخطط هندسي 3D.pdf', type: 'PDF', size: '2.4 ميجابايت', date: '2026-09-12', status: 'منشور' },
 { id: 'f_2', name: 'عقد توريد.docx', type: 'DOCX', size: '640 كيلوبايت', date: '2026-09-28', status: 'مسودة' },
 { id: 'f_3', name: 'صور الواجهة.png', type: 'PNG', size: '1.1 ميجابايت', date: '2026-10-02', status: 'منشور' },
];

export default function FilesPage() {
 const [files, setFiles] = useState<ProjectFile[]>(INITIAL);
 const [q, setQ] = useState('');
 const [open, setOpen] = useState(false);
 const [form, setForm] = useState<Partial<ProjectFile>>({ name: '', type: 'PDF', size: '1 ميجابايت', status: 'مسودة' });

 const filtered = files.filter((f) => !q || f.name.includes(q));

 return (
  <DashboardModule
   title="الملفات والمخططات"
   subtitle="مكتبة لحفظ المخططات الهندسية والعقود والملفات المرفقة ال."
   actions={ctx => (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
     <IconPlus size={16} /> ملف جديد
    </button>
   )}
  >
   {() => (
    <>
     <TableToolbar
      search={q}
      onSearchChange={setQ}
      searchPlaceholder="ابحث في الملفات..."
      action={
       <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
        <IconPlus size={16} /> إضافة ملف
       </button>
      }
     />

     {filtered.length > 0 ? (
      <div className="table-wrap nq-reveal">
       <table className="data-table">
        <thead>
         <tr>
          <th>اسم الملف</th>
          <th>النوع</th>
          <th>الحجم</th>
          <th>تاريخ الرفع</th>
          <th>الحالة</th>
         </tr>
        </thead>
        <tbody>
         {filtered.map((f) => (
          <tr key={f.id}>
           <td className="font-bold text-text-primary">{f.name}</td>
           <td><span className="badge badge-muted">{f.type}</span></td>
           <td className="text-muted">{f.size}</td>
           <td className="text-muted">{f.date}</td>
           <td>
            <span className={`badge ${f.status === 'منشور' ? 'badge-success' : 'badge-warning'}`}>{f.status}</span>
           </td>
          </tr>
         ))}
        </tbody>
       </table>
      </div>
     ) : (
      <div className="table-wrap nq-reveal">
       <EmptyState
        title={q ? 'لا توجد ملفات مطابقة' : 'لا توجد ملفات بعد'}
        description="ارفع مخططاتك وعقودك لتشاركها مع فريقك وعملائك."
       />
      </div>
     )}

     {open && (
      <Modal
       title="إضافة ملف"
       onClose={() => setOpen(false)}
       footer={
        <>
         <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
         <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
           const name = form.name?.trim();
           if (!name) return;
           setFiles([{ id: `f_${Date.now().toString(36)}`, name, type: form.type || 'PDF', size: form.size || '1 ميجابايت', date: '2026-10-16', status: form.status || 'مسودة' }, ...files]);
           setOpen(false);
          }}
         >
          إضافة الملف
         </button>
        </>
       }
      >
       <Field label="اسم الملف">
        <input className="form-control" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="عقد التصميم الداخلي.pdf" />
       </Field>
       <div className="grid-2 nq-reveal">
        <Field label="النوع">
         <select className="form-control" value={form.type ?? ''} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
          {['PDF', 'DOCX', 'PNG', 'JPG', 'XLSX', 'DWG'].map((t) => <option key={t} value={t}>{t}</option>)}
         </select>
        </Field>
        <Field label="الحجم">
         <input className="form-control" value={form.size ?? ''} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} />
        </Field>
       </div>
       <Field label="الحالة">
        <select className="form-control" value={form.status ?? ''} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
         {['مسودة', 'منشور'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
       </Field>
       <p className="text-xs text-muted">ملاحظة: الملفات هنا لأغراض التوثيق ولم تُرفع إلى أي خادم خارجي.</p>
      </Modal>
     )}
    </>
   )}
  </DashboardModule>
 );
}
