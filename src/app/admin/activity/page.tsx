'use client';

import { useState } from 'react';
import { useNasaq } from '@/lib/nasaq/store';
import { AdminHeader } from '@/components/nasaq/admin-shell';
import { getIcon } from '@/components/nasaq/icons';

export default function AdminActivityPage() {
  const { state, patchPlatform } = useNasaq();
  const [filter, setFilter] = useState('');

  const entries = state.activityLog.filter((a) => !filter || a.actor.includes(filter) || a.action.includes(filter));

  return (
    <>
      <AdminHeader
        title="سجل الإجراءات (Audit Log)"
        subtitle="سجل تجريبي لأحداث إدارة المنصة (إنشاء مشترك، تغيير باقة، تفعيل مزود، تحديث قسم)."
      />

      <div className="card flex flex-wrap items-center justify-between gap-2">
        <label className="form-group w-full sm:max-w-xs">
          <span className="form-label">تصفية السجل</span>
          <input className="form-control" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="ابحث بالفاعل أو الإجراء..." />
        </label>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() =>
            patchPlatform({
              activityLog: [
                { id: `act_${Date.now().toString(36)}`, time: 'الآن', actor: 'مالك المنصة', action: 'عرض سجل الإجراءات (تجريبي)' },
                ...state.activityLog,
              ],
            })
          }
        >
          {getIcon('plus', { size: 14 })} إضافة سجل تجريبي
        </button>
      </div>

      <div className="space-y-2">
        {entries.map((a) => (
          <div key={a.id} className="card flex flex-wrap items-center gap-3 !py-3">
            <span className="icon-box" style={{ width: 34, height: 34 }}>{getIcon('file', { size: 16 })}</span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold">{a.actor}</span>
                <span className="badge badge-muted">{a.time}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{a.action}</p>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="card text-center text-sm text-muted">لا توجد سجلات مطابقة للبحث.</div>
        )}
      </div>
    </>
  );
}
