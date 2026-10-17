'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, KpiCard, Modal, TableToolbar } from '@/components/nasaq/ui';
import { IconBox, IconPlus } from '@/components/nasaq/icons';

export default function InventoryPage() {
 const [q, setQ] = useState('');
 const [editing, setEditing] = useState<{ id: string; name: string; stock: number; minStock: number } | null>(null);
 const [stock, setStock] = useState(0);
 const [open, setOpen] = useState(false);

 return (
  <DashboardModule title="المخزون" subtitle="مراقبة الكميات والحد الأدنى وتنبيهات النفاد.">
   {({ project, patch }) => {
    const items = project.products.map((p) => ({ ...p }));
    const filtered = items.filter((p) => !q || p.name.includes(q));

    const total = items.length;
    const low = items.filter((p) => p.stock > 0 && p.stock <= (p.minStock || 5)).length;
    const out = items.filter((p) => p.stock === 0).length;

    function stockTone(p: { stock: number; minStock: number }) {
     if (p.stock === 0) return { cls: 'badge-danger', label: 'نفذ' };
     if (p.stock <= (p.minStock || 5)) return { cls: 'badge-warning', label: 'منخفض' };
     return { cls: 'badge-success', label: 'طبيعي' };
    }

    return (
     <>
      <div className="grid-3 sm:grid-cols-3">
       <KpiCard label="إجمالي الأصناف" value={total} icon={<IconBox size={18} />} tone="purple" />
       <KpiCard label="أصناف منخفضة" value={low} icon={<IconBox size={18} />} tone="amber" />
       <KpiCard label="أصناف نفذت" value={out} icon={<IconBox size={18} />} tone="teal" />
      </div>

      {total > 0 ? (
       <>
        <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث عن صنف..." />

        <div className="table-wrap">
         <table className="data-table">
          <thead>
           <tr>
            <th>المنتج</th>
            <th>الفئة</th>
            <th>المخزون الحالي</th>
            <th>الحد الأدنى</th>
            <th>الحالة</th>
            <th>إجراءات</th>
           </tr>
          </thead>
          <tbody>
           {filtered.map((p) => {
            const tone = stockTone(p);
            return (
             <tr key={p.id}>
              <td className="font-bold text-text-primary">{p.name}</td>
              <td><span className="badge badge-muted">{p.category}</span></td>
              <td className="font-bold">{p.stock}</td>
              <td className="text-muted">{p.minStock || 5}</td>
              <td><span className={`badge ${tone.cls}`}>{tone.label}</span></td>
              <td>
               <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => { setEditing(p); setStock(p.stock); setOpen(true); }}
               >
                تعديل الكمية
               </button>
              </td>
             </tr>
            );
           })}
          </tbody>
         </table>
        </div>
       </>
      ) : (
       <div className="table-wrap">
        <EmptyState
         title="لا توجد أصناف في المخزون بعد"
         description="أضف منتجات في وحدة المنتجات ليظهر المخزون هنا."
         action={<Link href="/dashboard/products" className="btn btn-primary btn-sm"><IconPlus size={16} /> إضافة منتج</Link>}
        />
       </div>
      )}

      {open && editing && (
       <Modal
        title={`تعديل كمية: ${editing.name}`}
        onClose={() => setOpen(false)}
        footer={
         <>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
          <button
           type="button"
           className="btn btn-primary btn-sm"
           onClick={() => {
            patch({ products: project.products.map((p) => (p.id === editing.id ? { ...p, stock } : p)) });
            setOpen(false);
           }}
          >
           حفظ الكمية
          </button>
         </>
        }
       >
        <label className="form-group">
         <span className="form-label">الكمية المتوفرة</span>
         <input type="number" className="form-control" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
        </label>
        <p className="text-xs text-muted">الحد الأدنى الحالي: {editing.minStock || 5} قطعة</p>
       </Modal>
      )}
     </>
    );
   }}
  </DashboardModule>
 );
}
