'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ==========================================================================
   useReveal — reveals an element once it scrolls into view
   ========================================================================== */

export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.12) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/** Reveals a list of items with a stagger — returns a style factory. */
export function useStagger(count: number, active: boolean, stepMs = 60, initialMs = 0) {
  return useCallback(
    (index: number): React.CSSProperties => ({
      opacity: active ? 1 : 0,
      transform: active ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.985)',
      transition: `opacity .5s ease ${initialMs + index * stepMs}ms, transform .5s cubic-bezier(.2,.7,.3,1) ${initialMs + index * stepMs}ms`,
    }),
    [active, stepMs, initialMs]
  );
}

/* ==========================================================================
   useCountUp — animates a number from 0 to its target
   ========================================================================== */

export function useCountUp(target: number, active: boolean, durationMs = 900, formatter?: (n: number) => string) {
  const [value, setValue] = useState(0);
  const fmt = formatter ?? ((n: number) => n.toLocaleString('en-US'));

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    if (typeof requestAnimationFrame === 'undefined') {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, durationMs]);

  return fmt(Math.round(value));
}

/* ==========================================================================
   useTilt — subtle 3D tilt on pointer move (desktop only)
   ========================================================================== */

export function useTilt<T extends HTMLElement = HTMLDivElement>(max = 6) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-2px)`;
      el.style.setProperty('--tilt-x', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--tilt-y', `${(py * 100).toFixed(1)}%`);
    };
    const onLeave = () => {
      el.style.transform = '';
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [max]);

  return ref;
}

/* ==========================================================================
   useRipple — material-style click ripple
   ========================================================================== */

export function useRipple<T extends HTMLElement = HTMLButtonElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2.2;
      const span = document.createElement('span');
      span.className = 'nq-ripple';
      span.style.width = span.style.height = `${size}px`;
      span.style.left = `${e.clientX - r.left - size / 2}px`;
      span.style.top = `${e.clientY - r.top - size / 2}px`;
      el.appendChild(span);
      window.setTimeout(() => span.remove(), 620);
    };

    el.addEventListener('pointerdown', onDown);
    return () => el.removeEventListener('pointerdown', onDown);
  }, []);

  return ref;
}

/* ==========================================================================
   useScrollProgress — 0..1 page scroll progress
   ========================================================================== */

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? h.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return progress;
}

/* ==========================================================================
   useSpotlight — tracks the pointer for a CSS-variable spotlight
   ========================================================================== */

export function useSpotlight<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
      el.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
    };
    el.addEventListener('pointermove', onMove);
    return () => el.removeEventListener('pointermove', onMove);
  }, []);

  return ref;
}

/* ==========================================================================
   useToast — local toast queue (works without the global provider)
   ========================================================================== */

export type LocalToast = { id: string; type: 'success' | 'warning' | 'danger' | 'info'; message: string };

export function useLocalToast(timeoutMs = 3200) {
  const [toasts, setToasts] = useState<LocalToast[]>([]);

  const push = useCallback(
    (type: LocalToast['type'], message: string) => {
      const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((t) => [...t, { id, type, message }]);
      window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), timeoutMs);
    },
    [timeoutMs]
  );

  const dismiss = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  return { toasts, push, dismiss };
}
