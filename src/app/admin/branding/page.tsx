'use client';

import { useNasaq } from '@/lib/nasaq/store';
import { AdminHeader } from '@/components/nasaq/admin-shell';
import { Field } from '@/components/nasaq/ui';
import { IconCheck } from '@/components/nasaq/icons';

export default function AdminBrandingPage() {
 const { state, setPlatformSettings } = useNasaq();

 return (
  <>
   <AdminHeader
    title="الهوية والإعدادات العامة"
    subtitle="اسم المنصة واللون الافتراضي، بريد الدعم، العملة الافتراضية، ووضع الصيانة."
   />

   <div className="card" style={{ background: 'var(--muted-surface)' }}>
    <div className="flex flex-wrap items-center gap-4">
     <span
      className="brand-mark"
      style={{ background: state.platformSettings.primaryColor, width: 48, height: 48, fontSize: 22 }}
     >
      {state.platformSettings.brandShort}
     </span>
     <div>
      <h2 className="text-lg font-extrabold">{state.platformSettings.brandName}</h2>
      <p className="text-xs text-muted">معاينة الهوية الحالية في الشريط العلوي والقوالب الجديدة</p>
     </div>
    </div>
   </div>

   <div className="grid-2 lg:grid-cols-3">
    <div className="card lg:col-span-2">
     <h2 className="mb-3 text-base font-extrabold">إعدادات المنصة</h2>
     <div className="grid-2 nq-reveal nq-stagger">
      <Field label="اسم المنصة (يظهر في العلامة التجارية)">
       <input id="adm-pf-brand" className="form-control" value={state.platformSettings.brandName} onChange={(e) => setPlatformSettings({ brandName: e.target.value })} />
      </Field>
      <Field label="الاسم المختصر (حرف واحد)">
       <input id="adm-pf-short" className="form-control" maxLength={2} value={state.platformSettings.brandShort} onChange={(e) => setPlatformSettings({ brandShort: e.target.value.slice(0, 2) })} />
      </Field>
      <Field label="بريد الدعم">
       <input id="adm-pf-email" className="form-control" dir="ltr" value={state.platformSettings.supportEmail} onChange={(e) => setPlatformSettings({ supportEmail: e.target.value })} />
      </Field>
      <Field label="العملة الافتراضية">
       <input className="form-control" value={state.platformSettings.defaultCurrency} onChange={(e) => setPlatformSettings({ defaultCurrency: e.target.value })} />
      </Field>
     </div>

     <div className="mt-3">
      <span className="form-label">اللون الأساسي للمنصة</span>
      <div className="mt-1 flex flex-wrap gap-2">
       {['#5B5CE2', '#0F766E', '#D97706', '#1E293B', '#4F46E5', '#16A34A'].map((c) => (
        <button
         key={c}
         type="button"
         aria-label={`اللون ${c}`}
         className={`btn !h-9 !w-9 !p-0 ${state.platformSettings.primaryColor === c ? 'ring-2 ring-primary' : ''}`}
         style={{ background: c }}
         onClick={() => setPlatformSettings({ primaryColor: c })}
        >
         {state.platformSettings.primaryColor === c && <IconCheck size={16} />}
        </button>
       ))}
      </div>
      <p className="mt-2 text-xs text-muted" dir="ltr">{state.platformSettings.primaryColor}</p>
     </div>

     <div className="mt-4 flex items-center gap-3 rounded-md border border-border p-3">
      <label className="flex items-center gap-2 text-sm">
       <input
        id="adm-pf-color"
        type="checkbox"
        checked={state.platformSettings.maintenanceMode}
        onChange={(e) => setPlatformSettings({ maintenanceMode: e.target.checked })}
       />
       تفعيل وضع الصيانة 
      </label>
      <span className={`badge ${state.platformSettings.maintenanceMode ? 'badge-danger' : 'badge-success'}`}>
       {state.platformSettings.maintenanceMode ? 'الصيانة مفعّلة' : 'المنصة تعمل'}
      </span>
     </div>
    </div>

    <div className="card">
     <h2 className="mb-3 text-base font-extrabold">إحصاءات المنصة </h2>
     <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between"><span className="text-muted">عدد المشتركين</span><span className="font-bold">{state.subscribers.length}</span></div>
      <div className="flex items-center justify-between"><span className="text-muted">عدد المشاريع</span><span className="font-bold">{state.projects.length}</span></div>
      <div className="flex items-center justify-between"><span className="text-muted">عدد الباقات</span><span className="font-bold">{state.plans.length}</span></div>
      <div className="flex items-center justify-between"><span className="text-muted">القوالب</span><span className="font-bold">{state.templates.length}</span></div>
      <div className="flex items-center justify-between"><span className="text-muted">مزودو AI</span><span className="font-bold">{state.aiProviders.length}</span></div>
     </div>
    </div>
   </div>
  </>
 );
}
