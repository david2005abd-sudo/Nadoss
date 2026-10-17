'use client';

import { useNasaq } from '@/lib/nasaq/store';
import { AdminHeader } from '@/components/nasaq/admin-shell';
import { Field, Modal } from '@/components/nasaq/ui';
import { useState } from 'react';
import { IconPlus } from '@/components/nasaq/icons';

export default function AdminPlansPage() {
 const { state, patchPlatform } = useNasaq();
 const [open, setOpen] = useState(false);
 const [form, setForm] = useState({ nameAr: '', code: 'Custom', price: 0, maxProjects: 1, maxPages: 5, aiLimit: '100 طلب / شهر', storage: '2 جيجابايت', availableModules: 'الوحدات الأساسية' });

 return (
  <>
   <AdminHeader
    title="الباقات والأسعار"
    subtitle="أضِف أو عدّل باقات اشتراك تحمل نفس أسماء الباقات التي تظهر للعملاء."
    actions={
     <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
      <IconPlus size={16} /> باقة جديدة
     </button>
    }
   />

   <div className="grid-3 nq-reveal">
    {state.plans.map((p) => (
     <div key={p.id} className={p.popular ? 'card border-primary' : 'card'}>
      <div className="mb-2 flex items-center justify-between">
       <span className="text-lg font-extrabold">{p.nameAr}</span>
       {p.popular ? <span className="badge badge-primary">الأكثر اختيارًا</span> : <span className="badge badge-muted"></span>}
      </div>

      <div className="mb-3">
       <span className="text-3xl font-extrabold text-primary">{p.price}</span>
       <span className="text-sm text-muted"> د.ع / {p.period}</span>
      </div>

      <div className="space-y-2 text-sm">
       <Field label="عدد المشاريع المسموحة">
        <input
         type="number"
         className="form-control"
         value={p.maxProjects}
         onChange={(e) =>
          patchPlatform({
           plans: state.plans.map((x) => (x.id === p.id ? { ...x, maxProjects: Number(e.target.value) } : x)),
          })
         }
        />
       </Field>
       <Field label="عدد الصفحات">
        <input
         type="number"
         className="form-control"
         value={p.maxPages}
         onChange={(e) =>
          patchPlatform({
           plans: state.plans.map((x) => (x.id === p.id ? { ...x, maxPages: Number(e.target.value) } : x)),
          })
         }
        />
       </Field>
       <Field label="حصة الذكاء الاصطناعي">
        <input
         className="form-control"
         value={p.aiLimit}
         onChange={(e) =>
          patchPlatform({
           plans: state.plans.map((x) => (x.id === p.id ? { ...x, aiLimit: e.target.value } : x)),
          })
         }
        />
       </Field>
       <Field label="التخزين">
        <input
         className="form-control"
         value={p.storage}
         onChange={(e) =>
          patchPlatform({
           plans: state.plans.map((x) => (x.id === p.id ? { ...x, storage: e.target.value } : x)),
          })
         }
        />
       </Field>
       <Field label="الوحدات المتاحة">
        <textarea
         className="form-control"
         rows={2}
         value={p.availableModules}
         onChange={(e) =>
          patchPlatform({
           plans: state.plans.map((x) => (x.id === p.id ? { ...x, availableModules: e.target.value } : x)),
          })
         }
        />
       </Field>
      </div>

      <button
       type="button"
       className={`btn btn-sm mt-3 ${p.popular ? 'btn-outline' : 'btn-primary'}`}
       onClick={() =>
        patchPlatform({
         plans: state.plans.map((x) => ({ ...x, popular: x.id === p.id ? !x.popular : false })),
        })
       }
      >
       {p.popular ? 'إلغاء التمييز' : 'تمييز كالأكثر اختيارًا'}
      </button>
     </div>
    ))}
   </div>

   {open && (
    <Modal
     title="باقة جديدة"
     onClose={() => setOpen(false)}
     footer={
      <>
       <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
       <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={() => {
         const nameAr = form.nameAr.trim();
         if (!nameAr) return;
         patchPlatform({
          plans: [
           ...state.plans,
           {
            id: `plan_${Date.now().toString(36)}`,
            code: form.code,
            nameAr,
            price: form.price,
            period: 'شهريًا',
            maxProjects: form.maxProjects,
            maxPages: form.maxPages,
            aiLimit: form.aiLimit,
            storage: form.storage,
            availableModules: form.availableModules,
            status: '',
            popular: false,
           },
          ],
         });
         setOpen(false);
        }}
       >
        إضافة الباقة
       </button>
      </>
     }
    >
     <Field label="اسم الباقة (عربي)">
      <input id="mod-pl-name" className="form-control" value={form.nameAr} onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))} placeholder="باقة مخصصة" />
     </Field>
     <div className="grid-2 nq-reveal">
      <Field label="الكود">
       <input id="mod-pl-code" className="form-control" dir="ltr" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
      </Field>
      <Field label="السعر (د.ع)">
       <input id="mod-pl-price" type="number" className="form-control" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
      </Field>
     </div>
     <div className="grid-2 nq-reveal">
      <Field label="عدد المشاريع">
       <input id="mod-pl-proj" type="number" className="form-control" value={form.maxProjects} onChange={(e) => setForm((f) => ({ ...f, maxProjects: Number(e.target.value) }))} />
      </Field>
      <Field label="عدد الصفحات">
       <input id="mod-pl-pages" type="number" className="form-control" value={form.maxPages} onChange={(e) => setForm((f) => ({ ...f, maxPages: Number(e.target.value) }))} />
      </Field>
     </div>
     <Field label="حصة الذكاء الاصطناعي">
      <input id="mod-pl-ai" className="form-control" value={form.aiLimit} onChange={(e) => setForm((f) => ({ ...f, aiLimit: e.target.value }))} />
     </Field>
     <Field label="الوحدات المتاحة">
      <textarea className="form-control" rows={2} value={form.availableModules} onChange={(e) => setForm((f) => ({ ...f, availableModules: e.target.value }))} />
     </Field>
    </Modal>
   )}
  </>
 );
}
