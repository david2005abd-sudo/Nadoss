'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useNasaq } from '@/lib/nasaq/store';
import { BUSINESS_TYPES, IRAQ_GOVERNORATES } from '@/lib/nasaq/config';
import { formatPrice } from '@/lib/utils';
import {
  IconBag,
  IconCheck,
  IconSearch,
  IconStore,
  IconX,
} from '@/components/nasaq/icons';
import { getIcon } from '@/components/nasaq/icons';
import {
  LiveDot,
  Reveal,
  StaggerGrid,
  StatBar,
  TiltCard,
  ToastStack,
} from '@/components/nasaq/interactive';
import { useLocalToast, useRipple, useScrollProgress } from '@/lib/nasaq/interactions';

type Item = {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  note?: string;
};

/**
 * واجهة المتجر العام — تعرض المشروع كما يراه الزائر، مع تفاعل كامل:
 * بحث، تصفية، سلة شراء، عارض صورة، تخطي للأقسام، وتنبيهات فورية.
 */
export default function StorePreview({ slug = '' }: { slug?: string }) {
  const { state, setActiveProject, patchProject } = useNasaq();
  const progress = useScrollProgress();
  const { toasts, push, dismiss } = useLocalToast();

  const project = useMemo(
    () =>
      state.projects.find((p) => p.id === slug) ??
      state.projects.find((p) => p.builder.siteName === slug) ??
      null,
    [state.projects, slug]
  );

  const [cart, setCart] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [lightbox, setLightbox] = useState<Item | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toastItem, setToastItem] = useState<string | null>(null);
  const [sort, setSort] = useState<'default' | 'asc' | 'desc' | 'popular'>('default');
  const [govIndex, setGovIndex] = useState(0);

  const items = useMemo<Item[]>(() => {
    if (!project) return [];
    if (project.menu.length > 0) {
      return project.menu.map((m) => ({
        id: m.id,
        name: m.name,
        price: m.price,
        category: m.category,
        available: m.available,
        note: m.popular ? 'الأكثر طلبًا' : undefined,
      }));
    }
    if (project.products.length > 0) {
      return project.products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        available: p.stock > 0,
        note: p.stock <= (p.minStock ?? 5) ? `بقايا ${p.stock} قطع` : undefined,
      }));
    }
    if (project.services.length > 0) {
      return project.services.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        category: s.duration,
        available: true,
        note: s.description,
      }));
    }
    if (project.properties.length > 0) {
      return project.properties.map((p) => ({
        id: p.id,
        name: p.name,
        price: 0,
        category: p.type,
        available: p.status === 'متاح للعرض',
        note: `${p.price} — ${p.city}`,
      }));
    }
    if (project.digitalItems.length > 0) {
      return project.digitalItems.map((d) => ({
        id: d.id,
        name: d.name,
        price: d.price,
        category: d.type,
        available: d.availableCodes > 0,
        note: d.deliveryStatus,
      }));
    }
    return [];
  }, [project]);

  const visibleItems = useMemo(() => {
    let list = items.filter(
      (i) =>
        (!q || i.name.includes(q) || (i.category ?? '').includes(q)) &&
        (!cat || i.category === cat)
    );
    if (sort === 'asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'popular') list = [...list].sort((a, b) => (b.note ? 1 : 0) - (a.note ? 1 : 0));
    return list;
  }, [items, q, cat, sort]);

  const cartItems = items.filter((i) => cart.includes(i.id));
  const subtotal = cartItems.reduce((s, i) => s + i.price, 0);
  const deliveryFee = IRAQ_GOVERNORATES[govIndex]?.fee ?? 0;
  const cartTotal = subtotal + deliveryFee;

  const addToCart = useCallback(
    (item: Item) => {
      if (!item.available) {
        push('warning', `${item.name} غير متوفر حاليًا`);
        return;
      }
      setCart((c) => (c.includes(item.id) ? c : [...c, item.id]));
      setToastItem(item.id);
      push('success', `أُضيف "${item.name}" إلى السلة`);
      window.setTimeout(() => setToastItem(null), 1800);
    },
    [push]
  );

  function removeFromCart(id: string) {
    setCart((c) => c.filter((x) => x !== id));
    push('info', 'أُزيل العنصر من السلة');
  }

  function checkout() {
    if (cart.length === 0) {
      push('warning', 'السلة فارغة — أضف عنصرًا أولًا');
      return;
    }
    push('success', `تم استلام طلبك بقيمة ${formatPrice(cartTotal, project?.currency ?? 'دينار عراقي (د.ع)')} — الدفع عند الاستلام`);
    setCart([]);
    setCartOpen(false);
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
        <IconStore size={44} className="text-muted nq-float" />
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
  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      {/* شريط تقدّم التمرير */}
      <div className="nq-scroll-rail" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />

      {/* ================= رأس المتجر ================= */}
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="nasaq-container flex h-16 items-center justify-between gap-3">
          <Link href="/" className="brand-logo">
            <span className="brand-mark" style={{ background: project.primaryColor }}>
              {project.builder.logoText.slice(0, 1)}
            </span>
            <span className="font-extrabold">{project.builder.logoText}</span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            {visibleSections.slice(0, 4).map((s) => (
              <a key={s.id} href={`#sec-${s.id}`} className="nav-link">
                {s.title}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LiveDot label={project.siteStatus} tone="success" />
            <span className="badge badge-muted hide-sm">{businessLabel}</span>
            <button
              type="button"
              className="btn btn-outline btn-sm relative"
              onClick={() => setCartOpen((o) => !o)}
              aria-label="السلة"
            >
              <IconBag size={16} />
              <span className="hide-sm">السلة</span>
              {cart.length > 0 && (
                <span className="nq-cart-count" key={cart.length}>
                  {cart.length}
                </span>
              )}
            </button>
            <Link href="/dashboard" className="btn btn-ghost btn-sm hide-sm">
              لوحة التحكم
            </Link>
          </div>
        </div>

        {/* عارض السلة المنسدل */}
        {cartOpen && (
          <div className="nasaq-container pb-3">
            <div className="card !p-4 nq-cart-panel">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold">سلة الشراء ({cart.length})</span>
                <button type="button" className="btn btn-ghost !px-2" onClick={() => setCartOpen(false)} aria-label="إغلاق">
                  <IconX size={16} />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">السلة فارغة.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {cartItems.map((i) => (
                      <div key={i.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{i.name}</p>
                          <p className="text-xs text-muted">{money(i.price)}</p>
                        </div>
                        <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => removeFromCart(i.id)}>
                          إزالة
                        </button>
                      </div>
                    ))}
                  </div>

                  <label className="form-group mt-3">
                    <span className="form-label">محافظة التوصيل</span>
                    <select
                      className="form-control"
                      value={govIndex}
                      onChange={(e) => setGovIndex(Number(e.target.value))}
                    >
                      {IRAQ_GOVERNORATES.map((g: { city: string; fee: number }, i: number) => (
                        <option key={g.city} value={i}>
                          {g.city} — {g.fee === 0 ? 'مجاني' : money(g.fee)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                    <div className="flex justify-between text-muted">
                      <span>المجموع الفرعي</span>
                      <span>{money(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>التوصيل ({IRAQ_GOVERNORATES[govIndex]?.city})</span>
                      <span>{deliveryFee === 0 ? 'مجاني' : money(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold">
                      <span>الإجمالي</span>
                      <span className="text-primary">{money(cartTotal)}</span>
                    </div>
                  </div>

                  <button type="button" className="btn btn-primary btn-sm mt-3 w-full" onClick={checkout}>
                    إتمام الطلب — الدفع عند الاستلام
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ================= الواجهة الرئيسية ================= */}
      <section className="hero-section">
        <div className="nasaq-container hero-grid">
          <Reveal>
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
              <button
                type="button"
                className="btn btn-lg btn-secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  push('success', 'تم نسخ رابط المتجر لمشاركته');
                }}
              >
                مشاركة المتجر
              </button>
            </div>
          </Reveal>

          <div className="hero-composition" aria-label="ملخص المتجر">
            <Reveal delay={120}>
              <div className="mini-ui-card">
                <span className="badge badge-success">تقييم العملاء</span>
                <p className="text-3xl font-extrabold text-primary">4.8</p>
                <div className="nq-stars" aria-hidden="true">★★★★★</div>
                <p className="text-xs text-muted">من 214 تقييمًا لهذا المتجر</p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="mini-ui-card">
                <span className="badge badge-muted">عدد الأصناف</span>
                <p className="text-3xl font-extrabold text-primary">{items.length}</p>
                <p className="text-xs text-muted">
                  {categories.length} قسمًا • {items.filter((i) => i.available).length} متوفر الآن
                </p>
              </div>
            </Reveal>
            <Reveal delay={280} className="mini-ui-card span-2">
              <span className="text-xs text-muted">توصيل لكل المحافظات</span>
              <div className="mt-2 flex flex-wrap gap-1">
                {IRAQ_GOVERNORATES.slice(0, 8).map((g: { city: string; fee: number }) => (
                  <span key={g.city} className="activity-pill">
                    {g.city}
                  </span>
                ))}
                <span className="activity-pill">+ {IRAQ_GOVERNORATES.length - 8} محافظة</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= القائمة ================= */}
      <section id="products" className="section-block">
        <div className="nasaq-container">
          <Reveal>
            <div className="section-header">
              <span className="section-badge" style={{ background: project.primaryColor, color: '#fff' }}>
                {project.menu.length > 0 ? 'المنيو' : project.services.length > 0 ? 'الخدمات' : 'المنتجات'}
              </span>
              <h2 className="section-title">{project.name}</h2>
              <p className="section-desc">{project.description}</p>
            </div>
          </Reveal>

          {/* أدوات البحث والتصفية */}
          <Reveal delay={80}>
            <div className="card mb-5 flex flex-wrap items-end gap-3 !p-4">
              <label className="form-group w-full sm:max-w-xs">
                <span className="form-label">بحث</span>
                <div className="relative">
                  <input
                    className="form-control"
                    placeholder="ابحث باسم الصنف أو القسم..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    aria-label="بحث في المتجر"
                  />
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                    <IconSearch size={16} />
                  </span>
                </div>
              </label>

              <label className="form-group">
                <span className="form-label">القسم</span>
                <select className="form-control" value={cat} onChange={(e) => setCat(e.target.value)}>
                  <option value="">كل الأقسام</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="form-group">
                <span className="form-label">الترتيب</span>
                <select className="form-control" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                  <option value="default">الافتراضي</option>
                  <option value="asc">الأرخص أولًا</option>
                  <option value="desc">الأغلى أولًا</option>
                  <option value="popular">الأكثر تميّزًا</option>
                </select>
              </label>

              <div className="mr-auto flex items-center gap-2">
                <LiveDot label={`${visibleItems.length} عنصر`} tone="primary" />
              </div>
            </div>
          </Reveal>

          {visibleItems.length > 0 ? (
            <StaggerGrid className="grid-3 nq-reveal nq-stagger sm:grid-cols-2 lg:grid-cols-4">
              {visibleItems.map((item) => (
                <TiltCard key={item.id} className="card flex flex-col justify-between" max={5}>
                  <div
                    className="nq-item-art"
                    style={{ background: `linear-gradient(135deg, ${project.primaryColor}1F, ${project.primaryColor}0A)` }}
                  >
                    <div className="nq-item-art-head">
                      <span className="badge badge-muted">{item.category}</span>
                      {item.note && <span className="badge badge-warning">{item.note}</span>}
                    </div>
                    <div className="nq-item-art-foot">
                      <span style={{ color: project.primaryColor }}>{getIcon(project.businessType === 'restaurant' ? 'utensils' : 'bag', { size: 18 })}</span>
                      <span className="text-[11px] font-bold" style={{ color: project.primaryColor }}>{businessLabel}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{item.name}</h3>
                    {item.price > 0 && (
                      <p className="mt-1 text-base font-extrabold" style={{ color: project.primaryColor }}>
                        {money(item.price)}
                      </p>
                    )}
                    {item.price === 0 && (
                      <p className="mt-1 text-sm font-bold text-muted">السعر عند الطلب</p>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    <button
                      type="button"
                      className={`btn btn-sm ${item.available ? 'btn-primary' : 'btn-outline'}`}
                      style={item.available ? { background: project.primaryColor } : undefined}
                      disabled={!item.available}
                      onClick={() => addToCart(item)}
                    >
                      {!item.available ? (
                        'غير متوفر'
                      ) : toastItem === item.id ? (
                        <><IconCheck size={14} /> أُضيف</>
                      ) : (
                        'اطلب الآن'
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setLightbox(item)}
                      aria-label={`تفاصيل ${item.name}`}
                    >
                      التفاصيل
                    </button>
                  </div>
                </TiltCard>
              ))}
            </StaggerGrid>
          ) : (
            <div className="card py-16 text-center">
              <IconSearch size={36} className="mx-auto text-muted" />
              <p className="mt-3 font-bold">لا توجد عناصر مطابقة</p>
              <p className="mt-1 text-sm text-muted">جرّب تعديل كلمة البحث أو اختيار قسم آخر.</p>
              <button
                type="button"
                className="btn btn-outline btn-sm mt-4"
                onClick={() => { setQ(''); setCat(''); }}
              >
                إعادة ضبط البحث
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= أقسام الموقع ================= */}
      {visibleSections.map((s, i) => (
        <Reveal key={s.id} delay={i * 60}>
          <section id={`sec-${s.id}`} className="section-block section-block-alt">
            <div className="nasaq-container nq-reveal max-w-3xl">
              <span className="section-badge">{s.type}</span>
              <h2 className="section-title">{s.title}</h2>
              <p className="section-desc">{s.content}</p>
            </div>
          </section>
        </Reveal>
      ))}

      {/* ================= لماذا نحن ================= */}
      <section className="section-block">
        <div className="nasaq-container">
          <Reveal>
            <div className="section-header">
              <span className="section-badge">لماذا تBuy منّا</span>
              <h2 className="section-title">تجربة شراء مريحة وموثوقة</h2>
            </div>
          </Reveal>
          <StaggerGrid className="grid-3 nq-reveal nq-stagger sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: 'truck', title: 'توصيل لكل العراق', desc: '18 محافظة مع أجور واضحة قبل الطلب.' },
              { icon: 'card', title: 'دفع عند الاستلام', desc: 'تدفع لما يوصلك الطلب لبابك.' },
              { icon: 'check', title: 'جودة مضمونة', desc: 'استبدال مجاني خلال 7 أيام.' },
              { icon: 'sparkle', title: 'دعم سريع', desc: 'فريقنا يرد على استفساراتك في نفس اليوم.' },
            ].map((f) => (
              <div key={f.title} className="card text-center">
                <div className="icon-box mx-auto mb-2">{getIcon(f.icon)}</div>
                <h3 className="text-sm font-bold">{f.title}</h3>
                <p className="mt-1 text-xs text-muted">{f.desc}</p>
              </div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ================= أفضل العناصر ================= */}
      {items.length > 2 && (
        <section className="section-block section-block-alt">
          <div className="nasaq-container">
            <Reveal>
              <div className="section-header">
                <span className="section-badge">الأعلى طلبًا</span>
                <h2 className="section-title">اختيارات العملاء</h2>
              </div>
            </Reveal>
            <div className="grid-2">
              {[...items]
                .sort((a, b) => (b.note ? 1 : 0) - (a.note ? 1 : 0))
                .slice(0, 4)
                .map((item, i) => (
                  <Reveal key={item.id} delay={i * 70}>
                    <div className="card flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="nq-rank">{i + 1}</span>
                        <div>
                          <p className="text-sm font-bold">{item.name}</p>
                          <p className="text-xs text-muted">{item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.price > 0 && <span className="font-extrabold text-primary">{money(item.price)}</span>}
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => addToCart(item)}>
                          أضف
                        </button>
                      </div>
                    </div>
                  </Reveal>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= إحصاءات المتجر ================= */}
      <section className="section-block">
        <div className="nasaq-container">
          <div className="card space-y-4">
            <span className="text-xs text-muted">ملخص المتجر</span>
            <StatBar label="عناصر متوفرة" value={items.filter((i) => i.available).length} max={Math.max(items.length, 1)} suffix={`من ${items.length}`} />
            <StatBar label="أقسام المتجر" value={categories.length} max={Math.max(categories.length, 1)} color="var(--secondary)" />
            <StatBar label="محافظات التوصيل" value={IRAQ_GOVERNORATES.length} max={18} color="var(--success)" />
          </div>
        </div>
      </section>

      {/* ================= شريط التذييل ================= */}
      <footer className="mt-8 border-t border-border bg-surface py-8">
        <div className="nasaq-container text-center text-sm text-muted">
          <p className="font-bold text-text-primary">{project.name}</p>
          <p className="mt-1">{project.city} — الدفع عند الاستلام متاح في كل العراق</p>
          {project.phone && (
            <p className="mt-1" dir="ltr">
              <a href={`tel:${project.phone}`} className="hover:text-primary">{project.phone}</a>
            </p>
          )}
          <p className="mt-3 text-xs">مدعوم بواسطة نَسَق</p>
          <button
            type="button"
            className="btn btn-outline btn-sm mt-4"
            onClick={() => {
              setActiveProject(project.id);
              patchProject({});
              push('info', 'تم تحديث بيانات المشروع النشط');
            }}
          >
            فتح في لوحة التحكم
          </button>
        </div>
      </footer>

      {/* ================= عارض التفاصيل ================= */}
      {lightbox && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-base font-bold">{lightbox.name}</h2>
              <button type="button" className="btn btn-ghost !px-2" onClick={() => setLightbox(null)} aria-label="إغلاق">
                <IconX size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div>
                  <span className="text-xs text-muted">القسم</span>
                  <p className="font-bold">{lightbox.category}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">السعر</span>
                  <p className="font-extrabold text-primary">
                    {lightbox.price > 0 ? money(lightbox.price) : 'السعر عند الطلب'}
                  </p>
                </div>
              </div>
              {lightbox.note && (
                <div>
                  <span className="text-xs text-muted">ملاحظة</span>
                  <p className="text-sm">{lightbox.note}</p>
                </div>
              )}
              <div>
                <span className="text-xs text-muted">التوفر</span>
                <p className="mt-1">
                  {lightbox.available ? (
                    <span className="badge badge-success">متوفر الآن</span>
                  ) : (
                    <span className="badge badge-danger">غير متوفر حاليًا</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted">التوصيل</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {IRAQ_GOVERNORATES.slice(0, 6).map((g: { city: string; fee: number }) => (
                    <span key={g.city} className="badge badge-muted">
                      {g.city} {g.fee === 0 ? '— مجاني' : `— ${money(g.fee)}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setLightbox(null)}>
                إغلاق
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  addToCart(lightbox);
                  setLightbox(null);
                }}
              >
                إضافة إلى السلة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= التنبيهات ================= */}
      <ToastStack toasts={toasts} dismiss={dismiss} />

      {/* ================= زر السلة العائم (الهاتف) ================= */}
      {cart.length > 0 && (
        <button
          type="button"
          className="btn btn-primary fixed bottom-5 left-5 z-40 !h-12 !rounded-full !px-5 shadow-md lg:hidden"
          onClick={() => setCartOpen(true)}
        >
          <IconBag size={18} />
          <span>{money(cartTotal)}</span>
        </button>
      )}
    </div>
  );
}
