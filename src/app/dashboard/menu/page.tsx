'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';
import { formatIQD } from '@/lib/utils';
import type { MenuItem } from '@/lib/nasaq/seed';

const BLANK = { name: '', category: '', price: 0, available: true, popular: false };

export default function MenuPage() {
 const [q, setQ] = useState('');
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState<MenuItem | null>(null);
 const [form, setForm] = useState<Partial<MenuItem>>(BLANK);

 return (
  <DashboardModule
   title="المنيو والوجبات"
   subtitle="إدارة قائمة الطعام والمشروبات والإضافات وحالة التوفر."
   actions={() => (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm(BLANK); setOpen(true); }}>
     <IconPlus size={16} /> صنف جديد
    </button>
   )}
  >
   {({ project, patch }) => {
    const filtered = project.menu.filter((m) => !q || m.name.includes(q) || m.category.includes(q));
    const cats = Array.from(new Set(project.menu.map((m) => m.category)));

    function save() {
     const name = form.name?.trim();
     if (!name) return;
     if (editing) {
      patch({ menu: project.menu.map((m) => (m.id === editing.id ? ({ ...m, ...form, name } as MenuItem) : m)) });
     } else {
      patch({
       menu: [{
        id: `m_${Date.now().toString(36)}`,
        name,
        category: form.category ?? project.categories[0]?.name ?? 'غير مصنف',
        price: Number(form.price ?? 0),
        addons: '',
        available: true,
        orders: 0,
        popular: false,
       }, ...project.menu],
      });
     }
     setOpen(false);
    }

    return (
     <>
      <div className="flex flex-wrap gap-1">
       {cats.map((c) => <span key={c} className="badge badge-muted">{c}</span>)}
      </div>

      <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث عن صنف..." />

      {filtered.length > 0 ? (
       <div className="table-wrap">
        <table className="data-table">
         <thead>
          <tr>
           <th>الصنف</th>
           <th>الفئة</th>
           <th>السعر</th>
           <th>عدد الطلبات</th>
           <th>شائع</th>
           <th>التوفر</th>
           <th>إجراءات</th>
          </tr>
         </thead>
         <tbody>
          {filtered.map((m) => (
           <tr key={m.id}>
            <td className="font-bold text-text-primary">{m.name}</td>
            <td><span className="badge badge-muted">{m.category}</span></td>
            <td className="font-bold">{formatIQD(m.price)}</td>
            <td>{m.orders}</td>
            <td>{m.popular ? <span className="badge badge-warning">شائع</span> : '—'}</td>
            <td>
             <button
              type="button"
              className={`badge ${m.available ? 'badge-success' : 'badge-danger'}`}
              onClick={() => patch({ menu: project.menu.map((x) => (x.id === m.id ? { ...x, available: !x.available } : x)) })}
              title="اضغط لتغيير التوفر"
             >
              {m.available ? 'متاح' : 'غير متاح'}
             </button>
            </td>
            <td>
             <div className="flex gap-1">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditing(m); setForm(m); setOpen(true); }}>تعديل</button>
              <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => patch({ menu: project.menu.filter((x) => x.id !== m.id) })}>حذف</button>
             </div>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      ) : (
       <div className="table-wrap">
        <EmptyState title={q ? 'لا توجد أصناف مطابقة' : 'لا توجد أصناف في المنيو بعد'} description="أضف صنفًا ليظهر على المنيو الرقمي." />
       </div>
      )}

      {open && (
       <Modal
        title={editing ? 'تعديل صنف' : 'صنف جديد'}
        onClose={() => setOpen(false)}
        footer={
         <>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ الصنف</button>
         </>
        }
       >
        <Field label="اسم الصنف">
         <input id="mod-meal-name" className="form-control" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </Field>
        <Field label="الفئة">
         <select id="mod-meal-cat" className="form-control" value={form.category ?? ''} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
          <option value="">— اختر —</option>
          {project.categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
         </select>
        </Field>
        <div className="grid-2">
         <Field label="السعر">
          <input id="mod-meal-price" type="number" className="form-control" value={form.price ?? 0} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
         </Field>
         <div className="form-group">
          <span className="form-label">خيارات</span>
          <div className="flex flex-col gap-2">
           <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} />
            متاح حاليًا
           </label>
           <label className="flex items-center gap-2 text-sm">
            <input id="mod-meal-addons" type="checkbox" checked={!!form.popular} onChange={(e) => setForm((f) => ({ ...f, popular: e.target.checked }))} />
            مميّز كأكثر صنف شائع
           </label>
          </div>
         </div>
        </div>
       </Modal>
      )}
     </>
    );
   }}
  </DashboardModule>
 );
}
