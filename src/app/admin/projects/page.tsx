'use client';

import Link from 'next/link';
import { useNasaq } from '@/lib/nasaq/store';
import { AdminHeader } from '@/components/nasaq/admin-shell';
import { BUSINESS_TYPES } from '@/lib/nasaq/config';
import { StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { useState } from 'react';

export default function AdminProjectsPage() {
 const { state, setActiveProject } = useNasaq();
 const [q, setQ] = useState('');

 const projects = state.projects.filter(
  (p) => !q || p.name.includes(q) || (p.ownerName ?? '').includes(q) || (p.city ?? '').includes(q)
 );

 return (
  <>
   <AdminHeader title="المشاريع المنشأة" subtitle="كل المشاريع التي أنشأها المشتركون الون مع نوع النشاط وحالة الموقع." />

   <TableToolbar search={q} onSearchChange={setQ} searchPlaceholder="ابحث باسم المشروع أو المالك..." />

   <div className="table-wrap nq-reveal">
    <table className="data-table">
     <thead>
      <tr>
       <th>المشروع</th>
       <th>نوع النشاط</th>
       <th>المالك</th>
       <th>المدينة</th>
       <th>النطاق</th>
       <th>الوحدات المفعّلة</th>
       <th>حالة الموقع</th>
       <th>تاريخ الإنشاء</th>
      </tr>
     </thead>
     <tbody>
      {projects.map((p) => (
       <tr key={p.id}>
        <td className="font-bold text-text-primary">{p.name}</td>
        <td>
         <span className="badge badge-primary">
          {BUSINESS_TYPES.find((b) => b.id === p.businessType)?.name ?? p.businessType}
         </span>
        </td>
        <td>{p.ownerName}</td>
        <td>{p.city}</td>
        <td dir="ltr" className="text-muted">{p.domain}</td>
        <td><span className="badge badge-muted">{p.enabledModules.length}</span></td>
        <td><StatusBadge status={p.siteStatus} /></td>
        <td className="text-muted">{p.createdAt}</td>
       </tr>
      ))}
     </tbody>
    </table>
   </div>

   <div className="grid-3 sm:grid-cols-2 lg:grid-cols-4">
    {state.projects.map((p) => (
     <div key={p.id} className="card">
      <span className="badge badge-muted">{BUSINESS_TYPES.find((b) => b.id === p.businessType)?.name ?? p.businessType}</span>
      <h3 className="mt-2 text-sm font-bold">{p.name}</h3>
      <p className="mt-1 text-xs text-muted">{p.description}</p>
      <Link href="/dashboard" className="btn btn-outline btn-sm mt-3" onClick={() => setActiveProject(p.id)}>
       فتح لوحة هذا المشروع
      </Link>
     </div>
    ))}
   </div>
  </>
 );
}
