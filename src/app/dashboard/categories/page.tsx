'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';
import type { Category } from '@/lib/nasaq/seed';

const BLANK = { name: '', description: '' };

export default function CategoriesPage() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Partial<Category>>(BLANK);

  return (
    <DashboardModule
      title="الفئات"
      subtitle="نظّم منتجاتك ووجباتك وعقاراتك في تصنيفات واضحة للعملاء."
      actions={() => (
        <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm(BLANK); setOpen(true); }}>
          <IconPlus size={16} /> فئة جديدة
        </button>
      )}
    >
      {({ project, patch }) => {
        const filtered = project.categories.filter((c) => !q || c.name.includes(q) || (c.description ?? '').includes(q));

        function save() {
          const name = form.name?.trim();
          if (!name) return;
          if (editing) {
            patch({ categories: project.categories.map((c) => (c.id === editing.id ? ({ ...c, ...form, name } as Category) : c)) });
          } else {
            patch({ categories: [...project.categories, { id: `cat_${Date.now().toString(36)}`, name, description: form.description ?? '' }] });
          }
          setOpen(false);
        }

        function remove(id: string) {
          patch({ categories: project.categories.filter((c) => c.id !== id) });
        }

        return (
          <>
            <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث عن فئة..." />

            {filtered.length > 0 ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>الفئة</th>
                      <th>الوصف</th>
                      <th>عدد العناصر</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id}>
                        <td className="font-bold text-text-primary">{c.name}</td>
                        <td className="text-muted">{c.description || '—'}</td>
                        <td>
                          <span className="badge badge-muted">
                            {project.products.filter((p) => p.category === c.name).length} منتج
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditing(c); setForm(c); setOpen(true); }}>تعديل</button>
                            <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => remove(c.id)}>حذف</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-wrap">
                <EmptyState title={q ? 'لا توجد فئات مطابقة' : 'لا توجد تصنيفات بعد'} description="أضف فئة لتنظيم المنتجات أو الوجبات." />
              </div>
            )}

            {open && (
              <Modal
                title={editing ? 'تعديل فئة' : 'فئة جديدة'}
                onClose={() => setOpen(false)}
                footer={
                  <>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ الفئة</button>
                  </>
                }
              >
                <Field label="اسم الفئة">
                  <input id="modal-cat-name" className="form-control" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="مثال: العطور" />
                </Field>
                <Field label="الوصف">
                  <textarea id="modal-cat-desc" className="form-control" rows={3} value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="وصف قصير يظهر للعملاء..." />
                </Field>
              </Modal>
            )}
          </>
        );
      }}
    </DashboardModule>
  );
}
