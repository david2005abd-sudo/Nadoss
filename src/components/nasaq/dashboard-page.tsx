'use client';

import type { ReactNode } from 'react';
import { useNasaq } from '@/lib/nasaq/store';
import type { Project } from '@/lib/nasaq/seed';
import Link from 'next/link';

export type ModuleCtx = {
 project: Project;
 patch: (patch: Partial<Project>) => void;
 state: ReturnType<typeof useNasaq>['state'];
};

/**
 * Shared wrapper for every dashboard module page.
 * Gives the page the active project and a no-project fallback, and
 * normalises the patch() helper so it accepts a partial project.
 */
export function DashboardModule({
 title,
 subtitle,
 breadcrumb,
 actions,
 children,
}: {
 title: string;
 subtitle?: string;
 breadcrumb?: string[];
 actions?: (ctx: ModuleCtx) => ReactNode;
 children: (ctx: ModuleCtx) => ReactNode;
}) {
 const { project, patchProject, state } = useNasaq();

 if (!project) {
  return (
   <div className="card text-center">
    <h1 className="mb-2 text-lg font-extrabold">لا يوجد مشروع مفعل</h1>
    <p className="mb-4 text-sm text-muted">اختر مشروعًا من الشريط العلوي أو أنشئ مشروعك الخاص للبدء.</p>
    <div className="flex flex-wrap justify-center gap-2">
     <Link href="/onboarding" className="btn btn-primary btn-sm">أنشئ مشروعًا</Link>
     <Link href="/" className="btn btn-outline btn-sm">الرئيسية</Link>
    </div>
   </div>
  );
 }

 return (
  <div className="space-y-5">
   <div className="flex flex-wrap items-end justify-between gap-3">
    <div>
     <nav className="breadcrumbs" aria-label="مسار التنقل">
      {(breadcrumb ?? [project.name, title]).map((c, i) => (
       <span key={`${c}-${i}`} className="flex items-center gap-2">
        {i > 0 && <span aria-hidden="true">/</span>}
        <span className={i === (breadcrumb ?? [project.name, title]).length - 1 ? 'font-medium text-text-primary' : ''}>{c}</span>
       </span>
      ))}
     </nav>
     <h1 className="text-xl font-extrabold sm:text-2xl">{title}</h1>
     {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
    {actions?.({ project, patch: patchProject, state })}
   </div>
   {children({ project, patch: patchProject, state })}
  </div>
 );
}
