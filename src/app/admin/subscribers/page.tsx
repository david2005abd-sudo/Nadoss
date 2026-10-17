'use client';

import { useState } from 'react';
import { useNasaq } from '@/lib/nasaq/store';
import { AdminHeader } from '@/components/nasaq/admin-shell';
import { Field, Modal, StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';

export default function AdminSubscribersPage() {
 const { state, patchPlatform } = useNasaq();
 const [q, setQ] = useState('');
 const [open, setOpen] = useState(false);
 const [form, setForm] = useState({ name: '', email: '', plan: state.plans[0]?.code ?? 'Starter' });

 const filtered = state.subscribers.filter(
  (s) => !q || s.name.includes(q) || s.email.includes(q) || s.plan.includes(q)
 );

 return (
  <>
   <AdminHeader
    title="المشتركون"
    subtitle="قائمة المشتركين الين وباقاتهم وحالة اشتراكهم واستهلاك الذكاء الاصطناعي."
    actions={
     <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
      <IconPlus size={16} /> مشترك جديد
     </button>
    }
   />

   <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث بالاسم أو الباقة..." />

   <div className="table-wrap">
    <table className="data-table">
     <thead>
      <tr>
       <th>المشترك</th>
       <th>البريد الإلكتروني</th>
       <th>الباقة</th>
       <th>المشاريع</th>
       <th>النشاط</th>
       <th>استهلاك AI</th>
       <th>تاريخ الاشتراك</th>
       <th>الحالة</th>
       <th>إجراءات</th>
      </tr>
     </thead>
     <tbody>
      {filtered.map((s) => (
       <tr key={s.id}>
        <td className="font-bold text-text-primary">{s.name}</td>
        <td dir="ltr" className="text-muted">{s.email}</td>
        <td><span className="badge badge-primary">{s.plan}</span></td>
        <td>{s.projectsCount}</td>
        <td className="text-muted">{s.activity}</td>
        <td className="text-muted">{s.aiUsage}</td>
        <td className="text-muted">{s.createdAt}</td>
        <td><StatusBadge status={s.status} /></td>
        <td>
         <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() =>
           patchPlatform({
            subscribers: state.subscribers.map((x) =>
             x.id === s.id ? { ...x, status: x.status === 'نشط' ? '' : 'نشط' } : x
            ),
           })
          }
         >
          تبديل الحالة
         </button>
        </td>
       </tr>
      ))}
     </tbody>
    </table>
   </div>

   {open && (
    <Modal
     title="مشترك جديد"
     onClose={() => setOpen(false)}
     footer={
      <>
       <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
       <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={() => {
         const name = form.name.trim();
         if (!name) return;
         patchPlatform({
          subscribers: [
           ...state.subscribers,
           {
            id: `sub_${Date.now().toString(36)}`,
            name,
            email: form.email || 'user@nasaq.iq',
            projectsCount: 0,
            activity: 'اليوم',
            plan: form.plan,
            status: '',
            createdAt: '2026-10-16',
            aiUsage: '0/100 طلب ',
           },
          ],
         });
         setOpen(false);
        }}
       >
        إضافة المشترك
       </button>
      </>
     }
    >
     <Field label="اسم المشترك">
      <input id="mod-sub-name" className="form-control" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
     </Field>
     <Field label="البريد الإلكتروني">
      <input id="mod-sub-email" className="form-control" dir="ltr" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
     </Field>
     <Field label="الباقة">
      <select id="mod-sub-plan" className="form-control" value={form.plan} onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}>
       {state.plans.map((p) => (
        <option key={p.id} value={p.code}>{p.nameAr}</option>
       ))}
      </select>
     </Field>
    </Modal>
   )}
  </>
 );
}
