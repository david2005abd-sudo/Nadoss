'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { Field } from '@/components/nasaq/ui';
import { useNasaq } from '@/lib/nasaq/store';
import { IconCheck } from '@/components/nasaq/icons';

const TABS = [
 { id: 'project', label: 'إعدادات المشروع' },
 { id: 'user', label: 'المستخدم والواجهة' },
 { id: 'privacy', label: 'الخصوصية وبيانات المشروع' },
] as const;

const COLOR_SWATCHES = ['#5B5CE2', '#0F766E', '#D97706', '#1E293B', '#4F46E5', '#16A34A'];

export default function SettingsPage() {
 const { setUserSettings } = useNasaq();
 const [tab, setTab] = useState<string>('project');

 function patchUser(patch: Parameters<typeof setUserSettings>[0]) {
  setUserSettings(patch);
 }

 return (
  <DashboardModule title="الإعدادات" subtitle="إعدادات المشروع، المستخدم، المنصة، والخصوصية.">
   {({ project, patch, state }) => {
    return (
     <div id="settings-tab-content" className="space-y-5 nq-reveal">
      {/* ---------- Tabs ---------- */}
      <div className="flex flex-wrap gap-2">
       {TABS.map((t) => (
        <button
         key={t.id}
         type="button"
         className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-outline'}`}
         onClick={() => setTab(t.id)}
        >
         {t.label}
        </button>
       ))}
      </div>

      {/* ---------- Project settings ---------- */}
      {tab === 'project' && (
       <div className="grid-2 lg:grid-cols-3">
        <div className="card lg:col-span-2">
         <h2 className="mb-3 text-base font-extrabold">بيانات المشروع الأساسية</h2>
         <div className="grid-2 nq-reveal nq-stagger">
          <Field label="اسم المشروع أو المتجر">
           <input id="set-proj-name" className="form-control" value={project.name} onChange={(e) => patch({ name: e.target.value })} />
          </Field>
          <Field label="المدينة">
           <input id="set-proj-city" className="form-control" value={project.city} onChange={(e) => patch({ city: e.target.value })} />
          </Field>
          <Field label="رقم التواصل">
           <input id="set-proj-phone" className="form-control" dir="ltr" value={project.phone} onChange={(e) => patch({ phone: e.target.value })} />
          </Field>
          <Field label="البريد الإلكتروني">
           <input id="set-pf-email" className="form-control" dir="ltr" value={project.email} onChange={(e) => patch({ email: e.target.value })} />
          </Field>
          <Field label="العملة">
           <input id="set-proj-curr" className="form-control" value={project.currency} onChange={(e) => patch({ currency: e.target.value })} />
          </Field>
          <Field label="لغة الواجهة">
           <input className="form-control" value={project.language} onChange={(e) => patch({ language: e.target.value })} />
          </Field>
         </div>
         <Field label="الوصف">
          <textarea id="set-proj-desc" className="form-control" rows={3} value={project.description} onChange={(e) => patch({ description: e.target.value })} />
         </Field>
        </div>

        <div className="card">
         <h2 className="mb-3 text-base font-extrabold">الهوية واللغة</h2>
         <Field label="اللون الأساسي">
          <div className="mt-1 flex flex-wrap gap-2">
           {COLOR_SWATCHES.map((c) => (
            <button
             key={c}
             type="button"
             aria-label={`اللون ${c}`}
             className={`btn !h-9 !w-9 !p-0 ${project.primaryColor === c ? 'ring-2 ring-primary' : ''}`}
             style={{ background: c }}
             onClick={() => patch({ primaryColor: c })}
            >
             {project.primaryColor === c && <IconCheck size={16} />}
            </button>
           ))}
          </div>
         </Field>

         <div className="mt-3">
          <Field label="اللون الثانوي">
           <div className="mt-1 flex flex-wrap gap-2">
            {['#16B8A6', '#16A34A', '#D97706', '#DC2626'].map((c) => (
             <button
              key={c}
              type="button"
              aria-label={`اللون الثانوي ${c}`}
              className={`btn !h-9 !w-9 !p-0 ${project.secondaryColor === c ? 'ring-2 ring-primary' : ''}`}
              style={{ background: c }}
              onClick={() => patch({ secondaryColor: c })}
             />
            ))}
           </div>
          </Field>
         </div>

         <div className="mt-3">
          <Field label="الخط العربي">
           <select id="set-proj-color" className="form-control" value={project.fontFamily} onChange={(e) => patch({ fontFamily: e.target.value })}>
            {['Tajawal', 'Almarai', 'Arial / System'].map((f) => <option key={f} value={f}>{f}</option>)}
           </select>
          </Field>
         </div>

         <div className="mt-4 rounded-md border border-border p-3" style={{ background: 'var(--muted-surface)' }}>
          <span className="text-xs text-muted">الحالة التقنية</span>
          <p className="mt-1 text-sm font-bold">{project.siteStatus}</p>
          <p className="mt-1 text-xs text-muted" dir="ltr">{project.domain}</p>
          <span className="badge badge-muted mt-2">{project.domainStatus}</span>
          <Link
            href={`/store/${project.id}`}
            className="btn btn-outline btn-sm mt-3 w-full"
            target="_blank"
            rel="noreferrer"
          >
            معاينة المتجر العام ←
          </Link>
         </div>
        </div>
       </div>
      )}

      {/* ---------- User settings ---------- */}
      {tab === 'user' && (
       <div className="grid-2 lg:grid-cols-3">
        <div className="card lg:col-span-2">
         <h2 className="mb-3 text-base font-extrabold">المستخدم والواجهة</h2>
         <div className="grid-2 nq-reveal nq-stagger">
          <Field label="اسم المالك / المستخدم">
           <input id="set-user-name" className="form-control" value={state.userSettings.name} onChange={(e) => patchUser({ name: e.target.value })} />
          </Field>
          <Field label="البريد الإلكتروني">
           <input id="set-pf-short" className="form-control" dir="ltr" value={state.userSettings.email} onChange={(e) => patchUser({ email: e.target.value })} />
          </Field>
         </div>

         <div className="mt-3 grid-2">
          <Field label="كثافة العناصر (spacing)">
           <select id="set-user-density" className="form-control" value={state.userSettings.density} onChange={(e) => patchUser({ density: e.target.value })}>
            {['normal', 'compact', 'spacious'].map((d) => <option key={d} value={d}>{d === 'normal' ? 'عادي' : d === 'compact' ? 'مضغوط' : 'واسع'}</option>)}
           </select>
          </Field>
          <Field label="حجم الخط">
           <select id="set-user-fontsize" className="form-control" value={state.userSettings.fontSize} onChange={(e) => patchUser({ fontSize: e.target.value })}>
            {['normal', 'small', 'large'].map((f) => <option key={f} value={f}>{f === 'normal' ? 'عادي' : f === 'small' ? 'صغير' : 'كبير'}</option>)}
           </select>
          </Field>
         </div>

         <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2 text-sm">
           <input type="checkbox" checked={state.userSettings.emailAlerts} onChange={(e) => patchUser({ emailAlerts: e.target.checked })} />
           تفعيل تنبيهات البريد الإلكتروني للطلبات الجديدة
          </label>
          <label className="flex items-center gap-2 text-sm">
           <input type="checkbox" checked={state.userSettings.stockAlerts} onChange={(e) => patchUser({ stockAlerts: e.target.checked })} />
           تفعيل تنبيهات انخفاض المخزون
          </label>
         </div>
        </div>

        <div className="card">
         <h2 className="mb-3 text-base font-extrabold">المنصة </h2>
         <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
           <span className="text-muted">اسم المنصة</span>
           <span className="font-bold">{state.platformSettings.brandName}</span>
          </div>
          <div className="flex items-center justify-between">
           <span className="text-muted">البريد الدعم</span>
           <span dir="ltr" className="font-bold">{state.platformSettings.supportEmail}</span>
          </div>
          <div className="flex items-center justify-between">
           <span className="text-muted">العملة الافتراضية</span>
           <span className="font-bold">{state.platformSettings.defaultCurrency}</span>
          </div>
          <div className="flex items-center justify-between">
           <span className="text-muted">وضع الصيانة</span>
           <span className={`badge ${state.platformSettings.maintenanceMode ? 'badge-danger' : 'badge-success'}`}>
            {state.platformSettings.maintenanceMode ? 'مفعّل' : 'معطّل'}
           </span>
          </div>
         </div>
         <Link className="btn btn-outline btn-sm mt-4 w-full" href="/admin/overview">
          فتح لوحة المالك لإدارة المنصة
         </Link>
        </div>
       </div>
      )}

      {/* ---------- Privacy ---------- */}
      {tab === 'privacy' && (
       <div className="grid-2 lg:grid-cols-3">
        <div className="card lg:col-span-2">
         <h2 className="mb-3 text-base font-extrabold">الخصوصية وبيانات المشروع</h2>
         <p className="text-sm text-muted">
          تعمل المنصة بالكامل داخل متصفحك. تُحفظ بيانات المشاريع والعملاء والطلبات في
          <span className="font-mono"> localStorage </span>
          تحت المفتاح التالي، ولا تُرسل إلى أي خادم خارجي:
         </p>
         <p className="mt-2 rounded-md border border-border p-2 font-mono text-xs" dir="ltr">nasaq_state_v1</p>

         <h3 className="mt-4 text-sm font-bold">ما يتم حفظه </h3>
         <ul className="mt-2 space-y-1 text-sm">
          <li>✓ بيانات المشاريع والمتاجر الثلاثة المرفقة</li>
          <li>✓ المنتجات والوجبات والخدمات والطلبات والحجوزات</li>
          <li>✓ العملاء والموظفين وعروض الأسعار والفواتير</li>
          <li>✓ تفضيلات المستخدم واللون وحجم الخط</li>
          <li>× لم نحفظ أي بيانات دفع حقيقية أو مفاتيح سرية</li>
         </ul>

         <div className="mt-5 flex flex-wrap gap-2">
          <button
           type="button"
           className="btn btn-primary btn-sm"
           onClick={() => {
            const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'nasaq-project-export.json';
            a.click();
            URL.revokeObjectURL(url);
           }}
          >
           تصدير بيانات المشروع (JSON)
          </button>
          <button
           type="button"
           className="btn btn-danger-outline btn-sm"
           onClick={() => {
            if (window.confirm('سيتم حذف جميع بيانات مشاريعك والعودة للحالة الافتراضية. متابعة؟')) {
             window.localStorage.removeItem('nasaq_state_v1');
             window.location.href = '/dashboard';
            }
           }}
          >
           إعادة تعيين بيانات المشروع (Reset)
          </button>
         </div>
        </div>

        <div className="card">
         <h2 className="mb-3 text-base font-extrabold">إخلاء مسؤولية</h2>
         <p className="text-sm text-muted">
          الأسعار والباقات والعملاء والطلبات الظاهرة في هذه المنصة هي بيانات لأغراض العرض فقط،
          وغير مرتبطة بأي عملية دفع أو اشتراك حقيقية.
         </p>
         <div className="mt-4">
          <span className="badge badge-success">بيانات محفوظة بأمان فقط</span>
         </div>
        </div>
       </div>
      )}
     </div>
    );
   }}
  </DashboardModule>
 );
}
