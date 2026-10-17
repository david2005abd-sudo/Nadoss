'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { Field, Modal, StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';
import type { PageItem } from '@/lib/nasaq/seed';

const BLANK = { title: '', slug: '/', seoDesc: '', status: 'مسودة' };

export default function ContentPage() {
 const [q, setQ] = useState('');
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState<PageItem | null>(null);
 const [form, setForm] = useState<Partial<PageItem>>(BLANK);

 return (
  <DashboardModule
   title="المحتوى والصفحات"
   subtitle="إدارة صفحات الموقع، عناوينها، أوصاف SEO، وحالة النشر."
   actions={() => (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm(BLANK); setOpen(true); }}>
     <IconPlus size={16} /> صفحة جديدة
    </button>
   )}
  >
   {({ project, patch }) => {
    const filtered = project.pages.filter((p) => !q || p.title.includes(q));

    function save() {
     const title = form.title?.trim();
     if (!title) return;
     if (editing) {
      patch({ pages: project.pages.map((p) => (p.id === editing.id ? ({ ...p, ...form, title } as PageItem) : p)) });
     } else {
      patch({ pages: [...project.pages, { id: `pg_${Date.now().toString(36)}`, title, slug: form.slug || '/', seoDesc: form.seoDesc || '', status: form.status || 'مسودة' }] });
     }
     setOpen(false);
    }

    return (
     <>
      {/* ---------- Pages table ---------- */}
      <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث عن صفحة..." />

      {filtered.length > 0 ? (
       <div className="table-wrap nq-reveal">
        <table className="data-table">
         <thead>
          <tr>
           <th>الصفحة</th>
           <th>المسار</th>
           <th>وصف SEO</th>
           <th>الحالة</th>
           <th>إجراءات</th>
          </tr>
         </thead>
         <tbody>
          {filtered.map((p) => (
           <tr key={p.id}>
            <td className="font-bold text-text-primary">{p.title}</td>
            <td dir="ltr" className="font-mono text-xs">{p.slug}</td>
            <td className="max-w-[220px] text-muted">{p.seoDesc || '—'}</td>
            <td>
             <button
              type="button"
              className={`badge ${p.status === 'منشورة' ? 'badge-success' : 'badge-warning'}`}
              onClick={() => patch({ pages: project.pages.map((x) => (x.id === p.id ? { ...x, status: x.status === 'منشورة' ? 'مسودة' : 'منشورة' } : x)) })}
             >
              {p.status}
             </button>
            </td>
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
        <div className="table-empty">لا توجد صفحات محتوى بعد.</div>
       </div>
      )}

      {/* ---------- Hero text ---------- */}
      <div className="card">
       <h2 className="mb-3 text-base font-extrabold">نصوص الصفحة الرئيسية</h2>
       <div className="grid-2 nq-reveal">
        <Field label="عنوان الموقع / الشعار">
         <input
          id="mod-pg-title"
          className="form-control"
          value={project.builder.logoText}
          onChange={(e) => patch({ builder: { ...project.builder, logoText: e.target.value } })}
         />
        </Field>
        <Field label="العنوان الرئيسي (Hero Title)">
         <input
          id="mod-pg-slug"
          className="form-control"
          value={project.builder.heroTitle}
          onChange={(e) => patch({ builder: { ...project.builder, heroTitle: e.target.value } })}
         />
        </Field>
       </div>
       <Field label="العنوان الفرعي (Hero Subtitle)">
        <textarea
         id="mod-pg-seo"
         className="form-control"
         rows={3}
         value={project.builder.heroSubtitle}
         onChange={(e) => patch({ builder: { ...project.builder, heroSubtitle: e.target.value } })}
        />
       </Field>
      </div>

      {/* ---------- Sections ---------- */}
      <div className="card">
       <h2 className="mb-1 text-base font-extrabold">أقسام الموقع</h2>
       <span className="text-xs text-muted">
        فعّل أو عطّل ظهور القسم، وعدّل عنوانه كما يظهر للزوار.
       </span>

       {project.builder.sections.length > 0 ? (
        <div className="mt-3 space-y-2">
         {project.builder.sections.map((s, i) => (
          <div key={s.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-3">
           <span className={`badge ${s.visible ? 'badge-success' : 'badge-muted'}`}>
            {s.visible ? 'ظاهر' : 'مخفي'}
           </span>
           <span className="badge badge-primary">{s.type}</span>
           <input
            id={`mod-sec-title-${i}`}
            className="form-control !py-1"
            style={{ flex: 1, minWidth: 200 }}
            value={s.title}
            onChange={(e) =>
             patch({
              builder: {
               ...project.builder,
               sections: project.builder.sections.map((x) => (x.id === s.id ? { ...x, title: e.target.value } : x)),
              },
             })
            }
           />
           <textarea
            id={`mod-sec-content-${i}`}
            className="form-control !py-1"
            rows={2}
            style={{ flexBasis: '100%' }}
            value={s.content}
            onChange={(e) =>
             patch({
              builder: {
               ...project.builder,
               sections: project.builder.sections.map((x) => (x.id === s.id ? { ...x, content: e.target.value } : x)),
              },
             })
            }
            placeholder="محتوى القسم ال (يهيأ للزوار)...."
           />
           <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() =>
             patch({
              builder: {
               ...project.builder,
               sections: project.builder.sections.map((x) => (x.id === s.id ? { ...x, visible: !x.visible } : x)),
              },
             })
            }
           >
            {s.visible ? 'إخفاء القسم' : 'إظهار القسم'}
           </button>
          </div>
         ))}
        </div>
       ) : (
        <div className="mt-3 rounded-md border border-dashed border-border p-6 text-center text-sm text-muted">
         لم يتم إعداد أقسام الموقع لهذا المشروع بعد. أنشئ مشروعًا جديدًا من معالج الإنشاء أو استخدم القوالب الجاهزة.
        </div>
       )}
      </div>

      {open && (
       <Modal
        title={editing ? 'تعديل صفحة' : 'صفحة جديدة'}
        onClose={() => setOpen(false)}
        footer={
         <>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ</button>
         </>
        }
       >
        <Field label="عنوان الصفحة">
         <input className="form-control" value={form.title ?? ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="اتصل بنا" />
        </Field>
        <div className="grid-2 nq-reveal">
         <Field label="مسار الصفحة">
          <input className="form-control" dir="ltr" value={form.slug ?? ''} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="/contact" />
         </Field>
         <Field label="الحالة">
          <select className="form-control" value={form.status ?? ''} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
           {['مسودة', 'منشورة'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
         </Field>
        </div>
        <Field label="وصف SEO">
         <textarea className="form-control" rows={3} value={form.seoDesc ?? ''} onChange={(e) => setForm((f) => ({ ...f, seoDesc: e.target.value }))} />
        </Field>
       </Modal>
      )}
     </>
    );
   }}
  </DashboardModule>
 );
}
