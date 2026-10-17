'use client';

import { AdminHeader } from '@/components/nasaq/admin-shell';
import { getIcon } from '@/components/nasaq/icons';
import { BUSINESS_DEFAULT_MODULES, MODULE_REGISTRY, supportsBusinessType } from '@/lib/nasaq/modules';
import { BUSINESS_TYPES } from '@/lib/nasaq/config';
import { StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { useState } from 'react';

export default function AdminModulesPage() {
 const [q, setQ] = useState('');
 const [typeFilter, setTypeFilter] = useState('');

 const btOptions = BUSINESS_TYPES.map((b: { id: string; name: string }) => ({ id: b.id, name: b.name }));
 const filtered = Object.values(MODULE_REGISTRY).filter(
  (m) =>
   !q ||
   m.name.includes(q) ||
   m.description.includes(q) ||
   m.supportedBusinessTypes.join(' ').includes(q)
 );

 const filters = [{ v: '', l: 'كل الأنشطة' }, ...btOptions.map((b) => ({ v: b.id, l: b.name }))];

 return (
  <>
   <AdminHeader
    title="محرك الوحدات"
    subtitle="جدول تفاعلي لكل وحدات المنصة مع الأنشطة المدعومة والاعتماديات والباقات المطلوبة."
   />

   <div className="grid-3 sm:grid-cols-2 lg:grid-cols-4">
    <div className="card"><span className="text-xs text-muted">إجمالي الوحدات</span><p className="kpi-value">{Object.keys(MODULE_REGISTRY).length}</p></div>
    <div className="card"><span className="text-xs text-muted">أنواع الأنشطة المدعومة</span><p className="kpi-value">{BUSINESS_TYPES.length}</p></div>
    <div className="card"><span className="text-xs text-muted">وحدات متعددة الأنشطة</span><p className="kpi-value">{Object.values(MODULE_REGISTRY).filter((m) => m.supportedBusinessTypes.includes('all')).length}</p></div>
    <div className="card"><span className="text-xs text-muted">وحدات معتمدة على غيرها</span><p className="kpi-value">{Object.values(MODULE_REGISTRY).filter((m) => m.dependencies.length > 0).length}</p></div>
   </div>

   <TableToolbar
    search={q}
    onSearchChange={setQ}
    searchPlaceholder="ابحث باسم الوحدة أو وصفها..."
    filters={filters}
    activeFilter={typeFilter}
    onFilterChange={setTypeFilter}
   />

   <div className="table-wrap">
    <table className="data-table">
     <thead>
      <tr>
       <th>الوحدة</th>
       <th>الوصف</th>
       <th>الأنشطة المدعومة</th>
       <th>الاعتماديات</th>
       <th>الباقات المتاحة</th>
       <th>الصلاحيات</th>
       <th>الحالة</th>
      </tr>
     </thead>
     <tbody>
      {filtered
       .filter((m) => !typeFilter || supportsBusinessType(m, typeFilter))
       .map((m) => (
        <tr key={m.id}>
         <td>
          <div className="flex items-center gap-2">
           <span className="icon-box" style={{ width: 32, height: 32 }}>{getIcon(m.icon, { size: 16 })}</span>
           <span className="font-bold text-text-primary">{m.name}</span>
          </div>
         </td>
         <td className="max-w-[260px] text-muted">{m.description}</td>
         <td>
          <div className="flex flex-wrap gap-1">
           {m.supportedBusinessTypes.map((t) => (
            <span key={t} className="badge badge-muted">{t === 'all' ? 'الكل' : (BUSINESS_TYPES.find((b: { id: string; name: string }) => b.id === t)?.name ?? t)}</span>
           ))}
          </div>
         </td>
         <td>
          {m.dependencies.length > 0 ? (
           <div className="flex flex-wrap gap-1">
            {m.dependencies.map((d) => (
             <span key={d} className="badge badge-secondary">{MODULE_REGISTRY[d]?.name ?? d}</span>
            ))}
           </div>
          ) : (
           <span className="text-muted">—</span>
          )}
         </td>
         <td>
          <div className="flex flex-wrap gap-1">
           {m.availableInPlans.map((p) => <span key={p} className="badge badge-primary">{p}</span>)}
          </div>
         </td>
         <td>
          <div className="flex flex-wrap gap-1">
           {m.permissions.map((p) => <span key={p} className="badge badge-muted">{p}</span>)}
          </div>
         </td>
         <td><StatusBadge status={m.status} /></td>
        </tr>
       ))}
     </tbody>
    </table>
   </div>

   <div className="card" style={{ background: 'var(--muted-surface)' }}>
    <span className="text-xs text-muted">قوالب الوحدات الافتراضية حسب النشاط</span>
    <div className="mt-3 grid-3 sm:grid-cols-2 lg:grid-cols-4">
     {BUSINESS_TYPES.map((b: { id: string; name: string; shortDesc: string }) => {
      const mods = BUSINESS_DEFAULT_MODULES[b.id] ?? [];
      return (
       <div key={b.id} className="card !p-3">
        <span className="badge badge-primary">{b.name}</span>
        <p className="mt-2 text-xs text-muted">{mods.length} وحدة مفعّلة افتراضيًا</p>
        <div className="mt-2 flex flex-wrap gap-1">
         {mods.map((m) => (
          <span key={`${b.id}-${m}`} className="badge badge-muted">{MODULE_REGISTRY[m]?.name ?? m}</span>
         ))}
        </div>
       </div>
      );
     })}
    </div>
   </div>
  </>
 );
}
