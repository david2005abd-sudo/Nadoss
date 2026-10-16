'use client';

import { DashboardModule } from '@/components/nasaq/dashboard-page';
import { getIcon } from '@/components/nasaq/icons';
import { BUSINESS_DEFAULT_MODULES, CORE_MODULES, MODULE_REGISTRY, supportsBusinessType } from '@/lib/nasaq/modules';

export default function ModuleSettingsPage() {
  return (
    <DashboardModule
      title="تخصيص الوحدات"
      subtitle="أظهر أو أخفٍ أو أعد ترتيب أقسام لوحة التحكم، وثبّت وحداتك المفضلة."
    >
      {({ project, patch }) => {
        const enabled = project.enabledModules;
        const pinned = project.pinnedModules;

        function toggle(id: string) {
          const next = enabled.includes(id) ? enabled.filter((m) => m !== id) : [...enabled, id];
          patch({ enabledModules: next });
        }

        function togglePin(id: string) {
          const next = pinned.includes(id) ? pinned.filter((m) => m !== id) : [...pinned, id];
          patch({ pinnedModules: next });
        }

        function move(id: string, dir: -1 | 1) {
          const idx = enabled.indexOf(id);
          const target = idx + dir;
          if (idx < 0 || target < 0 || target >= enabled.length) return;
          const next = [...enabled];
          [next[idx], next[target]] = [next[target], next[idx]];
          patch({ enabledModules: next });
        }

        function reset() {
          patch({ enabledModules: [...(BUSINESS_DEFAULT_MODULES[project.businessType] ?? BUSINESS_DEFAULT_MODULES.store)] });
        }

        return (
          <>
            <div className="grid-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="card"><span className="text-xs text-muted">وحدات مفعلة</span><p className="kpi-value">{enabled.length}</p></div>
              <div className="card"><span className="text-xs text-muted">وحدات مثبتة</span><p className="kpi-value">{pinned.length}</p></div>
              <div className="card">
                <span className="text-xs text-muted">نوع النشاط</span>
                <p className="mt-1 text-sm font-bold">{project.businessType}</p>
              </div>
            </div>

            <div className="card flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm">
                عدد الوحدات المتاحة في المنصة: <strong>{Object.keys(MODULE_REGISTRY).length}</strong>
              </span>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-outline btn-sm" onClick={reset}>
                  إعادة التعيين لقالب نشاطك ({project.businessType})
                </button>
              </div>
            </div>

            <div className="grid-2 lg:grid-cols-3">
              {Object.values(MODULE_REGISTRY).map((mod) => {
                const on = enabled.includes(mod.id);
                const isCore = CORE_MODULES.includes(mod.id);
                const supported = supportsBusinessType(mod, project.businessType);
                const pinnedOn = pinned.includes(mod.id);
                return (
                  <div key={mod.id} className={`card ${on ? 'border-primary' : ''}`}>
                    <div className="mb-2 flex items-start justify-between">
                      <span className="icon-box">{getIcon(mod.icon)}</span>
                      <div className="flex flex-wrap gap-1">
                        {isCore && <span className="badge badge-primary">أساسية</span>}
                        {pinnedOn && <span className="badge badge-warning">مثبتة</span>}
                        <span className={on ? 'badge badge-success' : 'badge badge-muted'}>{on ? 'مُفعّل' : 'غير مفعل'}</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold">{mod.name}</h3>
                    <p className="mt-1 text-xs text-muted">{mod.description}</p>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {mod.availableInPlans.map((p) => <span key={p} className="badge badge-muted">{p}</span>)}
                    </div>
                    {!supported && <span className="badge badge-warning mt-1">غير موصى به لهذا النشاط</span>}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className={`btn btn-sm ${on ? 'btn-danger-outline' : 'btn-primary'}`}
                        disabled={isCore}
                        onClick={() => toggle(mod.id)}
                        title={isCore ? 'الوحدة الأساسية لا يمكن تعطيلها' : ''}
                      >
                        {on ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => togglePin(mod.id)}>
                        {pinnedOn ? 'إزالة التثبيت' : 'تثبيت'}
                      </button>
                      {on && (
                        <div className="flex gap-1">
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => move(mod.id, -1)} aria-label="أعلى">↑</button>
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => move(mod.id, 1)} aria-label="أسفل">↓</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card" style={{ background: 'var(--muted-surface)' }}>
              <span className="badge badge-warning">تنبيه الشفافية التقنية</span>
              <p className="mt-2 text-sm font-bold">قيود هذا النموذج الأولي</p>
              <p className="mt-1 text-sm text-muted">
                يمكنك تخصيص الوحدات في واجهة المستخدم فقط. قيود الخطة (Starter / Growth / Business) والصلاحيات
                الدقيقة تُفرض على مستوى الخادم (أي قاعدة البيانات و Row Level Security) في نسخة الإنتاج.
              </p>
            </div>
          </>
        );
      }}
    </DashboardModule>
  );
}
