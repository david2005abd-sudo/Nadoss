'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';
import { formatIQD } from '@/lib/utils';
import type { Quote } from '@/lib/nasaq/seed';

const BLANK = { title: '', client: '', amount: 0, status: 'بانتظار موافقة العميل' };
const STATUSES = ['بانتظار موافقة العميل', 'معتمد', 'ملغي'];

export default function QuotesPage() {
 const [q, setQ] = useState('');
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState<Quote | null>(null);
 const [form, setForm] = useState<Partial<Quote>>(BLANK);

 return (
  <DashboardModule
   title="عروض الأسعار"
   subtitle="إنشاء عروض أسعار تقديرية للعملاء ومتابعة الموافقة."
   actions={() => (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm(BLANK); setOpen(true); }}>
     <IconPlus size={16} /> عرض سعر جديد
    </button>
   )}
  >
   {({ project, patch }) => {
    const filtered = project.quotes.filter((x) => !q || (x.client ?? '').includes(q) || (x.title ?? '').includes(q));

    function save() {
     const title = form.title?.trim();
     if (!title) return;
     if (editing) {
      patch({ quotes: project.quotes.map((x) => (x.id === editing.id ? ({ ...x, ...form, title } as Quote) : x)) });
     } else {
      patch({ quotes: [...project.quotes, { id: `QT-${Math.floor(300 + Math.random() * 600)}`, title, client: form.client ?? 'عميل جديد', amount: Number(form.amount ?? 0), status: form.status ?? 'بانتظار موافقة العميل' }] });
     }
     setOpen(false);
    }

    return (
     <>
      <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث بعنوان العرض أو العميل..." />

      {filtered.length > 0 ? (
       <div className="table-wrap">
        <table className="data-table">
         <thead>
          <tr>
           <th>رقم العرض</th>
           <th>العنوان</th>
           <th>العميل</th>
           <th>المبلغ</th>
           <th>الحالة</th>
           <th>إجراءات</th>
          </tr>
         </thead>
         <tbody>
          {filtered.map((x) => (
           <tr key={x.id}>
            <td className="font-bold text-text-primary">{x.id}</td>
            <td>{x.title}</td>
            <td>{x.client}</td>
            <td className="font-bold">{formatIQD(x.amount)}</td>
            <td><StatusBadge status={x.status} /></td>
            <td>
             <div className="flex flex-wrap gap-1">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditing(x); setForm(x); setOpen(true); }}>تعديل</button>
              {x.status !== 'معتمد' && (
               <button type="button" className="btn btn-primary btn-sm" onClick={() => patch({ quotes: project.quotes.map((y) => (y.id === x.id ? { ...y, status: 'معتمد' } : y)) })}>اعتماد</button>
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
        <EmptyState title={q ? 'لا توجد عروض مطابقة' : 'لا توجد عروض أسعار بعد'} description="جهز عرض سعر احترافي لعميلك الآن." />
       </div>
      )}

      {open && (
       <Modal
        title={editing ? 'تعديل عرض سعر' : 'عرض سعر جديد'}
        onClose={() => setOpen(false)}
        footer={
         <>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ العرض</button>
         </>
        }
       >
        <Field label="عنوان العرض">
         <input id="mod-q-title" className="form-control" value={form.title ?? ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="مثال: تصميم واجهة تجارية" />
        </Field>
        <Field label="العميل">
         <input id="mod-q-client" className="form-control" value={form.client ?? ''} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} />
        </Field>
        <div className="grid-2">
         <Field label="المبلغ">
          <input id="mod-q-amount" type="number" className="form-control" value={form.amount ?? 0} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} />
         </Field>
         <Field label="الحالة">
          <select className="form-control" value={form.status ?? ''} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
           {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
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
