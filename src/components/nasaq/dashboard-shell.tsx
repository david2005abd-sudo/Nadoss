'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useNasaq } from '@/lib/nasaq/store';
import { CORE_MODULES, MODULE_REGISTRY } from '@/lib/nasaq/modules';
import { getIcon, IconAi, IconBell, IconMenu, IconSearch, IconX } from './icons';

/** Sidebar sections in the same order as the mockup's sidebar groups. */
const GROUPS: { title: string; modules: string[] }[] = [
 { title: 'نظرة عامة', modules: ['dashboard'] },
 { title: 'النشاط اليومي', modules: ['orders', 'bookings', 'quotes', 'invoices', 'delivery'] },
 { title: 'العروض والبيع', modules: ['products', 'menu', 'services', 'categories', 'properties', 'spareParts', 'digitalDelivery', 'stock'] },
 { title: 'المخزون والتشغيل', modules: ['inventory', 'vehicles'] },
 { title: 'العملاء والفريق', modules: ['customers', 'employees'] },
 { title: 'النمو والتقارير', modules: ['marketing', 'analytics'] },
 { title: 'الموقع والمحتوى', modules: ['content', 'portfolio', 'files', 'projects'] },
 { title: 'النظام', modules: ['aiAssistant', 'moduleSettings', 'settings'] },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
 const { state, project, setActiveProject } = useNasaq();
 const pathname = usePathname();
 const router = useRouter();
 const [mobileOpen, setMobileOpen] = useState(false);

 const enabled = project?.enabledModules ?? [];
 const pinned = project?.pinnedModules ?? [];
 const activeRoute = pathname?.split('/').filter(Boolean).pop() ?? 'dashboard';

 if (!project) {
  return (
   <div className="app-shell">
    <AppTopbar onMenu={() => setMobileOpen(true)} />
    <main className="app-content">
     <div className="card mx-auto max-w-lg text-center">
      <h1 className="mb-2 text-lg font-extrabold">لا يوجد مشروع مفعل</h1>
      <p className="mb-4 text-sm text-muted">اختر مشروعًا أو أنشئ مشروعك الخاص للبدء.</p>
      <div className="flex flex-wrap justify-center gap-2">
       <Link href="/onboarding" className="btn btn-primary btn-sm">أنشئ مشروعًا جديدًا</Link>
       <Link href="/" className="btn btn-outline btn-sm">العودة للرئيسية</Link>
      </div>
     </div>
    </main>
   </div>
  );
 }

 return (
  <div className="app-shell">
   <AppTopbar onMenu={() => setMobileOpen(true)} />

   <div className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} aria-hidden="true" />

   <aside id="customer-sidebar" className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
    <div className="sidebar-header">
     <span className="brand-mark">ن</span>
     <strong className="truncate" style={{ color: project.primaryColor }}>{project.builder.logoText || project.name}</strong>
     <button type="button" className="btn btn-ghost !px-2 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة">
      <IconX size={16} />
     </button>
    </div>

    {/* main store link — mirrors the mockup's "return to dashboard" entry */}
    <div className="p-2 pb-0">
     <Link
      href="/dashboard"
      className={`sidebar-item-main ${activeRoute === 'dashboard' ? 'active' : ''}`}
      onClick={() => setMobileOpen(false)}
      title="العودة لنظرة عامة لمشروعك"
     >
      {getIcon('layout', { size: 18 })}
      <span className="flex-1 text-right">{project.name}</span>
      {getIcon('chevronLeft', { size: 16 })}
     </Link>
    </div>

    <div className="sidebar-nav">
     {pinned.length > 0 && (
      <>
       <div className="sidebar-section-title">المثبتة</div>
       {pinned.map((mId) => (
        <SidebarLink key={`pin-${mId}`} mId={mId} activeRoute={activeRoute} onNavigate={() => setMobileOpen(false)} />
       ))}
      </>
     )}

     {GROUPS.map((group) => {
      const items = group.modules.filter((m) => enabled.includes(m) || CORE_MODULES.includes(m));
      if (items.length === 0) return null;
      return (
       <div key={group.title}>
        <div className="sidebar-section-title">{group.title}</div>
        {items.map((mId) => (
         <SidebarLink key={`${group.title}-${mId}`} mId={mId} activeRoute={activeRoute} onNavigate={() => setMobileOpen(false)} />
        ))}
       </div>
      );
     })}
    </div>

    <div className="sidebar-footer">
     <button type="button" className="sidebar-item w-full text-right" onClick={() => router.push('/ai-assistant')}>
      {getIcon('sparkle', { size: 18 })}
      <span className="flex-1 text-right">افتح المساعد الذكي (AI)</span>
     </button>
     <Link href="/" className="sidebar-item mt-1" onClick={() => setMobileOpen(false)}>
      {getIcon('home', { size: 18 })}
      <span>العودة لموقع نَسَق</span>
     </Link>
    </div>
   </aside>

   <div className="app-main-wrap lg:pr-[var(--sidebar-width)]">
    <main id="dashboard-main-content" className="app-content">
     {children}
    </main>
   </div>

   {/* AI drawer */}
   <button
    type="button"
    className="btn btn-primary fixed bottom-6 left-6 z-40 !h-12 !w-12 !rounded-full !p-0 shadow-md"
    onClick={() => router.push('/ai-assistant')}
    aria-label="افتح المساعد الذكي"
    title="المساعد الذكي (AI)"
   >
    <IconAi />
   </button>
  </div>
 );
}

/* ==========================================================================
  Topbar — project switcher, notifications, search, user card
  ========================================================================== */

function AppTopbar({ onMenu }: { onMenu: () => void }) {
 const { state, project, setActiveProject } = useNasaq();
 const router = useRouter();
 const unread = state.notifications.filter((n) => !n.read).length;

 return (
  <header className="app-topbar">
   <button type="button" className="btn btn-ghost !px-2 lg:hidden" onClick={onMenu} aria-label="فتح القائمة">
    <IconMenu size={20} />
   </button>

   <div className="hidden items-center gap-2 lg:flex">
    <Link href="/" className="brand-logo">
     <span className="brand-mark">ن</span>
     <span className="font-extrabold">نَسَق</span>
    </Link>
    <span className="badge badge-primary">لوحة تحكم العميل</span>
   </div>

   <div className="flex flex-1 items-center gap-2">
    <label className="form-group w-full sm:max-w-xs">
     <span className="sr-only">بحث</span>
     <div className="relative">
      <input
       id="global-search-input"
       className="form-control !py-1.5 sm:w-64"
       placeholder="بحث سريع في المشروع واللوحة..."
       onKeyDown={(e) => {
        if (e.key === 'Enter') router.push('/dashboard');
       }}
      />
     </div>
    </label>
   </div>

   <div className="flex items-center gap-2">
    <label className="form-group hidden sm:block">
     <span className="sr-only">تبديل المشروع</span>
     <select
      id="project-switcher-select"
      className="form-control !w-auto !py-1.5"
      value={project?.id ?? ''}
      onChange={(e) => setActiveProject(e.target.value)}
     >
      {state.projects.map((p) => (
       <option key={p.id} value={p.id}>{p.name} — {p.businessType}</option>
      ))}
     </select>
    </label>

    <Link id="notifications-popover" href="/dashboard" className="relative btn btn-ghost !px-2" title={`الإشعارات${unread ? ` (${unread})` : ''}`}>
     <IconBell />
     {unread > 0 && (
      <span id="notif-unread-badge" className="absolute -top-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
       {unread}
      </span>
     )}
    </Link>

    <Link href="/admin/overview" className="btn btn-ghost btn-sm hide-sm" title="لوحة المالك ال">
     لوحة المالك 
    </Link>

    <Link href="/login" className="btn btn-outline btn-sm">دخول</Link>

    <div className="hidden items-center gap-2 sm:flex">
     <span className="flex h-8 w-8 items-center justify-center rounded-full bg-light-purple text-sm font-bold text-primary">
      {state.userSettings.name.slice(0, 1)}
     </span>
     <div className="leading-tight">
      <span id="topbar-user-name" className="block text-xs font-bold">{state.userSettings.name}</span>
      <span className="text-[10px] text-muted">{project?.city ?? '—'} • {project?.ownerName ?? 'مالك المشروع'}</span>
     </div>
    </div>
   </div>
  </header>
 );
}

function SidebarLink({
 mId,
 activeRoute,
 onNavigate,
}: {
 mId: string;
 activeRoute: string;
 onNavigate: () => void;
}) {
 const mod = MODULE_REGISTRY[mId];
 if (!mod) return null;
 const active = activeRoute === mod.route;
 return (
  <Link href={`/dashboard/${mod.route}`} className={`sidebar-item ${active ? 'active' : ''}`} onClick={onNavigate}>
   {getIcon(mod.icon, { size: 18 })}
   <span>{mod.name}</span>
  </Link>
 );
}

export { IconSearch };
