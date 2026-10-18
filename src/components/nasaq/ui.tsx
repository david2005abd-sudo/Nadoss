'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { IconX } from './icons';
import { AnimatedNumber, TiltCard } from '@/components/nasaq/interactive';
import { useToasts } from '@/lib/nasaq/store-core';

/* ==========================================================================
  Modal
  ========================================================================== */

export function Modal({
 title,
 onClose,
 children,
 footer,
}: {
 title: string;
 onClose: () => void;
 children: ReactNode;
 footer?: ReactNode;
}) {
 useEffect(() => {
  function onKey(e: KeyboardEvent) {
   if (e.key === 'Escape') onClose();
  }
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
 }, [onClose]);

 return (
  <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
   <div className="modal-dialog">
    <div className="modal-header">
     <h2 className="text-base font-bold text-text-primary">{title}</h2>
     <button type="button" className="btn-ghost !px-2" onClick={onClose} aria-label="إغلاق">
      <IconX />
     </button>
    </div>
    <div className="modal-body">{children}</div>
    {footer && <div className="modal-footer">{footer}</div>}
   </div>
  </div>
 );
}

/* ==========================================================================
  Toasts
  ========================================================================== */

export function ToastContainer() {
 const { toasts, dismiss } = useToasts();
 if (toasts.length === 0) return null;
 return (
  <div className="toast-container" aria-live="polite">
   {toasts.map((t) => (
    <div key={t.id} className={`toast-item ${t.type}`} role="status">
     {t.message}
    </div>
   ))}
  </div>
 );
}

/* ==========================================================================
  Table helpers
  ========================================================================== */

export function Field({
 label,
 children,
 help,
}: {
 label: string;
 children: ReactNode;
 help?: string;
}) {
 return (
  <label className="form-group block">
   <span className="form-label">{label}</span>
   {children}
   {help && <span className="form-help">{help}</span>}
  </label>
 );
}

/* ==========================================================================
  Status badges
  ========================================================================== */

const STATUS_TONES: Record<string, string> = {
 // success
 'نشط': 'badge-success', 'مكتمل': 'badge-success', 'مدفوعة ': 'badge-success',
 'متاح للعرض': 'badge-success', 'معتمد': 'badge-success',
 'قيد التجهيز': 'badge-success', 'مؤكد': 'badge-success', 'منشور ': 'badge-success',
 'مرتبط ': 'badge-success', 'قيد التقدم': 'badge-success',
 // warning
 'منخفض المخزون': 'badge-warning', 'بانتظار': 'badge-warning',
 'بانتظار التوصيل': 'badge-warning', 'بانتظار التأكيد': 'badge-warning',
 'بانتظار موافقة العميل': 'badge-warning', 'معاينة نشطة': 'badge-warning',
 'يحتاج إلى إعداد': 'badge-warning', 'مفتوحة': 'badge-warning', 'متوسطة': 'badge-warning',
 'عالية': 'badge-warning', 'جديد': 'badge-warning', 'مسودة ': 'badge-warning',
 'غير مرتبط': 'badge-warning',
 // danger
 'محجوز / مباع ': 'badge-danger', 'ملغي': 'badge-danger',
 'غير مهيأ': 'badge-danger', 'معطّل': 'badge-muted', '': 'badge-muted',
 'تم الرد ': 'badge-secondary', 'منشورة': 'badge-success',
 'تم تسليم الكود': 'badge-success',
};

export function StatusBadge({ status }: { status: string }) {
 const tone = STATUS_TONES[status] ?? 'badge-muted';
 return <span className={tone}>{status}</span>;
}

/* ==========================================================================
  Search + filter toolbar
  ========================================================================== */

export function TableToolbar({
 search,
 onSearchChange,
 searchPlaceholder,
 searchId,
 filters,
 activeFilter,
 onFilterChange,
 action,
}: {
 search: string;
 onSearchChange: (v: string) => void;
 searchPlaceholder: string;
 searchId?: string;
 filters?: { v: string; l: string }[];
 activeFilter?: string;
 onFilterChange?: (v: string) => void;
 action?: ReactNode;
}) {
 return (
  <div className="flex flex-wrap items-center justify-between gap-3">
   <div className="flex flex-wrap items-center gap-2">
    <div className="relative">
     <input
      id={searchId}
      className="form-control !py-2 sm:w-64"
      placeholder={searchPlaceholder}
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      aria-label={searchPlaceholder}
     />
    </div>
    {filters && onFilterChange && (
     <div className="flex gap-1">
      {filters.map((f) => (
       <button
        key={f.v}
        type="button"
        className={`btn-sm ${activeFilter === f.v ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => onFilterChange(f.v)}
       >
        {f.l}
       </button>
      ))}
     </div>
    )}
   </div>
   {action}
  </div>
 );
}

/* ==========================================================================
  Empty state
  ========================================================================== */

export function EmptyState({
 title,
 description,
 action,
}: {
 title: string;
 description?: string;
 action?: ReactNode;
}) {
 return (
  <div className="table-empty">
   <p className="font-medium text-text-primary">{title}</p>
   {description && <p className="mt-1 text-xs">{description}</p>}
   {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>
 );
}

/* ==========================================================================
   Icon tone map (shared by KPI cards)
   ========================================================================== */

const ICON_TONES: Record<string, string> = {
  purple: 'icon-box-purple',
  teal: 'icon-box-teal',
  green: 'icon-box-green',
  amber: 'icon-box-amber',
};

/* ==========================================================================
   KPI card — animated: counts up when scrolled into view, tilts on hover
   ========================================================================== */

export function KpiCard({
  label,
  value,
  icon,
  tone = 'purple',
  hint,
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  tone?: 'purple' | 'teal' | 'green' | 'amber';
  hint?: string;
}) {
  const isNumeric = typeof value === 'number';
  return (
    <TiltCard className="kpi-card" max={4}>
      <div>
        <p className="text-xs text-text-secondary">{label}</p>
        {isNumeric ? <AnimatedNumber value={value as number} /> : <p className="kpi-value">{value}</p>}
        {hint && <p className="mt-1 text-xs text-text-secondary">{hint}</p>}
      </div>
      {icon && <div className={`${ICON_TONES[tone]} nq-icon-pop`}>{icon}</div>}
    </TiltCard>
  );
}

/* ==========================================================================
  Breadcrumbs
  ========================================================================== */

export function Breadcrumbs({ items }: { items: string[] }) {
 return (
  <nav className="breadcrumbs" aria-label="مسار التنقل">
   {items.map((it, i) => (
    <span key={`${it}-${i}`} className="flex items-center gap-2">
     {i > 0 && <span aria-hidden="true">/</span>}
     <span className={i === items.length - 1 ? 'font-medium text-text-primary' : ''}>{it}</span>
    </span>
   ))}
  </nav>
 );
}
