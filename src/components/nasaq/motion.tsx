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
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );

    const scan = () => {
      document.querySelectorAll('.nq-reveal:not(.nq-shown)').forEach((el) => obs.observe(el));
    };

    scan();
    // أعد المسح دوريًا خفيفًا لالتقاط أي عنصر يُضاف لاحقًا (تنقّل بين الصفحات)
    const timer = window.setInterval(scan, 900);

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
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      document.documentElement.style.setProperty('--nq-scroll', String(p));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return <div className="nq-scroll-rail" aria-hidden="true" />;
}
