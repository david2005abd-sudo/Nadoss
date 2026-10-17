'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, StatusBadge, TableToolbar, ToastContainer } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';
import { formatIQD } from '@/lib/utils';
import type { Product } from '@/lib/nasaq/seed';

const FILTERS = [
 { v: '', l: 'الكل' },
 { v: 'active', l: 'نشط' },
 { v: 'low', l: 'منخفض المخزون' },
] as const;

const BLANK: Partial<Product> = { name: '', category: '', price: 0, stock: 0 };

export default function ProductsPage() {
 const [q, setQ] = useState('');
 const [filter, setFilter] = useState('');
 const [editing, setEditing] = useState<Product | null>(null);
 const [form, setForm] = useState<Partial<Product>>(BLANK);
 const [open, setOpen] = useState(false);

 function startNew(project: { categories: { name: string }[] }) {
  setEditing(null);
  setForm({ ...BLANK, category: project.categories[0]?.name ?? 'غير مصنف' });
  setOpen(true);
 }

 function startEdit(p: Product) {
  setEditing(p);
  setForm(p);
  setOpen(true);
 }

 return (
  <DashboardModule
   title="المنتجات"
   subtitle="إدارة المنتجات والأسعار والمخزون وحالة العرض."
   actions={({ project }) => (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => startNew(project)}>
     <IconPlus size={16} /> منتج جديد
    </button>
   )}
  >
   {({ project, patch }) => {
    const filtered = project.products.filter((p) => {
     const matchQ = !q || (p.name ?? '').includes(q);
     const matchStatus =
      !filter ? true : filter === 'active' ? p.status === 'نشط' : p.stock <= (p.minStock || 5);
     return matchQ && matchStatus;
    });

    const categories = Array.from(new Set(project.products.map((p) => p.category)));

    function save() {
     const name = (form.name ?? '').trim();
     if (!name) return;
     if (editing) {
      patch({
       products: project.products.map((p) => (p.id === editing.id ? ({ ...p, ...form, name } as Product) : p)),
      });
     } else {
      const item: Product = {
       id: `p_${Date.now().toString(36)}`,
       name,
       category: form.category ?? project.categories[0]?.name ?? 'غير مصنف',
       price: Number(form.price ?? 0),
       stock: Number(form.stock ?? 0),
       minStock: 5,
       sales: 0,
       status: 'نشط',
      };
      patch({ products: [item, ...project.products] });
     }
     setOpen(false);
    }

    function remove(id: string) {
     patch({ products: project.products.filter((p) => p.id !== id) });
    }

    return (
     <>
      {categories.length > 0 && (
       <div className="flex flex-wrap gap-1">
        {categories.map((c) => (
         <span key={c} className="badge badge-muted">{c}</span>
        ))}
       </div>
      )}

      <TableToolbar
       search={q}
       onSearchChange={setQ}
       searchPlaceholder="ابحث عن منتج..."
       filters={FILTERS as unknown as { v: string; l: string }[]}
       activeFilter={filter}
       onFilterChange={setFilter}
      />

      {filtered.length > 0 ? (
       <div className="table-wrap nq-reveal">
        <table className="data-table">
         <thead>
          <tr>
           <th>المنتج</th>
           <th>الفئة</th>
           <th>السعر</th>
           <th>المخزون</th>
           <th>المبيعات</th>
           <th>الحالة</th>
           <th>إجراءات</th>
          </tr>
         </thead>
         <tbody>
          {filtered.map((p) => (
           <tr key={p.id}>
            <td>
             <p className="font-bold text-text-primary">{p.name}</p>
             {p.featured && <span className="badge badge-warning mt-1">مميز</span>}
            </td>
            <td><span className="badge badge-muted">{p.category}</span></td>
            <td className="font-bold">{formatIQD(p.price)}</td>
            <td>
             <span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock <= (p.minStock || 5) ? 'badge-warning' : 'badge-success'}`}>
              {p.stock} قطعة
             </span>
            </td>
            <td>{p.sales}</td>
            <td><StatusBadge status={p.status} /></td>
            <td>
             <div className="flex flex-wrap gap-1">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => startEdit(p)}>تعديل</button>
              <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => remove(p.id)}>حذف</button>
             </div>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      ) : (
       <div className="table-wrap nq-reveal">
        <EmptyState
         title={q || filter ? 'لا توجد منتجات مطابقة' : 'لم تضف أي منتجات بعد'}
         description="أضف منتجك الأول لبدء البيع في لوحة المشروع."
        />
       </div>
      )}

      {open && (
       <Modal
        title={editing ? 'تعديل منتج' : 'منتج جديد'}
        onClose={() => setOpen(false)}
        footer={
         <>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ المنتج</button>
         </>
        }
       >
        <Field label="اسم المنتج">
         <input id="modal-prod-name" className="form-control" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="مثال: عطر شرقي فاخر" />
        </Field>
        <Field label="الفئة">
         <select id="modal-prod-cat" className="form-control" value={form.category ?? ''} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
          <option value="">غير مصنف</option>
          {project.categories.map((c) => (
           <option key={c.id} value={c.name}>{c.name}</option>
          ))}
         </select>
        </Field>
        <div className="grid-2 nq-reveal nq-stagger">
         <Field label="السعر (رقم)">
          <input id="modal-prod-price" type="number" className="form-control" value={form.price ?? 0} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
         </Field>
         <Field label="المخزون">
          <input id="modal-prod-stock" type="number" className="form-control" value={form.stock ?? 0} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))} />
         </Field>
        </div>
        <p className="text-xs text-muted">
         ملاحظة: الأسعار هنا للتجربة فقط، وليست مرتبطة بأي بوابة دفع في النموذج الأولي.
        </p>
       </Modal>
      )}
     </>
    );
   }}
  </DashboardModule>
 );
}
