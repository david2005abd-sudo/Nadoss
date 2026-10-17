'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus, IconSparkle } from '@/components/nasaq/icons';
import type { Coupon } from '@/lib/nasaq/seed';

const BLANK = { code: '', discount: '', uses: 0 };

const CAMPAIGNS = [
 { id: 'cmp_1', name: 'حملة العودة للدراسة', stat: '• تستهدف العملاء السابقين', icon: 'sparkle' },
 { id: 'cmp_2', name: 'عرض الجمعة البيضاء ', stat: '• توقع رفع المبيعات بنسبة 20%', icon: 'chart' },
 { id: 'cmp_3', name: 'كوبون الولاء للعطلاء ', stat: '• يقدم خصم 5% للعملاء العائدين', icon: 'users' },
];

export default function MarketingPage() {
 const [q, setQ] = useState('');
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState<Coupon | null>(null);
 const [form, setForm] = useState<Partial<Coupon>>(BLANK);

 return (
  <DashboardModule
   title="التسويق والعروض"
   subtitle="إنشاء كوبونات خصم وحملات ترويجية لزيادة المبيعات."
   actions={() => (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm(BLANK); setOpen(true); }}>
     <IconPlus size={16} /> كوبون جديد
    </button>
   )}
  >
   {({ project, patch }) => {
    const filtered = project.coupons.filter((c) => !q || (c.code ?? '').includes(q));

    function save() {
     const code = form.code?.trim();
     if (!code) return;
     if (editing) {
      patch({ coupons: project.coupons.map((c) => (c.id === editing.id ? ({ ...c, ...form, code } as Coupon) : c)) });
     } else {
      patch({ coupons: [...project.coupons, { id: `cp_${Date.now().toString(36)}`, code, discount: form.discount || '10%', uses: 0, status: 'نشط' }] });
     }
     setOpen(false);
    }

    return (
     <>
      <div className="grid-3 sm:grid-cols-2 lg:grid-cols-3">
       {CAMPAIGNS.map((c) => (
        <div key={c.id} className="card">
         <div className="icon-box mb-2">{
          c.icon === 'sparkle' ? <IconSparkle size={18} /> : c.icon === 'chart' ? <IconSparkle size={18} /> : <IconSparkle size={18} />
         }</div>
         <h3 className="mb-1 text-sm font-bold">{c.name}</h3>
         <p className="text-xs text-muted">{c.stat}</p>
        </div>
       ))}
      </div>

      <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث بكود الكوبون..." />

      {filtered.length > 0 ? (
       <div className="table-wrap">
        <table className="data-table">
         <thead>
          <tr>
           <th>كود الكوبون</th>
           <th>نسبة / قيمة الخصم</th>
           <th>عدد مرات الاستخدام</th>
           <th>الحالة</th>
           <th>إجراءات</th>
          </tr>
         </thead>
         <tbody>
          {filtered.map((c) => (
           <tr key={c.id}>
            <td className="font-bold text-text-primary" dir="ltr">{c.code}</td>
            <td><span className="badge badge-primary">{c.discount}</span></td>
            <td>{c.uses}</td>
            <td>
             <button
              type="button"
              className={`badge ${c.status === 'نشط' ? 'badge-success' : 'badge-muted'}`}
              onClick={() => patch({ coupons: project.coupons.map((x) => (x.id === c.id ? { ...x, status: x.status === 'نشط' ? 'معطل' : 'نشط' } : x)) })}
             >
              {c.status}
             </button>
            </td>
            <td>
             <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditing(c); setForm(c); setOpen(true); }}>تعديل</button>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      ) : (
       <div className="table-wrap">
        <EmptyState title={q ? 'لا توجد كوبونات مطابقة' : 'لا توجد كوبونات بعد'} description="أنشئ كوبون خصمًا لتنشيط المبيعات." />
       </div>
      )}

      {open && (
       <Modal
        title={editing ? 'تعديل كوبون' : 'كوبون جديد'}
        onClose={() => setOpen(false)}
        footer={
         <>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ</button>
         </>
        }
       >
        <Field label="كود الكوبون">
         <input className="form-control" dir="ltr" value={form.code ?? ''} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="LUNCH20" />
        </Field>
        <Field label="نسبة / قيمة الخصم">
         <input className="form-control" value={form.discount ?? ''} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} placeholder="15%" />
        </Field>
        <Field label="عدد مرات الاستخدام">
         <input type="number" className="form-control" value={form.uses ?? 0} onChange={(e) => setForm((f) => ({ ...f, uses: Number(e.target.value) }))} />
        </Field>
       </Modal>
      )}
     </>
    );
   }}
  </DashboardModule>
 );
}
