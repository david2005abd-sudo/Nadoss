'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';
import { formatIQD } from '@/lib/utils';
import type { SparePart } from '@/lib/nasaq/seed';

const BLANK = { name: '', partNo: '', manufacturer: '', compatibility: '', price: 0, stock: 0 };

export default function SparePartsPage() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SparePart | null>(null);
  const [form, setForm] = useState<Partial<SparePart>>(BLANK);

  return (
    <DashboardModule
      title="قطع الغيار"
  subtitle="إدارة القطع وأرقامها المصنعية (OEM) وتوافق المركبات."
      actions={() => (
        <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm(BLANK); setOpen(true); }}>
          <IconPlus size={16} /> قطعة جديدة
        </button>
      )}
    >
      {({ project, patch }) => {
        const filtered = project.spareParts.filter(
          (p) => !q || p.name.includes(q) || (p.partNo ?? '').includes(q) || (p.compatibility ?? '').includes(q)
        );
        const low = project.spareParts.filter((p) => p.stock <= 5).length;

        function save() {
          const name = form.name?.trim();
          if (!name) return;
          if (editing) {
            patch({ spareParts: project.spareParts.map((p) => (p.id === editing.id ? ({ ...p, ...form, name } as SparePart) : p)) });
          } else {
            patch({
              spareParts: [...project.spareParts, {
                id: `sp_${Date.now().toString(36)}`,
                name,
                partNo: form.partNo ?? '—',
                manufacturer: form.manufacturer ?? '—',
                compatibility: form.compatibility ?? '—',
                price: Number(form.price ?? 0),
                stock: Number(form.stock ?? 0),
              }],
            });
          }
          setOpen(false);
        }

        return (
          <>
            <div className="grid-3 sm:grid-cols-3">
              <div className="card"><span className="text-xs text-muted">عدد القطع</span><p className="kpi-value">{project.spareParts.length}</p></div>
              <div className="card"><span className="text-xs text-muted">قطع منخفضة</span><p className="kpi-value">{low}</p></div>
              <div className="card"><span className="text-xs text-muted">مركبات مرتبطة</span><p className="kpi-value">{project.vehicles.length}</p></div>
            </div>

            <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث بالقطعة أو الرقم المصنعي..." />

            {filtered.length > 0 ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>القطعة</th>
                      <th>رقم القطعة</th>
                      <th>المصنع</th>
                      <th>التوافق</th>
                      <th>السعر</th>
                      <th>المخزون</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id}>
                        <td className="font-bold text-text-primary">{p.name}</td>
                        <td dir="ltr" className="font-mono text-xs">{p.partNo}</td>
                        <td>{p.manufacturer}</td>
                        <td className="text-muted">{p.compatibility}</td>
                        <td className="font-bold">{formatIQD(p.price)}</td>
                        <td>
                          <span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock <= 5 ? 'badge-warning' : 'badge-success'}`}>
                            {p.stock} قطعة
                          </span>
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
              <div className="table-wrap">
                <EmptyState title={q ? 'لا توجد قطع مطابقة' : 'لا توجد قطع غيار بعد'} description="أضف قطع الغيار لمتابعة المخزون والتوافق." />
              </div>
            )}

            {open && (
              <Modal
                title={editing ? 'تعديل قطعة' : 'قطعة جديدة'}
                onClose={() => setOpen(false)}
                footer={
                  <>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ القطعة</button>
                  </>
                }
              >
                <Field label="اسم القطعة">
                  <input id="mod-sp-name" className="form-control" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </Field>
                <div className="grid-2">
                  <Field label="رقم القطعة (OEM)">
                    <input id="mod-sp-num" className="form-control" dir="ltr" value={form.partNo ?? ''} onChange={(e) => setForm((f) => ({ ...f, partNo: e.target.value }))} />
                  </Field>
                  <Field label="المصنع">
                    <input id="mod-sp-mfg" className="form-control" value={form.manufacturer ?? ''} onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))} />
                  </Field>
                </div>
                <Field label="التوافق">
                  <input id="mod-sp-comp" className="form-control" value={form.compatibility ?? ''} onChange={(e) => setForm((f) => ({ ...f, compatibility: e.target.value }))} placeholder="تويوتا كامري 2019-2025" />
                </Field>
                <div className="grid-2">
                  <Field label="السعر">
                    <input id="mod-sp-price" type="number" className="form-control" value={form.price ?? 0} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
                  </Field>
                  <Field label="المخزون">
                    <input id="mod-sp-stock" type="number" className="form-control" value={form.stock ?? 0} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))} />
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
