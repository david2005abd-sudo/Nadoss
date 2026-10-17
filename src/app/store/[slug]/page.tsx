'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useNasaq } from '@/lib/nasaq/store';
import { BUSINESS_TYPES } from '@/lib/nasaq/config';
import { formatPrice } from '@/lib/utils';
import { getIcon, IconBag, IconCheck, IconStore } from '@/components/nasaq/icons';

/**
 * معاينة المتجر العام — تقرأ بيانات المشروع من المتجر المحلي وتعرض الموقع
 * كما يراه الزائر، دون الحاجة لأي خادم.
 */
export default function StoreHomePage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const { state, setActiveProject } = useNasaq();

  const project = useMemo(
    () => state.projects.find((p) => p.id === slug) ?? state.projects.find((p) => p.builder.siteName === slug) ?? null,
    [state.projects, slug]
  );

  const [cart, setCart] = useState<string[]>([]);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    if (project) setActiveProject(project.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
        <IconStore size={44} className="text-muted" />
        <h1 className="mt-4 text-2xl font-extrabold">المتجر غير موجود</h1>
        <p className="mt-2 text-muted">تأكد من الرابط أو أن المتجر مفعّل.</p>
        <Link href="/" className="btn btn-primary mt-6">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const visibleSections = project.builder.sections.filter((s) => s.visible);
  const businessLabel = BUSINESS_TYPES.find((b) => b.id === project.businessType)?.name ?? project.businessType;
  const money = (n: number) => formatPrice(n, project.currency);

  /* قائمة العناصر المعروضة تختلف حسب نوع النشاط */
  type Item = { id: string; name: string; price: number; category: string; available: boolean; image?: string };
  const items: Item[] =
    project.menu.length > 0
      ? project.menu.map((m) => ({ id: m.id, name: m.name, price: m.price, category: m.category, available: m.available }))
      : project.products.length > 0
        ? project.products.map((p) => ({ id: p.id, name: p.name, price: p.price, category: p.category, available: p.stock > 0 }))
        : project.services.length > 0
          ? project.services.map((s) => ({ id: s.id, name: s.name, price: s.price, category: s.duration, available: true }))
          : project.properties.length > 0
            ? project.properties.map((p) => ({ id: p.id, name: p.name, price: 0, category: p.type, available: p.status === 'متاح للعرض' }))
            : [];

  const cartTotal = items.filter((i) => cart.includes(i.id)).reduce((s, i) => s + i.price, 0);

  function addToCart(id: string) {
    setCart((c) => (c.includes(id) ? c : [...c, id]));
    setAdded(id);
    window.setTimeout(() => setAdded(null), 2200);
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* -------- Store header -------- */}
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="nasaq-container flex h-16 items-center justify-between gap-3">
          <div className="brand-logo">
            <span className="brand-mark" style={{ background: project.primaryColor }}>
              {project.builder.logoText.slice(0, 1)}
            </span>
            <span className="font-extrabold">{project.builder.logoText}</span>
          </div>

          <nav className="hidden items-center gap-5 sm:flex">
            {visibleSections.slice(0, 4).map((s) => (
              <a key={s.id} href={`#sec-${s.id}`} className="nav-link">
                {s.title}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="badge badge-muted hide-sm">{businessLabel}</span>
            <Link href="/dashboard" className="btn btn-outline btn-sm">
              لوحة التحكم
            </Link>
            <span className="badge badge-primary">
              <IconBag size={14} /> {cart.length}
            </span>
          </div>
        </div>
      </header>

      {/* -------- Hero -------- */}
      <section className="hero-section">
        <div className="nasaq-container">
          <span className="badge badge-primary">{project.city}</span>
          <h1 className="hero-title mt-3" style={{ color: project.primaryColor }}>
            {project.builder.heroTitle}
          </h1>
          <p className="hero-desc">{project.builder.heroSubtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#products" className="btn btn-lg btn-primary" style={{ background: project.primaryColor }}>
              تصفّح القائمة
            </a>
            {project.phone && (
              <a href={`tel:${project.phone}`} className="btn btn-lg btn-outline">
                اتصل بنا: <span dir="ltr">{project.phone}</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* -------- Items -------- */}
      <section id="products" className="section-block">
        <div className="nasaq-container">
          <div className="section-header">
            <span className="section-badge" style={{ background: project.primaryColor, color: '#fff' }}>
              {project.menu.length > 0 ? 'المنيو' : project.services.length > 0 ? 'الخدمات' : 'المنتجات'}
            </span>
            <h2 className="section-title">{project.name}</h2>
            <p className="section-desc">{project.description}</p>
          </div>

          {items.length > 0 ? (
            <div className="grid-3 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => (
                <div key={item.id} className="card card-interactive flex flex-col justify-between">
                  <div>
                    <span className="badge badge-muted mb-2">{item.category}</span>
                    <h3 className="text-sm font-bold">{item.name}</h3>
                    {item.price > 0 && (
                      <p className="mt-1 text-base font-extrabold" style={{ color: project.primaryColor }}>
                        {money(item.price)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`btn btn-sm mt-3 ${item.available ? 'btn-primary' : 'btn-outline'}`}
                    style={item.available ? { background: project.primaryColor } : undefined}
                    disabled={!item.available}
                    onClick={() => addToCart(item.id)}
                  >
                    {!item.available ? 'غير متوفر' : added === item.id ? <><IconCheck size={14} /> أُضيف</> : 'اطلب الآن'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="card py-16 text-center text-muted">
              {getIcon('bag', { size: 40 })}
              <p className="mt-3">لا توجد عناصر معروضة في هذا المتجر بعد.</p>
            </div>
          )}
        </div>
      </section>

      {/* -------- Builder sections -------- */}
      {visibleSections.map((s) => (
        <section key={s.id} id={`sec-${s.id}`} className="section-block section-block-alt">
          <div className="nasaq-container max-w-3xl">
            <span className="section-badge">{s.type}</span>
            <h2 className="section-title">{s.title}</h2>
            <p className="section-desc">{s.content}</p>
          </div>
        </section>
      ))}

      {/* -------- Cart bar -------- */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface p-4">
          <div className="nasaq-container flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-muted">إجمالي الطلب</span>
              <p className="text-lg font-extrabold">{money(cartTotal)}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setCart([])}>
                إفراغ السلة
              </button>
              <button type="button" className="btn btn-primary btn-sm" style={{ background: project.primaryColor }}>
                إتمام الطلب (الدفع عند الاستلام)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------- Footer -------- */}
      <footer className="mt-12 border-t border-border bg-surface py-8">
        <div className="nasaq-container text-center text-sm text-muted">
          <p className="font-bold text-text-primary">{project.name}</p>
          <p className="mt-1">{project.city} — الدفع عند الاستلام متاح في كل العراق</p>
          {project.phone && <p className="mt-1" dir="ltr">{project.phone}</p>}
          <p className="mt-3 text-xs">مدعوم بواسطة نَسَق</p>
        </div>
      </footer>
    </div>
  );
}
