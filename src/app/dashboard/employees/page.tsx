'use client';

import { useState } from 'react';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { EmptyState, Field, Modal, StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { IconPlus } from '@/components/nasaq/icons';
import type { Employee } from '@/lib/nasaq/seed';

const BLANK = { name: '', role: 'موظف', status: 'نشط', allowedModules: 'الطلبات والعملاء' };
const ROLES = ['مالك', 'مدير', 'موظف', 'مشرف مبيعات', 'مدير موقع', 'موظف دعم'];

export default function EmployeesPage() {
 const [q, setQ] = useState('');
 const [open, setOpen] = useState(false);
 const [editing, setEditing] = useState<Employee | null>(null);
 const [form, setForm] = useState<Partial<Employee>>(BLANK);

 return (
  <DashboardModule
   title="الموظفين والفريق"
   subtitle="إدارة أعضاء الفريق وأدوارهم والوحدات المسموح لهم بالوصول إليها."
   actions={ctx => (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm(BLANK); setOpen(true); }}>
     <IconPlus size={16} /> موظف جديد
    </button>
   )}
  >
   {({ project, patch }) => {
    const filtered = project.employees.filter((e) => !q || e.name.includes(q) || (e.role ?? '').includes(q));

    function save() {
     const name = form.name?.trim();
     if (!name) return;
     if (editing) {
      patch({ employees: project.employees.map((e) => (e.id === editing.id ? ({ ...e, ...form, name } as Employee) : e)) });
     } else {
      patch({ employees: [...project.employees, { id: `emp_${Date.now().toString(36)}`, name, role: form.role || 'موظف', status: form.status || 'نشط', allowedModules: form.allowedModules || 'الكل' }] });
     }
     setOpen(false);
    }

    return (
     <>
      <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث عن موظف..." />

      {filtered.length > 0 ? (
       <div className="table-wrap">
        <table className="data-table">
         <thead>
          <tr>
           <th>الموظف</th>
           <th>الدور الرئيسي</th>
           <th>الوحدات المسموحة / القسم</th>
           <th>الحالة</th>
           <th>إجراءات</th>
          </tr>
         </thead>
         <tbody>
          {filtered.map((e) => (
           <tr key={e.id}>
            <td className="font-bold text-text-primary">{e.name}</td>
            <td><span className="badge badge-primary">{e.role}</span></td>
            <td className="text-muted">{e.allowedModules}</td>
            <td><StatusBadge status={e.status} /></td>
            <td>
             <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditing(e); setForm(e); setOpen(true); }}>تعديل</button>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      ) : (
       <div className="table-wrap">
        <EmptyState title={q ? 'لا توجد نتائج مطابقة' : 'لا يوجد موظفون بعد'} description="أضف أعضاء فريقك لتوزيع المهام والصلاحيات ال." />
       </div>
      )}

      {open && (
       <Modal
        title={editing ? 'تعديل موظف' : 'موظف جديد'}
        onClose={() => setOpen(false)}
        footer={
         <>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>إلغاء</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>حفظ</button>
         </>
        }
       >
        <Field label="اسم الموظف">
         <input id="mod-emp-name" className="form-control" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </Field>
        <div className="grid-2">
         <Field label="الدور الرئيسي">
          <select id="mod-emp-role" className="form-control" value={form.role ?? ''} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
           {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
         </Field>
         <Field label="القسم / الوحدات المسموحة">
          <input id="mod-emp-mods" className="form-control" value={form.allowedModules ?? ''} onChange={(e) => setForm((f) => ({ ...f, allowedModules: e.target.value }))} placeholder="الطلبات والعملاء" />
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
