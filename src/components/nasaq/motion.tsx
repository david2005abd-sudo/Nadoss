'use client';

import { useEffect } from 'react';

/**
 * مراقب ظهور الأقسام — يضيف الصنف .nq-shown إلى أي عنصر يحمل .nq-reveal
 * عندما يدخل إلى الشاشة. مركّب مرة واحدة في الجذر، فلا حاجة لتغيير بنية JSX.
 */
export function MotionObserver() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.nq-reveal').forEach((el) => el.classList.add('nq-shown'));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('nq-shown');
            obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
    );

    const scan = () => {
      document.querySelectorAll('.nq-reveal:not(.nq-shown)').forEach((el) => obs.observe(el));
    };

    scan();
    // أعد المسح دوريًا خفيفًا لالتقاط أي عنصر يُضاف لاحقًا (تنقّل بين الصفحات)
    const timer = window.setInterval(scan, 700);

    return () => {
      obs.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return null;
}

/**
 * مؤشّر تقدّم التمرير — شريط علوي يعكس نسبة تمرير الصفحة.
 */
export function ScrollRail() {
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const p = max > 0 ? h.scrollTop / max : 0;
        document.documentElement.style.setProperty('--nq-scroll', String(p));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return <div className="nq-scroll-rail" aria-hidden="true" />;
}

/**
 * انتقال بين الصفحات — يضيف حركة دخول لمحتوى كل صفحة عند التنقّل،
 * ويستعيد أعلى الصفحة. يعمل مع App Router بدون تغيير أي صفحة.
 */
export function PageTransition() {
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    main.classList.remove('nq-page-enter');
    // force reflow so the animation restarts on every route change
    void main.offsetWidth;
    main.classList.add('nq-page-enter');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const fromHash = window.location.hash;
    if (fromHash) {
      const target = document.querySelector(fromHash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    if (window.scrollY > 40) {
      const prev = sessionStorage.getItem('nasaq_scroll');
      if (prev) {
        // الاسترداد مكان التمرير عند الرجوع للخلف معطّل افتراضيًا
        sessionStorage.removeItem('nasaq_scroll');
        return;
      }
      window.scrollTo({ top: 0 });
    }
  }, []);

  return null;
}

/**
 * تفاعل القائمة الجانبية على الهاتف: زر الرجوع في المتصفح يغلق القائمة.
 */
export function MobileNavSync() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.app-sidebar.mobile-open').forEach((el) => el.classList.remove('mobile-open'));
      document.querySelectorAll('.sidebar-overlay.open').forEach((el) => el.classList.remove('open'));
      document.querySelectorAll('.nav-links.mobile-open').forEach((el) => el.classList.remove('mobile-open'));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return null;
}
