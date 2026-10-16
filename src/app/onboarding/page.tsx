'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useNasaq } from '@/lib/nasaq/store';
import {
  BUSINESS_TYPES,
  CURRENCIES,
  FONTS,
  GOALS,
  LANGUAGES,
  WIZARD_STEPS,
  type BusinessTypeId,
} from '@/lib/nasaq/config';
import { BUSINESS_DEFAULT_MODULES, MODULE_REGISTRY, getRecommendedModules, supportsBusinessType } from '@/lib/nasaq/modules';
import type { Project } from '@/lib/nasaq/seed';
import { getIcon } from '@/components/nasaq/icons';
import { IconCheck, IconPlus, IconX } from '@/components/nasaq/icons';

type WizardData = {
  businessType: BusinessTypeId | '';
  name: string;
  city: string;
  phone: string;
  email: string;
  currency: string;
  language: string;
  description: string;
  primaryColor: string;
  goals: string[];
  enabledModules: string[];
  templateId: string;
};

const EMPTY: WizardData = {
  businessType: '',
  name: '',
  city: '',
  phone: '',
  email: '',
  currency: 'ريال سعودي (ر.س)',
  language: 'العربية (RTL)',
  description: '',
  primaryColor: '#5B5CE2',
  goals: [],
  enabledModules: ['dashboard', 'aiAssistant', 'moduleSettings', 'settings'],
  templateId: '',
};

const COLOR_OPTIONS = [
  { v: '#5B5CE2', label: 'بنفسجي (نَسَق)' },
  { v: '#0F766E', label: 'أخضر مائل للتركوازي' },
  { v: '#D97706', label: 'برتقالي دافئ' },
  { v: '#1E293B', label: 'رمادي داكن' },
  { v: '#4F46E5', label: 'أزرق نيلي' },
];

function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.slice(0, 30);
}

export default function OnboardingPage() {
  const { state, addProject, patchPlatform } = useNasaq();
  const [step, setStep] = useState(0);
  const [customModule, setCustomModule] = useState('');
  const [draft, setDraft] = useState<WizardData>(() => {
    // A template can be pre-selected from the landing template picker.
    if (typeof window === 'undefined') return EMPTY;
    try {
      const raw = window.localStorage.getItem('nasaq_pending_template');
      if (!raw) return EMPTY;
      const parsed = JSON.parse(raw) as { businessType?: BusinessTypeId; templateId?: string };
      return {
        ...EMPTY,
        businessType: parsed.businessType ?? '',
        templateId: parsed.templateId ?? '',
      };
    } catch {
      return EMPTY;
    }
  });

  const templatesForType = state.templates.filter(
    (t) => !draft.businessType || t.businessType === draft.businessType
  );
  const allModules = Object.values(MODULE_REGISTRY);
  const recommended = getRecommendedModules(
    draft.businessType || 'store',
    draft.goals,
    GOALS as unknown as { id: string; modules: string[] }[]
  );

  function set(patch: Partial<WizardData>) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  function toggleGoal(id: string) {
    setDraft((d) => ({ ...d, goals: d.goals.includes(id) ? d.goals.filter((g) => g !== id) : [...d.goals, id] }));
  }

  function toggleModule(id: string) {
    setDraft((d) => ({
      ...d,
      enabledModules: d.enabledModules.includes(id)
        ? d.enabledModules.filter((m) => m !== id)
        : [...d.enabledModules, id],
    }));
  }

  function pickBusinessType(id: BusinessTypeId) {
    set({
      businessType: id,
      enabledModules: [...BUSINESS_DEFAULT_MODULES[id]],
    });
  }

  function applyRecommended() {
    set({ enabledModules: [...recommended] });
  }

  function pickTemplate(id: string) {
    set({ templateId: id });
  }

  function addCustomModule() {
    const name = customModule.trim();
    if (!name) return;
    const id = `custom_${Date.now().toString(36)}`;
    setDraft((d) => ({ ...d, enabledModules: [...d.enabledModules, id], customModuleLabel: name } as never));
    setCustomModule('');
  }

  const selectedTemplate = state.templates.find((t) => t.id === draft.templateId);

  function createProject() {
    const bType = draft.businessType || 'store';
    const slug = slugify(draft.name || 'مشروعي');
    const template = selectedTemplate ?? state.templates[0];

    const project: Project = {
      id: `proj_${Date.now().toString(36)}`,
      name: draft.name || 'مشروع جديد',
      description: draft.description || `مشروع ${BUSINESS_TYPES.find((b) => b.id === bType)?.name ?? ''} جديد.`,
      businessType: bType,
      city: draft.city || 'الرياض',
      phone: draft.phone || '+966 5X XXX XXXX',
      email: draft.email || 'you@demo.local',
      currency: draft.currency,
      language: draft.language,
      primaryColor: draft.primaryColor,
      secondaryColor: bType === 'restaurant' ? '#16A34A' : '#16B8A6',
      fontFamily: FONTS[0],
      templateId: template?.id ?? 'tpl_store_modern',
      domain: `${slug || 'new-project'}.demo.local`,
      domainStatus: 'غير مرتبط',
      siteStatus: 'مسودة تجريبية',
      ownerName: 'مالك المشروع',
      createdAt: '2026-10-16',
      enabledModules: draft.enabledModules.filter((m) => m in MODULE_REGISTRY),
      pinnedModules: ['dashboard'],
      builder: {
        siteName: draft.name || 'مشروعي الجديد',
        logoText: draft.name || 'مشروعي الجديد',
        heroTitle: 'نص الترحيب الرئيسي في هذه الصفحة',
        heroSubtitle:
          'يمكنك تعديل العنوان الفرعي والوصف والألوان والقالب بالكامل من محرر الموقع (Website Builder) بعد إنشاء المشروع.',
        sections: [],
      },
      products: [],
      categories: [],
      orders: [],
      customers: [],
      services: [],
      bookings: [],
      menu: [],
      proProjects: [],
      properties: [],
      spareParts: [],
      digitalItems: [],
      employees: [],
      pages: [],
      coupons: [],
      quotes: [],
      invoices: [],
      vehicles: [],
    };

    addProject(project);
    if (typeof window !== 'undefined') window.localStorage.removeItem('nasaq_pending_template');
    window.location.href = '/dashboard';
  }

  const canFinish =
    !!draft.businessType && draft.name.trim().length > 1 && (draft.city.trim().length > 1 || draft.phone.trim().length > 5);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">أنشئ موقع ولوحة تحكم مشروعك في 6 خطوات</h1>
          <p className="mt-1 text-sm text-muted">
            اتبع الخطوات لإنشاء موقع ولوحة تحكم تناسب طبيعة نشاطك التجاري.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/overview" className="btn btn-outline btn-sm">
            لوحة المالك (Demo)
          </Link>
          <Link href="/dashboard" className="btn btn-outline btn-sm">
            تخطي المعالج (تصفح المشاريع التجريبية)
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="card">
          {/* ---------- progress ---------- */}
          <div className="wizard-progress">
            {WIZARD_STEPS.map((label, i) => (
              <div key={label} className={`wizard-step-pill ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                {i < step ? <IconCheck size={14} /> : label}
              </div>
            ))}
          </div>

          {/* ---------- step body ---------- */}
          <div id="wizard-step-body" className="mt-5">
            {step === 0 && (
              <div>
                <h2 className="mb-2 text-lg font-extrabold">{WIZARD_STEPS[0]}</h2>
                <label className="form-label" htmlFor="wiz-activity">النشاط التجاري (حقل نصي حر أوسع من 27 نشاطًا)</label>
                <input
                  id="wiz-activity"
                  className="form-control mb-4"
                  placeholder="اكتب نشاطك التجاري"
                  defaultValue={draft.businessType ? BUSINESS_TYPES.find((b) => b.id === draft.businessType)?.name : ''}
                  onChange={() => undefined}
                />

                <div className="mb-2 text-sm font-bold">أو اختر من الأنواع المدعومة:</div>
                <div className="grid-2">
                  {BUSINESS_TYPES.map((bt) => (
                    <button
                      key={bt.id}
                      type="button"
                      className={`choice-card ${draft.businessType === bt.id ? 'selected' : ''}`}
                      onClick={() => pickBusinessType(bt.id)}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="icon-box">{getIcon(bt.icon)}</span>
                        {draft.businessType === bt.id && <span className="badge badge-success"><IconCheck size={14} /></span>}
                      </div>
                      <h3 className="text-sm font-bold">{bt.name}</h3>
                      <p className="mt-1 text-xs text-muted">{bt.shortDesc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="mb-3 text-lg font-extrabold">{WIZARD_STEPS[1]}</h2>
                <div className="grid-2">
                  <label className="form-group">
                    <span className="form-label">اسم المشروع أو المتجر *</span>
                    <input id="wiz-name" className="form-control" value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="مثال: متجر الرياض الأنيق" />
                  </label>
                  <label className="form-group">
                    <span className="form-label">المدينة</span>
                    <input id="wiz-city" className="form-control" value={draft.city} onChange={(e) => set({ city: e.target.value })} placeholder="الرياض" />
                  </label>
                  <label className="form-group">
                    <span className="form-label">رقم التواصل</span>
                    <input id="wiz-phone" className="form-control" value={draft.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="05XXXXXXXX" />
                  </label>
                  <label className="form-group">
                    <span className="form-label">البريد الإلكتروني التجريبي</span>
                    <input id="wiz-email" className="form-control" value={draft.email} onChange={(e) => set({ email: e.target.value })} placeholder="owner@demo.local" />
                  </label>
                  <label className="form-group">
                    <span className="form-label">العملة</span>
                    <select id="wiz-currency" className="form-control" value={draft.currency} onChange={(e) => set({ currency: e.target.value })}>
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="form-group">
                    <span className="form-label">لغة الواجهة</span>
                    <select id="wiz-lang" className="form-control" value={draft.language} onChange={(e) => set({ language: e.target.value })}>
                      {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </label>
                </div>
                <label className="form-group mt-3 block">
                  <span className="form-label">وصف مختصر للمشروع</span>
                  <textarea id="wiz-desc" className="form-control" rows={3} value={draft.description} onChange={(e) => set({ description: e.target.value })} placeholder="اكتب وصفًا تجريبيًا لنشاطك..." />
                </label>
                <div className="mt-3 grid-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.v}
                      type="button"
                      className={`btn btn-sm ${draft.primaryColor === c.v ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => set({ primaryColor: c.v })}
                    >
                      <span style={{ width: 12, height: 12, borderRadius: 99, background: c.v, display: 'inline-block' }} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="mb-2 text-lg font-extrabold">{WIZARD_STEPS[2]}</h2>
                <p className="mb-3 text-sm text-muted">حدد أهدافك الأساسية ليقترح محرك الوحدات الأقسام المناسبة تلقائيًا.</p>
                <div className="grid-2">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={`choice-card ${draft.goals.includes(g.id) ? 'selected' : ''}`}
                      onClick={() => toggleGoal(g.id)}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="text-sm font-bold">{g.name}</h3>
                        {draft.goals.includes(g.id) && <span className="badge badge-success"><IconCheck size={14} /></span>}
                      </div>
                      <p className="text-xs text-muted">يضيف الوحدات: {g.modules.map((m) => MODULE_REGISTRY[m]?.name ?? m).join(' • ')}</p>
                    </button>
                  ))}
                </div>
                <div className="card mt-3 flex flex-wrap items-center justify-between gap-2" style={{ background: 'var(--muted-surface)' }}>
                  <span className="text-xs text-muted">لنبدأ من المتوقع ثم عدّل بنفسك في الخطوة التالية:</span>
                  <button type="button" className="btn btn-sm btn-outline" onClick={applyRecommended}>تطبيق الاقتراح الذكي</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="mb-2 text-lg font-extrabold">{WIZARD_STEPS[3]}</h2>
                <p className="mb-3 text-sm text-muted">
                  فعّل فقط الأقسام التي تحتاجها في لوحة التحكم لحماية خصوصية بياناتك وتبسيط العمل اليومي:
                </p>
                <div id="wiz-modules-grid" className="grid-3">
                  {allModules.map((mod) => {
                    const supported = supportsBusinessType(mod, draft.businessType || 'store');
                    const enabled = draft.enabledModules.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        className={`card cursor-pointer p-3 transition ${enabled ? 'border-primary' : ''}`}
                        onClick={() => toggleModule(mod.id)}
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xl">{getIcon(mod.icon)}</span>
                          <span className={enabled ? 'badge badge-primary' : 'badge badge-muted'}>
                            {enabled ? 'مُفعّل' : 'غير مفعل'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold">{mod.name}</h3>
                        <p className="mt-1 text-xs text-muted">{mod.description.slice(0, 70)}...</p>
                        <p className="mt-1 text-xs text-muted">الأنشطة المدعومة: {mod.supportedBusinessTypes.join(' • ')}</p>
                        {!supported && <span className="badge badge-warning mt-1">غير موصى به لهذا النشاط</span>}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {mod.availableInPlans.map((p) => <span key={p} className="badge badge-muted">{p}</span>)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="card mt-3 flex flex-wrap items-end gap-2">
                  <label className="form-group" style={{ flex: 1, minWidth: 200 }}>
                    <span className="form-label">
                      لم تجد وحدة تبحث عنها؟ أنشئ وحدة مخصصة (تجريبي) وتعتمد على نشاطك:
                    </span>
                    <input
                      id="wiz-custom-module"
                      className="form-control"
                      value={customModule}
                      onChange={(e) => setCustomModule(e.target.value)}
                      placeholder="مثال: صيانة المصاعد"
                    />
                  </label>
                  <button type="button" className="btn btn-sm btn-primary" onClick={addCustomModule}>
                    <IconPlus size={14} /> إضافة الوحدة
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="mb-3 text-lg font-extrabold">{WIZARD_STEPS[4]}</h2>
                <div className="grid-3">
                  {templatesForType.map((tpl) => (
                    <button key={tpl.id} type="button" className={`choice-card ${draft.templateId === tpl.id ? 'selected' : ''}`} onClick={() => pickTemplate(tpl.id)} style={{ padding: 0, overflow: 'hidden' }}>
                      <div className="relative" style={{ height: 120, background: `linear-gradient(135deg, ${tpl.accent}24, ${tpl.accent}08)` }}>
                        <span className="badge absolute" style={{ top: 8, right: 8, background: tpl.accent, color: '#fff' }}>{tpl.businessLabel}</span>
                        <div className="absolute" style={{ bottom: 12, right: 12, left: 12 }}>
                          <div style={{ height: 10, width: '80%', background: tpl.accent, borderRadius: 5, marginBottom: 6, opacity: 0.8 }} />
                          <div style={{ height: 6, width: '55%', background: tpl.accent, borderRadius: 3, opacity: 0.4 }} />
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-bold">{tpl.name}</h3>
                        <p className="mt-1 text-xs text-muted">{tpl.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="mt-2" id="wizard-footr">
                <h2 className="mb-3 text-lg font-extrabold">{WIZARD_STEPS[5]}</h2>
                <div className="grid-2">
                  <div className="card" style={{ background: 'var(--muted-surface)' }}>
                    <h3 className="mb-2 text-sm font-bold">موقعك الإلكتروني (معاينة حية)</h3>
                    <div className="rounded-lg border border-border p-3" style={{ background: 'linear-gradient(180deg, #F8FAFC, #FFFFFF)' }}>
                      <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
                        <span className="text-base font-extrabold" style={{ color: draft.primaryColor }}>{draft.name || 'موقعك الجديد'}</span>
                        <span className="badge badge-muted">تجريبي محلي</span>
                      </div>
                      <h4 className="mb-1 text-sm" style={{ color: draft.primaryColor }}>
                        مرحبًا بك في {draft.name || 'مشروعك الجديد'}!
                      </h4>
                      <p className="text-xs text-muted">ثنائي النشاط: {BUSINESS_TYPES.find((b) => b.id === draft.businessType)?.name ?? 'غير محدد'}</p>
                      <p className="mt-2 text-xs text-muted">الجملة الترويجية أو عرض القيمة هنا...</p>
                      <button type="button" className="btn btn-sm mt-2" style={{ background: draft.primaryColor, color: '#fff' }}>اتخاذ إجراء!</button>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="mb-2 text-sm font-bold">ملخص مشروعك ولوحة التحكم المخصصة</h3>
                    <ul className="space-y-2 text-sm">
                      <li><span className="text-muted">اسم المشروع:</span> <strong>{draft.name || '—'}</strong></li>
                      <li><span className="text-muted">نوع النشاط:</span> <strong>{BUSINESS_TYPES.find((b) => b.id === draft.businessType)?.name ?? '—'}</strong></li>
                      <li><span className="text-muted">المدينة:</span> <strong>{draft.city || '—'}</strong></li>
                      <li><span className="text-muted">الأهداف:</span> <strong>{draft.goals.map((g) => GOALS.find((x) => x.id === g)?.name).filter(Boolean).join(' • ') || '—'}</strong></li>
                      <li><span className="text-muted">القالب:</span> <strong>{selectedTemplate?.name ?? '—'}</strong></li>
                      <li><span className="text-muted">اللون:</span> <strong style={{ color: draft.primaryColor }}>{draft.primaryColor}</strong></li>
                      <li><span className="text-muted">وحدات لوحة التحكم:</span> <strong>{draft.enabledModules.length}</strong></li>
                      <li><span className="text-muted">العملة:</span> <strong>{draft.currency}</strong></li>
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {draft.enabledModules.map((m) => (
                        <span key={m} className="badge badge-primary">{MODULE_REGISTRY[m]?.name ?? m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ---------- footer nav ---------- */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <button type="button" className="btn btn-outline btn-sm" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                الخطوة السابقة
              </button>
              {step < WIZARD_STEPS.length - 1 ? (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setStep((s) => Math.min(WIZARD_STEPS.length - 1, s + 1))}>
                  الخطوة التالية ←
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={!canFinish}
                  onClick={createProject}
                  title={canFinish ? '' : 'اختر نوع النشاط وأدخل اسم المشروع ومدينته على الأقل'}
                >
                  ابدأ الآن — أنشئ المشروع واللوحة الذكية
                </button>
              )}
            </div>
            <span className="text-xs text-muted">{step + 1} / {WIZARD_STEPS.length}</span>
          </div>
        </div>

        {/* ---------- live sidebar ---------- */}
        <aside className="card h-fit p-4 lg:sticky lg:top-6">
          <h3 className="mb-2 text-sm font-bold">نظرة سريعة</h3>
          <ul className="space-y-2 text-xs text-muted">
            <li>النشاط: <strong className="text-primary">{BUSINESS_TYPES.find((b) => b.id === draft.businessType)?.name ?? 'لم يُحدد بعد'}</strong></li>
            <li>الاسم: <strong className="text-text-primary">{draft.name || '—'}</strong></li>
            <li>المدينة: <strong className="text-text-primary">{draft.city || '—'}</strong></li>
            <li>القالب: <strong className="text-text-primary">{selectedTemplate?.name ?? '—'}</strong></li>
            <li>الوحدات: <strong className="text-text-primary">{draft.enabledModules.length}</strong></li>
          </ul>
          <p className="mt-3 text-xs text-muted">
            يمكنك تعديل كل هذه الخيارات لاحقًا من الإعدادات وتخصيص الوحدات.
          </p>
          <div className="mt-4 space-y-1">
            <span className="badge badge-success"><IconCheck size={12} /> تجربة محلية بدون خادم</span>
          </div>
          <button
            type="button"
            className="btn btn-danger-outline btn-sm mt-3 w-full"
            onClick={() => {
              if (window.confirm('سيتم إعادة تعيين بيانات هذا النموذج التجريبي إلى الحالة الافتراضية. متابعة؟')) {
                window.localStorage.removeItem('nasaq_state_v1');
                window.location.href = '/';
              }
            }}
          >
            إعادة تعيين (Reset)
          </button>
        </aside>
      </div>
    </div>
  );
}
