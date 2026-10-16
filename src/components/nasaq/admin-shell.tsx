'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { getIcon, IconAi, IconMenu, IconX } from '@/components/nasaq/icons';

/** Admin sections — ids match the mockup's admin nav. */
const SECTIONS: { id: string; label: string; icon: string }[] = [
  { id: 'overview', label: 'نظرة عامة على المنصة', icon: 'chart' },
  { id: 'subscribers', label: 'المشتركون', icon: 'users' },
  { id: 'projects', label: 'المشاريع المنشأة', icon: 'layers' },
  { id: 'plans', label: 'الباقات والأسعار', icon: 'receipt' },
  { id: 'modules', label: 'محرك الوحدات', icon: 'grid' },
  { id: 'ai', label: 'مزودو الذكاء الاصطناعي', icon: 'sparkle' },
  { id: 'ai-usage', label: 'استهلاك الذكاء الاصطناعي', icon: 'chart' },
  { id: 'notifications', label: 'الإشعارات والتقارير', icon: 'bell' },
  { id: 'activity', label: 'سجل الإجراءات (Logs)', icon: 'file' },
  { id: 'support', label: 'تذاكر الدعم الفني', icon: 'file' },
  { id: 'branding', label: 'الهوية والإعدادات العامة', icon: 'cog' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = pathname?.split('/').filter(Boolean).pop() ?? 'overview';

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <button type="button" className="btn btn-ghost !px-2 lg:hidden" onClick={() => setOpen(true)} aria-label="فتح القائمة">
          <IconMenu />
        </button>
        <Link href="/" className="brand-logo">
          <span className="brand-mark">ن</span>
          <span className="font-extrabold">نَسَق</span>
        </Link>
        <span className="badge badge-primary">لوحة المالك (Super Admin)</span>
        <div className="flex-1" />
        <Link href="/dashboard" className="btn btn-outline btn-sm">لوحة العميل (Demo)</Link>
        <Link href="/ai-assistant" className="btn btn-ghost !px-2" aria-label="المساعد الذكي" title="المساعد الذكي">
          <IconAi />
        </Link>
      </header>

      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside id="admin-sidebar" className={`app-sidebar ${open ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <span className="icon-box">{getIcon('cog')}</span>
          <strong className="truncate">لوحة المالك</strong>
          <button type="button" className="btn btn-ghost !px-2 lg:hidden" onClick={() => setOpen(false)} aria-label="إغلاق">
            <IconX size={16} />
          </button>
        </div>
        <nav className="sidebar-nav" id="admin-sidebar-nav" aria-label="أقسام لوحة المالك">
          {SECTIONS.map((s) => (
            <Link
              key={s.id}
              href={`/admin/${s.id}`}
              className={`sidebar-item ${active === s.id ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {getIcon(s.icon, { size: 18 })}
              <span>{s.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Link href="/" className="sidebar-item"><span>العودة لموقع نَسَق</span></Link>
        </div>
      </aside>

      <div className="app-main-wrap lg:pr-[var(--sidebar-width)]">
        <main id="admin-main-content" className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Admin page header with the section title mirrored into the topbar slot. */
export function AdminHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-extrabold sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <span className="badge badge-muted" id="admin-page-title">{title}</span>
      </div>
    </div>
  );
}
