'use client';

import Link from 'next/link';
import { useNasaq } from '@/lib/nasaq/store';
import { ADMIN_SECTIONS } from '@/lib/nasaq/admin-sections';
import { AdminHeader } from '@/components/nasaq/admin-shell';
import { getIcon, IconAi } from '@/components/nasaq/icons';
import { KpiCard, StatusBadge } from '@/components/nasaq/ui';
import { formatPrice } from '@/lib/utils';

/**
 * لوحة المالك — إدارة المنصة ككل.
 * نقطة الدخول /admin/ التي تعرض نظرة شاملة وروابط لكل الأقسام.
 */
export default function AdminPage() {
  const { state } = useNasaq();

  const subscribers = state.subscribers;
  const activeSubs = subscribers.filter((s) => s.status === 'نشط').length;
  const totalMonthly = subscribers.reduce((sum, s) => {
    const plan = state.plans.find((p) => p.code === s.plan);
    return sum + (plan?.price ?? 0);
  }, 0);
  const aiRequests = state.aiUsageLogs.reduce((sum, l) => sum + (l.requests ?? 0), 0);
  const openTickets = state.supportTickets.filter((t) => t.status === 'مفتوحة').length;
  const unreadNotifs = state.notifications.filter((n) => !n.read).length;

  return (
    <>
      <AdminHeader
        title="لوحة المالك"
        subtitle="إدارة المنصة ككل: المشتركون، المشاريع، الباقات، الوحدات، مزودو الذكاء الاصطناعي، والهوية."
        actions={
          <Link href="/ai-assistant" className="btn btn-ghost !px-2" aria-label="المساعد الذكي" title="المساعد الذكي">
            <IconAi />
          </Link>
        }
      />

      {/* -------- KPIs -------- */}
      <div className="grid-4 nq-reveal">
        <KpiCard label="إجمالي المشتركين" value={subscribers.length} icon={getIcon('users')} tone="purple" />
        <KpiCard label="مشتركون نشطون" value={activeSubs} icon={getIcon('users')} tone="green" />
        <KpiCard
          label="الإيرادات الشهرية"
          value={formatPrice(totalMonthly, 'دينار عراقي (د.ع)')}
          icon={getIcon('chart')}
          tone="amber"
        />
        <KpiCard label="طلبات الذكاء الاصطناعي" value={aiRequests} icon={getIcon('sparkle')} tone="teal" />
      </div>

      <div className="grid-2 lg:grid-cols-4">
        <div className="card">
          <span className="text-xs text-muted">المشاريع المنشأة</span>
          <p className="kpi-value">{state.projects.length}</p>
        </div>
        <div className="card">
          <span className="text-xs text-muted">الباقات النشطة</span>
          <p className="kpi-value">{state.plans.filter((p) => p.status === 'نشطة').length}</p>
        </div>
        <div className="card">
          <span className="text-xs text-muted">تذاكر دعم مفتوحة</span>
          <p className="kpi-value">{openTickets}</p>
        </div>
        <div className="card">
          <span className="text-xs text-muted">إشعارات غير مقروءة</span>
          <p className="kpi-value">{unreadNotifs}</p>
        </div>
      </div>

      {/* -------- Platform health -------- */}
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs text-muted">حالة المنصة</span>
          <p className="mt-1 text-sm font-bold">
            {state.platformSettings.maintenanceMode ? 'وضع الصيانة مفعّل' : 'المنصة تعمل بشكل طبيعي'}
          </p>
          <p className="mt-1 text-xs text-muted" dir="ltr">
            {state.platformSettings.supportEmail}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/branding" className="btn btn-outline btn-sm">الهوية والإعدادات</Link>
          <Link href="/admin/subscribers" className="btn btn-primary btn-sm">إدارة المشتركين</Link>
        </div>
      </div>

      {/* -------- All admin sections -------- */}
      <div>
        <h2 className="mb-3 text-base font-extrabold">أقسام لوحة المالك ({ADMIN_SECTIONS.length})</h2>
        <div className="grid-3 sm:grid-cols-2 lg:grid-cols-4">
          {ADMIN_SECTIONS.map((s) => (
            <Link key={s.id} href={s.href} className="card card-interactive">
              <div className="icon-box mb-2">{getIcon(s.icon)}</div>
              <span className="text-sm font-bold">{s.label}</span>
              <p className="mt-1 text-xs text-muted">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* -------- Latest subscribers -------- */}
      <div className="grid-2 nq-reveal">
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-muted">أحدث المشتركين</span>
            <Link href="/admin/subscribers" className="text-xs text-primary hover:underline">عرض الكل</Link>
          </div>
          <div className="table-wrap nq-reveal">
            <table className="data-table">
              <thead>
                <tr>
                  <th>المشترك</th>
                  <th>الباقة</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.slice(0, 5).map((s) => (
                  <tr key={s.id}>
                    <td className="font-bold">{s.name}</td>
                    <td><span className="badge badge-primary">{s.plan}</span></td>
                    <td><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-muted">آخر الإجراءات</span>
            <Link href="/admin/activity" className="text-xs text-primary hover:underline">السجل الكامل</Link>
          </div>
          <div className="space-y-2">
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
        </div>
      </div>

      {/* -------- Plans snapshot -------- */}
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-muted">ملخص الباقات</span>
          <Link href="/admin/plans" className="text-xs text-primary hover:underline">تعديل الأسعار</Link>
        </div>
        <div className="grid-3 sm:grid-cols-3 nq-reveal">
          {state.plans.map((p) => (
            <div key={p.id} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{p.nameAr}</span>
                {p.popular && <span className="badge badge-primary">الأكثر اختيارًا</span>}
              </div>
              <p className="mt-2 text-xl font-extrabold text-primary">{formatPrice(p.price, 'دينار عراقي (د.ع)')}</p>
              <p className="mt-1 text-xs text-muted">{p.period}</p>
              <p className="mt-2 text-xs text-muted">{p.availableModules}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ background: 'var(--muted-surface)' }}>
        <span className="badge badge-warning">ملاحظة</span>
        <p className="mt-2 text-sm">
          تدير هذه اللوحة إعدادات المنصة والمشتركين والباقات والمزودين التي تظهر في واجهات نَسَق. أي ربط بخدمات
          دفع أو اشتراكات فعلية يتم من لوحة المزوّد نفسه.
        </p>
      </div>
    </>
  );
}
