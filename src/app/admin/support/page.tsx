'use client';

import { useState } from 'react';
import { useNasaq } from '@/lib/nasaq/store';
import { AdminHeader } from '@/components/nasaq/admin-shell';
import { KpiCard, StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { getIcon } from '@/components/nasaq/icons';

export default function AdminSupportPage() {
 const { state, patchPlatform } = useNasaq();
 const [q, setQ] = useState('');
 const [statusFilter, setStatusFilter] = useState('');

 const tickets = state.supportTickets;
 const filtered = tickets.filter(
  (t) => (!q || t.subject.includes(q) || t.subscriber.includes(q) || t.ticketNumber.includes(q)) && (!statusFilter || t.status === statusFilter)
 );
 const statuses = Array.from(new Set(tickets.map((t) => t.status)));

 return (
  <>
   <AdminHeader title="تذاكر الدعم الفني" subtitle="طلبات الدعم ال من المشتركين مع الأولوية والحالة." />

   <div className="grid-3 sm:grid-cols-2 lg:grid-cols-4">
    <KpiCard label="إجمالي التذاكر" value={tickets.length} icon={getIcon('file')} tone="purple" />
    <KpiCard label="تذاكر مفتوحة" value={tickets.filter((t) => t.status === 'مفتوحة').length} icon={getIcon('file')} tone="amber" />
    <KpiCard label="أولوية عالية" value={tickets.filter((t) => t.priority === 'عالية').length} icon={getIcon('file')} tone="teal" />
    <KpiCard label="تم الرد " value={tickets.filter((t) => t.status === 'تم الرد ').length} icon={getIcon('file')} tone="green" />
   </div>

   <TableToolbar
    search={q}
    onSearchChange={setQ}
    searchPlaceholder="ابحث برقم التذكرة أو الموضوع..."
    filters={[{ v: '', l: 'الكل' }, ...statuses.map((s) => ({ v: s, l: s }))]}
    activeFilter={statusFilter}
    onFilterChange={setStatusFilter}
   />

   <div className="table-wrap nq-reveal">
    <table className="data-table">
     <thead>
      <tr>
       <th>رقم التذكرة</th>
       <th>المشترك</th>
       <th>الموضوع</th>
       <th>الأولوية</th>
       <th>التاريخ</th>
       <th>الحالة</th>
       <th>إجراءات</th>
      </tr>
     </thead>
     <tbody>
      {filtered.map((t) => (
       <tr key={t.id}>
        <td className="font-bold text-text-primary">{t.ticketNumber}</td>
        <td>{t.subscriber}</td>
        <td className="max-w-[280px] text-muted">{t.subject}</td>
        <td>
         <span className={`badge ${t.priority === 'عالية' ? 'badge-danger' : t.priority === 'متوسطة' ? 'badge-warning' : 'badge-muted'}`}>
          {t.priority}
         </span>
        </td>
        <td className="text-muted">{t.date}</td>
        <td><StatusBadge status={t.status} /></td>
        <td>
         <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() =>
           patchPlatform({
            supportTickets: state.supportTickets.map((x) =>
             x.id === t.id ? { ...x, status: x.status === 'مفتوحة' ? 'تم الرد ' : 'مفتوحة' } : x
            ),
           })
          }
         >
          {t.status === 'مفتوحة' ? 'إغلاق ' : 'إعادة فتح'}
         </button>
        </td>
       </tr>
      ))}
     </tbody>
    </table>
   </div>
  </>
 );
}
