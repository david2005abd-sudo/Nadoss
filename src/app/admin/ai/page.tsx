'use client';

import { useState } from 'react';
import { useNasaq } from '@/lib/nasaq/store';
import { AdminHeader } from '@/components/nasaq/admin-shell';
import { Field, Modal, StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';
import type { AiProvider } from '@/lib/nasaq/seed';

export default function AdminAiPage() {
  const { state, patchPlatform } = useNasaq();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AiProvider | null>(null);
  const [form, setForm] = useState<Partial<AiProvider>>({});

  const filtered = state.aiProviders.filter(
    (p) => !q || p.name.includes(q) || p.model.includes(q) || p.desc.includes(q)
  );

  function toggleStatus(p: AiProvider) {
    patchPlatform({
      aiProviders: state.aiProviders.map((x) =>
        x.id === p.id ? { ...x, status: x.status === 'نشط' ? 'غير مهيأ' : 'نشط' } : x
      ),
    });
  }

  function setDefault(id: string) {
    patchPlatform({
      aiProviders: state.aiProviders.map((x) => ({ ...x, isDefault: x.id === id })),
    });
  }

  return (
    <>
      <AdminHeader
        title="مزودو الذكاء الاصطناعي"
        subtitle="قائمة المزودين التجريبية (نموذج، الحالة، المزايا، الحد الأقصى) وإدارة المزود الافتراضي."
        actions={
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditing(null);
              setForm({ name: '', model: '', modelId: '', baseUrl: '', status: 'غير مهيأ', limit: '100 طلب تجريبي / شهر', features: [], connStatus: 'غير مُختبر', isDefault: false, desc: '' });
              setOpen(true);
            }}
          >
            <IconPlus size={16} /> مزود جديد
          </button>
        }
      />

      <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث باسم المزود أو الموديل..." />

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>المزود</th>
              <th>الموديل</th>
              <th>المزايا</th>
              <th>الحد الأقصى</th>
              <th>حالة الاتصال</th>
              <th>الحالة</th>
              <th>افتراضي</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div>
                    <span className="font-bold text-text-primary">{p.name}</span>
                    <p className="text-xs text-muted">{p.desc}</p>
                    <span className="text-[11px] text-muted" dir="ltr">{p.baseUrl}</span>
                  </div>
                </td>
                <td>
                  <span className="badge badge-primary">{p.model}</span>
                  <p className="mt-1 text-[11px] text-muted" dir="ltr">{p.modelId}</p>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {p.features.map((f) => <span key={f} className="badge badge-muted">{f}</span>)}
                  </div>
                </td>
                <td className="text-muted">{p.limit}</td>
                <td><StatusBadge status={p.connStatus} /></td>
                <td><StatusBadge status={p.status} /></td>
                <td>{p.isDefault ? <span className="badge badge-success">افتراضي</span> : <span className="text-muted">—</span>}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => toggleStatus(p)}>
                      {p.status === 'نشط' ? 'تعطيل' : 'تهيئة'}
                    </button>
                    {!p.isDefault && p.status === 'نشط' && (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => setDefault(p.id)}>تعيين كافتراضي</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal
          title="مزود ذكاء اصطناعي"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const name = (form.name ?? '').trim();
                  if (!name) return;
                  if (editing) {
                    patchPlatform({ aiProviders: state.aiProviders.map((x) => (x.id === editing.id ? ({ ...x, ...form, name } as AiProvider) : x)) });
                  } else {
                    patchPlatform({
                      aiProviders: [
                        ...state.aiProviders,
                        {
                          id: `prov_${Date.now().toString(36)}`,
                          name,
                          status: (form.status as AiProvider['status']) ?? 'غير مهيأ',
                          model: form.model ?? '—',
                          modelId: form.modelId ?? '—',
                          baseUrl: form.baseUrl ?? 'https://api.example.com/v1',
                          features: form.features ?? [],
                          connStatus: form.connStatus ?? 'غير مُختبر',
                          limit: form.limit ?? '100 طلب تجريبي / شهر',
                          isDefault: false,
                          desc: form.desc ?? '',
                        } as AiProvider,
                      ],
                    });
                  }
                  setOpen(false);
                }}
              >
                حفظ
              </button>
            </>
          }
        >
          <Field label="اسم المزود">
            <input id="mod-pv-model" className="form-control" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="OpenAI" />
          </Field>
          <div className="grid-2">
            <Field label="الموديل">
              <input id="mod-pv-modelid" className="form-control" dir="ltr" value={form.model ?? ''} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} placeholder="gpt-4o-mini" />
            </Field>
            <Field label="معرّف الموديل">
              <input className="form-control" dir="ltr" value={form.modelId ?? ''} onChange={(e) => setForm((f) => ({ ...f, modelId: e.target.value }))} />
            </Field>
          </div>
          <Field label="رابط الأساس (Base URL)">
            <input id="mod-pv-url" className="form-control" dir="ltr" value={form.baseUrl ?? ''} onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))} placeholder="https://api.openai.com/v1" />
          </Field>
          <Field label="المزايا (مفصولة بفاصلة)">
            <input
              className="form-control"
              value={(form.features ?? []).join(', ')}
              onChange={(e) => setForm((f) => ({ ...f, features: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) }))}
              placeholder="توليد نصوص, تلخيص, تحليل"
            />
          </Field>
          <div className="grid-2">
            <Field label="الحد الأقصى التجريبي">
              <input className="form-control" value={form.limit ?? ''} onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value }))} />
            </Field>
            <Field label="الحالة">
              <select
                id="mod-pv-key"
                className="form-control"
                value={form.status ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AiProvider['status'] }))}
              >
                {['نشط', 'غير مهيأ'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <p className="text-xs text-muted">
            تنبيه أمني: في بيئة الإنتاج تُخزّن مفاتيح مزودي الذكاء الاصطناعي مُشفّرة على الخادم ولا تُحفظ في المتصفح أبدًا.
          </p>
        </Modal>
      )}
    </>
  );
}
