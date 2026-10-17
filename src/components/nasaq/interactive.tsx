'use client';

import type { ReactNode } from 'react';
import {
  useCountUp,
  useLocalToast,
  useRipple,
  useReveal,
  useSpotlight,
  useStagger,
  useTilt,
} from '@/lib/nasaq/interactions';
import { getIcon } from '@/components/nasaq/icons';

/* ==========================================================================
   Reveal — fades/slides children in on scroll
   ========================================================================== */

export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article';
  once?: boolean;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity .55s ease ${delay}ms, transform .55s cubic-bezier(.2,.7,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

/* ==========================================================================
   StaggerGrid — children appear one after another
   ========================================================================== */

export function StaggerGrid({
  children,
  className,
  stepMs = 55,
  as: Tag = 'div',
}: {
  children: ReactNode[];
  className?: string;
  stepMs?: number;
  as?: 'div' | 'section' | 'ul';
}) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.05);
  const stagger = useStagger(children.length, visible, stepMs);

  return (
    <Tag ref={ref as never} className={className}>
      {children.map((child, i) => (
        <div key={i} style={stagger(i)}>
          {child}
        </div>
      ))}
    </Tag>
  );
}

/* ==========================================================================
   TiltCard — card with 3D tilt + spotlight follow
   ========================================================================== */

export function TiltCard({
  children,
  className = 'card',
  max = 6,
  spotlight = true,
  onClick,
  href,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  spotlight?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const tiltRef = useTilt<HTMLDivElement>(max);
  const spotRef = useSpotlight<HTMLDivElement>();
  const Tag = href ? 'a' : 'div';

  return (
    <Tag
      ref={(href ? tiltRef : spotRef) as never}
      className={`${className} nq-tilt${spotlight ? ' nq-spotlight' : ''}`}
      onClick={onClick}
      {...(href ? { href } : {})}
      style={{ willChange: 'transform' }}
    >
      <div ref={href ? (spotRef as never) : (tiltRef as never)} style={{ display: 'contents' }}>
        {children}
      </div>
    </Tag>
  );
}

/* ==========================================================================
   InteractiveButton — ripple + magnetic hover
   ========================================================================== */

export function InteractiveButton({
  children,
  className = 'btn btn-primary',
  onClick,
  type = 'button',
  disabled,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const ripple = useRipple<HTMLButtonElement>();

  return (
    <button
      ref={ripple}
      type={type}
      className={`${className} nq-ripple-host`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

/* ==========================================================================
   AnimatedNumber — count-up KPI value
   ========================================================================== */

export function AnimatedNumber({
  value,
  format,
  className = 'kpi-value',
  durationMs = 900,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  durationMs?: number;
}) {
  const { ref, visible } = useReveal<HTMLSpanElement>(0.3);
  const text = useCountUp(value, visible, durationMs, format);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}

/* ==========================================================================
   AnimatedKpi — KPI card with icon, count-up and reveal
   ========================================================================== */

export function AnimatedKpi({
  label,
  value,
  icon,
  tone = 'purple',
  format,
  hint,
}: {
  label: string;
  value: number | string;
  icon?: string;
  tone?: 'purple' | 'teal' | 'green' | 'amber';
  format?: (n: number) => string;
  hint?: string;
}) {
  const tones = {
    purple: 'icon-box-purple',
    teal: 'icon-box-teal',
    green: 'icon-box-green',
    amber: 'icon-box-amber',
  };
  const isNumeric = typeof value === 'number';

  return (
    <TiltCard className="kpi-card" max={4}>
      <div>
        <p className="text-xs text-muted">{label}</p>
        {isNumeric ? (
          <AnimatedNumber value={value as number} format={format} />
        ) : (
          <p className="kpi-value">{value}</p>
        )}
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
      {icon && <div className={`${tones[tone]} nq-icon-pop`}>{getIcon(icon)}</div>}
    </TiltCard>
  );
}

/* ==========================================================================
   ToastStack — renders useLocalToast's queue
   ========================================================================== */

export function ToastStack({ toasts, dismiss }: { toasts: ReturnType<typeof useLocalToast>['toasts']; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="nq-toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-item ${t.type === 'info' ? '' : t.type} nq-toast`}
          role="status"
          onClick={() => dismiss(t.id)}
        >
          <span className="nq-toast-icon">
            {t.type === 'success' ? '✓' : t.type === 'danger' ? '✕' : t.type === 'warning' ? '!' : 'i'}
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
   StatBar — animated comparison bar
   ========================================================================== */

export function StatBar({
  label,
  value,
  max,
  suffix,
  color = 'var(--primary)',
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
  color?: string;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.2);
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div ref={ref} className="nq-statbar">
      <div className="nq-statbar-head">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-bold">
          {value.toLocaleString('en-US')}
          {suffix ? ` ${suffix}` : ''}
        </span>
      </div>
      <div className="nq-statbar-track">
        <div
          className="nq-statbar-fill"
          style={{
            width: visible ? `${pct}%` : '0%',
            background: color,
            transition: 'width 1s cubic-bezier(.2,.7,.3,1)',
          }}
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   LiveDot — pulsing status dot
   ========================================================================== */

export function LiveDot({ label, tone = 'success' }: { label?: string; tone?: 'success' | 'warning' | 'danger' | 'primary' }) {
  return (
    <span className={`nq-livedot nq-livedot-${tone}`}>
      <span className="nq-livedot-dot" />
      {label && <span className="text-xs">{label}</span>}
    </span>
  );
}
