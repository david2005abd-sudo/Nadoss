'use client';

import Link from 'next/link';
import { useNasaq } from '@/lib/nasaq/store';
import { getIcon } from '@/components/nasaq/icons';
import { AdminHeader } from '@/components/nasaq/admin-shell';
import { KpiCard, StatusBadge } from '@/components/nasaq/ui';
import { formatIQD } from '@/lib/utils';

export default function AdminOverviewPage() {
 const { state } = useNasaq();
 const subs = state.subscribers;
 const activeCount = subs.filter((s) => s.status === 'نشط').length;
 const totalRevenue = subs.reduce((s, x) => {
  const plan = state.plans.find((p) => p.code === x.plan);
  return s + (plan?.price ?? 0);
 }, 0);
 const unread = state.notifications.filter((n) => !n.read).length;
 const totalAi = state.aiUsageLogs.reduce((s, l) => s + (l.requests ?? 0), 0);

 return (
  <>
   <AdminHeader title="نظرة عامة على المنصة" subtitle="مؤشرات المشتركين، الاشتراكات، استهلاك الذكاء الاصطناعي، والدعم الفني." />

   <div className="grid-4 nq-reveal">
    <KpiCard label="إجمالي المشتركين" value={subs.length} icon={getIcon('users')} tone="purple" />
    <KpiCard label="مشتركون نشطون" value={activeCount} icon={getIcon('users')} tone="green" />
    <KpiCard label="الإيرادات الشهرية " value={formatIQD(totalRevenue)} icon={getIcon('chart')} tone="amber" />
    <KpiCard label="طلبات AI " value={totalAi} icon={getIcon('sparkle')} tone="teal" />
   </div>

   <div className="grid-3 sm:grid-cols-2 lg:grid-cols-4">
    <div className="card"><span className="text-xs text-muted">إشعارات غير مقروءة</span><p className="kpi-value">{unread}</p></div>
    <div className="card"><span className="text-xs text-muted">تذاكر الدعم المفتوحة</span><p className="kpi-value">{state.supportTickets.filter((t) => t.status === 'مفتوحة').length}</p></div>
    <div className="card"><span className="text-xs text-muted">مشاريع منشأة</span><p className="kpi-value">{state.projects.length}</p></div>
    <div className="card"><span className="text-xs text-muted">وضع الصيانة</span><p className="mt-1 text-sm font-bold">{state.platformSettings.maintenanceMode ? 'مفعّل' : 'معطّل'}</p></div>
   </div>

   <div className="grid-2 nq-reveal">
    <div className="card">
     <span className="text-xs text-muted">أحدث المشتركين </span>
     <div className="table-wrap mt-3">
      <table className="data-table">
       <thead>
        <tr>
         <th>المشترك</th>
         <th>الباقة</th>
         <th>الحالة</th>
        </tr>
       </thead>
       <tbody>
        {subs.slice(0, 5).map((s) => (
         <tr key={s.id}>
          <td className="font-bold text-text-primary">{s.name}</td>
          <td><span className="badge badge-primary">{s.plan}</span></td>
          <td><StatusBadge status={s.status} /></td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
     <Link href="/admin/subscribers" className="btn btn-outline btn-sm mt-3">إدارة المشتركين</Link>
    </div>

    <div className="card">
     <span className="text-xs text-muted">آخر الإجراءات (Audit Log)</span>
     <div className="mt-3 space-y-2">
      {state.activityLog.slice(0, 5).map((a) => (
       <div key={a.id} className="rounded-md border border-border p-2">
        <div className="flex items-center justify-between">
         <span className="text-xs font-bold">{a.actor}</span>
         <span className="text-[11px] text-muted">{a.time}</span>
        </div>
        <p className="mt-1 text-xs text-muted">{a.action}</p>
       </div>
      ))}
     </div>
     <Link href="/admin/activity" className="btn btn-outline btn-sm mt-3">عرض سجل الإجراءات الكامل</Link>
    </div>
   </div>

   <div className="card" style={{ background: 'var(--muted-surface)' }}>
    <span className="badge badge-warning">قيود لوحة المالك</span>
    <p className="mt-2 text-sm">
     كل البيانات في هذه اللوحة ومحلية فقط. يمكنك تجربة التعديل على الباقات والمشتركين والمزودين
     لمعرفة سلوك اللوحة، لكن لا يوجد أي تأثير حقيقي على اشتراكات أو مدفوعات فعلية.
    </p>
   </div>
  </>
 );
}
