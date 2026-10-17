'use client';

import { useNasaq } from '@/lib/nasaq/store';
import { AdminHeader } from '@/components/nasaq/admin-shell';
import { getIcon } from '@/components/nasaq/icons';

export default function AdminNotificationsPage() {
 const { state, patchPlatform } = useNasaq();
 const unread = state.notifications.filter((n) => !n.read).length;

 const TYPES: Record<string, { label: string; cls: string }> = {
  info: { label: 'معلومة', cls: 'badge-primary' },
  warning: { label: 'تحذير', cls: 'badge-warning' },
  success: { label: 'نجاح', cls: 'badge-success' },
 };

 return (
  <>
   <AdminHeader
    title="الإشعارات والتقارير"
    subtitle="إشعارات المنصة: مشتركون جدد، تجاوزات حدود، طلبات دعم، وتكاملات."
    actions={
     <button
      type="button"
      className="btn btn-outline btn-sm"
      disabled={unread === 0}
      onClick={() => patchPlatform({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })}
     >
      تحديد الكل كمقروء ({unread})
     </button>
    }
   />

   <div className="space-y-3">
    {state.notifications.map((n) => (
     <div key={n.id} className="card flex items-start gap-3">
      <span className={TYPES[n.type]?.cls ?? 'badge-muted'}>{TYPES[n.type]?.label ?? n.type}</span>
      <div className="flex-1">
       <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold">{n.title}</h3>
        <span className="text-xs text-muted">{n.time}</span>
       </div>
       <p className="mt-1 text-sm text-muted">{n.text}</p>
      </div>
      {!n.read && (
       <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() =>
         patchPlatform({
          notifications: state.notifications.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
         })
        }
       >
        تحديد كمقروء
       </button>
      )}
     </div>
    ))}
   </div>

   <div className="grid-3 sm:grid-cols-2 lg:grid-cols-4">
    <div className="card">
     <span className="icon-box mb-2">{getIcon('users', { size: 18 })}</span>
     <span className="text-sm font-bold">مشتركون جدد</span>
     <p className="mt-1 text-xs text-muted">{state.notifications.filter((n) => n.type === 'success').length} إشعارات</p>
    </div>
    <div className="card">
     <span className="icon-box mb-2">{getIcon('chart', { size: 18 })}</span>
     <span className="text-sm font-bold">تجاوزات حدود</span>
     <p className="mt-1 text-xs text-muted">{state.notifications.filter((n) => n.type === 'warning').length} إشعارات</p>
    </div>
    <div className="card">
     <span className="icon-box mb-2">{getIcon('file', { size: 18 })}</span>
     <span className="text-sm font-bold">طلبات دعم</span>
     <p className="mt-1 text-xs text-muted">{state.supportTickets.length} تذاكر</p>
    </div>
    <div className="card">
     <span className="icon-box mb-2">{getIcon('cog', { size: 18 })}</span>
     <span className="text-sm font-bold">تكاملات</span>
     <p className="mt-1 text-xs text-muted">{state.aiProviders.filter((p) => p.status === 'نشط').length} مزودي AI نشطين</p>
    </div>
   </div>
  </>
 );
}
