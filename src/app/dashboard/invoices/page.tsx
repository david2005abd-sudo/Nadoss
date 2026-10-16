'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';
import { formatIQD } from '@/lib/utils';
import type { Invoice } from '@/lib/nasaq/seed';

const BLANK = { client: '', amount: 0, date: '2026-10-16', status: 'بانتظار السداد' };
const STATUSES = ['بانتظار السداد', 'مدفوعة تجريبية', 'متأخرة'];

export default function InvoicesPage() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState<Partial<Invoice>>(BLANK);

  return (
    <DashboardModule
      title="الفواتير"
      subtitle="إصدار فواتير تجريبية ومتابعة حالات السداد."
      actions={() => (
        <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm(BLANK); setOpen(true); }}>
          <IconPlus size={16} /> فاتورة جديدة
        </button>
      )}
    >
      {({ project, patch }) => {
        const filtered = project.invoices.filter((x) => !q || (x.client ?? '').includes(q) || (x.id ?? '').includes(q));
        const total = project.invoices.reduce((s, x) => s + (x.amount ?? 0), 0);
        const paid = project.invoices.filter((x) => x.status === 'مدفوعة تجريبية').reduce((s, x) => s + (x.amount ?? 0), 0);

        function save() {
          const client = form.client?.trim();
          if (!client) return;
          if (editing) {
            patch({ invoices: project.invoices.map((x) => (x.id === editing.id ? ({ ...x, ...form, client } as Invoice) : x)) });
          } else {
            patch({ invoices: [...project.invoices, { id: `INV-${Math.floor(900 + Math.random() * 100)}`, client, amount: Number(form.amount ?? 0), date: form.date ?? '2026-10-16', status: form.status ?? 'بانتظار السداد' }] });
          }
          setOpen(false);
        }

        return (
          <>
            <div className="grid-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card"><span className="text-xs text-muted">عدد الفواتير</span><p className="kpi-value">{project.invoices.length}</p></div>
              <div className="card"><span className="text-xs text-muted">إجمالي المبالغ</span><p className="kpi-value">{formatIQD(total)}</p></div>
              <div className="card"><span className="text-xs text-muted">المحصّل تجريبيًا</span><p className="kpi-value">{formatIQD(paid)}</p></div>
              <div className="card"><span className="text-xs text-muted">متأخرة</span><p className="kpi-value">{project.invoices.filter((x) => x.status === 'متأخرة').length}</p></div>
            </div>

            <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث برقم الفاتورة أو العميل..." />

            {filtered.length > 0 ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>رقم الفاتورة</th>
                      <th>العميل</th>
                      <th>التاريخ</th>
                      <th>المبلغ</th>
                      <th>حالة السداد</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((x) => (
                      <tr key={x.id}>
                        <td className="font-bold text-text-primary">{x.id}</td>
                        <td>{x.client}</td>
                        <td className="text-muted">{x.date}</td>
                        <td className="font-bold">{formatIQD(x.amount)}</td>
                        <td><StatusBadge status={x.status} /></td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditing(x); setForm(x); setOpen(true); }}>تعديل</button>
                            {x.status !== 'مدفوعة تجريبية' && (
                              <button type="button" className="btn btn-primary btn-sm" onClick={() => patch({ invoices: project.invoices.map((y) => (y.id === x.id ? { ...y, status: 'مدفوعة تجريبية' } : y)) })}>تسجيل السداد</button>
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
                <EmptyState title={q ? 'لا توجد فواتير مطابقة' : 'لا توجد فواتير بعد'} description="أصدر فاتورتك الأولى لتتبع المطالبات المالية." />
              </div>
            )}

            {open && (
              <Modal
                title={editing ? 'تعديل فاتورة' : 'فاتورة جديدة'}
                onClose={() => setOpen(false)}
                footer={
                  <>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ الفاتورة</button>
                  </>
                }
              >
                <Field label="العميل">
                  <input id="mod-inv-client" className="form-control" value={form.client ?? ''} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} />
                </Field>
                <div className="grid-2">
                  <Field label="المبلغ">
                    <input id="mod-inv-amount" type="number" className="form-control" value={form.amount ?? 0} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} />
                  </Field>
                  <Field label="التاريخ">
                    <input id="mod-inv-date" type="date" className="form-control" value={form.date ?? ''} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                  </Field>
                </div>
                <Field label="حالة السداد">
                  <select id="mod-inv-status" className="form-control" value={form.status ?? ''} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </Modal>
            )}
          </>
        );
      }}
    </DashboardModule>
  );
}
