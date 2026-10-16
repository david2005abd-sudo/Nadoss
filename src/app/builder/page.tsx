'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNasaq } from '@/lib/nasaq/store';
import { getIcon, IconPlus, IconX } from '@/components/nasaq/icons';

const SECTION_TYPES = ['Hero', 'Products', 'Menu', 'Services', 'Portfolio', 'Properties', 'About', 'Testimonials', 'FAQ', 'Contact', 'Footer'] as const;

export default function BuilderPage() {
  const { project, patchProject } = useNasaq();
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [newSection, setNewSection] = useState<string>('About');

  if (!project) {
    return (
      <div className="card text-center">
        <h1 className="mb-2 text-lg font-extrabold">لا يوجد مشروع مفعل</h1>
        <p className="mb-4 text-sm text-muted">اختر مشروعًا من الشريط العلوي أو أنشئ مشروعًا جديدًا لتعديل موقعه.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/onboarding" className="btn btn-primary btn-sm">أنشئ مشروعًا</Link>
          <Link href="/" className="btn btn-outline btn-sm">الرئيسية</Link>
        </div>
      </div>
    );
  }

  const b = project.builder;
  const patchBuilder = (patch: Partial<typeof b>) => patchProject({ builder: { ...b, ...patch } });

  function addSection() {
    const type = newSection as (typeof SECTION_TYPES)[number];
    patchBuilder({
      sections: [...b.sections, { id: `sec_${Date.now().toString(36)}`, type, title: `قسم ${type} جديد`, content: `محتوى القسم التجريبي — عدّله هنا ليظهر للزوار على موقعك.`, visible: true }],
    });
  }

  function removeSection(id: string) {
    patchBuilder({ sections: b.sections.filter((s) => s.id !== id) });
  }

  function move(id: string, dir: -1 | 1) {
    const idx = b.sections.findIndex((s) => s.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= b.sections.length) return;
    const next = [...b.sections];
    [next[idx], next[target]] = [next[target], next[idx]];
    patchBuilder({ sections: next });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <nav className="breadcrumbs" aria-label="مسار التنقل">
            <span>{project.name}</span>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-text-primary">محرر الموقع</span>
          </nav>
          <h1 className="text-xl font-extrabold sm:text-2xl">محرر الموقع التفاعلي (تجريبي)</h1>
          <p className="mt-1 text-sm text-muted">عدّل اسم الموقع والنصوص والأقسام وقارن بين المعاينة على الحاسوب والهاتف.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="btn btn-outline btn-sm">رجوع للوحة</Link>
        </div>
      </div>

      <div className="builder-layout">
        {/* ================= CONTROLS ================= */}
        <aside id="builder-controls-panel" className="builder-controls">
          <div>
            <span className="text-xs font-bold text-muted">المشروع</span>
            <h2 className="mt-1 text-base font-extrabold" id="builder-project-title">{b.siteName || project.name}</h2>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="bld-sitename">اسم الموقع</label>
            <input id="bld-sitename" className="form-control" value={b.siteName} onChange={(e) => patchBuilder({ siteName: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="bld-logo">شعار / اسم العرض</label>
            <input id="bld-logo" className="form-control" value={b.logoText} onChange={(e) => patchBuilder({ logoText: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="bld-hero-title">العنوان الرئيسي (Hero Title)</label>
            <textarea id="bld-hero-title" className="form-control" rows={2} value={b.heroTitle} onChange={(e) => patchBuilder({ heroTitle: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="bld-hero-sub">العنوان الفرعي (Hero Subtitle)</label>
            <textarea id="bld-hero-sub" className="form-control" rows={3} value={b.heroSubtitle} onChange={(e) => patchBuilder({ heroSubtitle: e.target.value })} />
          </div>

          <div>
            <span className="text-xs font-bold text-muted">أقسام الصفحة ({b.sections.length})</span>
            <div className="mt-2 space-y-2">
              {b.sections.map((s, i) => (
                <div key={s.id} className="rounded-md border border-border p-2">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${s.visible ? 'badge-success' : 'badge-muted'}`}>{s.visible ? 'ظاهر' : 'مخفي'}</span>
                    <span className="badge badge-primary">{s.type}</span>
                    <div className="mr-auto flex gap-1">
                      <button type="button" className="btn btn-outline btn-sm !px-2" onClick={() => move(s.id, -1)} aria-label="أعلى">↑</button>
                      <button type="button" className="btn btn-outline btn-sm !px-2" onClick={() => move(s.id, 1)} aria-label="أسفل">↓</button>
                      <button type="button" className="btn btn-outline btn-sm !px-2" onClick={() => patchBuilder({ sections: b.sections.map((x) => (x.id === s.id ? { ...x, visible: !x.visible } : x)) })}>
                        {s.visible ? 'إخفاء' : 'إظهار'}
                      </button>
                      <button type="button" className="btn btn-danger-outline btn-sm !px-2" onClick={() => removeSection(s.id)} aria-label="حذف">
                        <IconX size={14} />
                      </button>
                    </div>
                  </div>
                  <input
                    className="form-control mt-2 !py-1"
                    value={s.title}
                    onChange={(e) => patchBuilder({ sections: b.sections.map((x) => (x.id === s.id ? { ...x, title: e.target.value } : x)) })}
                    aria-label={`عنوان قسم ${s.type}`}
                  />
                  <textarea
                    className="form-control mt-1 !py-1"
                    rows={2}
                    value={s.content}
                    onChange={(e) => patchBuilder({ sections: b.sections.map((x) => (x.id === s.id ? { ...x, content: e.target.value } : x)) })}
                    aria-label={`محتوى قسم ${s.type}`}
                  />
                  <span className="mt-1 block text-[11px] text-muted">الترتيب: {i + 1}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
                <label className="form-label" htmlFor="bld-new-sec-type">نوع القسم الجديد</label>
                <select id="bld-new-sec-type" className="form-control" value={newSection} onChange={(e) => setNewSection(e.target.value)}>
                  {SECTION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <button type="button" className="btn btn-primary btn-sm" onClick={addSection}>
                <IconPlus size={16} /> إضافة قسم
              </button>
            </div>
          </div>

          <p className="text-xs text-muted">
            ملاحظة: هذه معاينة تجريبية داخلية. عند الربط بالخادم يمكنك تغيير القالب لاختيار قالب آخر من نفس نشاطك.
          </p>
        </aside>

        {/* ================= CANVAS ================= */}
        <section className="builder-canvas-wrap">
          <div className="mb-3 flex items-center justify-between">
            <span className="badge badge-primary">معاينة حية</span>
            <div className="flex gap-1">
              <button type="button" id="btn-viewport-desktop" className={`btn btn-sm ${viewport === 'desktop' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setViewport('desktop')}>سطح المكتب</button>
              <button type="button" id="btn-viewport-mobile" className={`btn btn-sm ${viewport === 'mobile' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setViewport('mobile')}>الهاتف</button>
            </div>
          </div>

          <div
            id="builder-preview-frame"
            className={`builder-preview-frame ${viewport === 'mobile' ? 'mobile-frame' : ''}`}
            style={{ minHeight: 520 }}
          >
            {/* preview mockup */}
            <div style={{ background: '#fff', minHeight: 520 }}>
              <div className="flex items-center justify-between border-b border-border px-4 py-3" style={{ background: project.primaryColor }}>
                <span className="font-extrabold text-white">{b.logoText}</span>
                <span className="text-xs text-white/80">{project.city}</span>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-extrabold" style={{ color: project.primaryColor }}>{b.heroTitle}</h3>
                <p className="mt-1 text-sm text-muted">{b.heroSubtitle}</p>

                <div className="mt-4 space-y-3">
                  {b.sections.filter((s) => s.visible).map((s) => (
                    <div key={s.id} className="rounded-md border border-dashed border-border p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="badge badge-primary">{s.type}</span>
                        <h4 className="text-sm font-bold">{s.title}</h4>
                      </div>
                      <p className="text-xs text-muted">{s.content}</p>
                    </div>
                  ))}
                </div>

                {b.sections.filter((s) => s.visible).length === 0 && (
                  <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted">
                    لا توجد أقسام ظاهرة — أضف قسمًا من لوحة التحكم.
                  </div>
                )}

                <div className="mt-5 border-t border-border pt-3 text-center text-xs text-muted">
                  {b.siteName || project.name} — مدعوم بواسطة نَسَق (تجريبي)
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export { getIcon };
