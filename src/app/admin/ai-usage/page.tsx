'use client';

import { useMemo, useState } from 'react';
import { useNasaq } from '@/lib/nasaq/store';
import { AdminHeader } from '@/components/nasaq/admin-shell';
import { KpiCard, StatusBadge, TableToolbar } from '@/components/nasaq/ui';
import { getIcon } from '@/components/nasaq/icons';

export default function AdminAiUsagePage() {
  const { state } = useNasaq();
  const [q, setQ] = useState('');
  const [providerFilter, setProviderFilter] = useState('');

  const logs = state.aiUsageLogs;
  const providers = Array.from(new Set(logs.map((l) => l.provider)));

  const filtered = logs.filter(
    (l) =>
      (!q || l.project.includes(q) || l.task.includes(q) || l.model.includes(q)) &&
      (!providerFilter || l.provider === providerFilter)
  );

  const totals = useMemo(() => {
    const requests = logs.reduce((s, l) => s + (l.requests ?? 0), 0);
    const tokens = logs.reduce((s, l) => s + (l.tokens ?? 0), 0);
    const cost = logs.reduce((s, l) => s + Number((l.estCost ?? '0').replace(/[^\d.]/g, '')), 0);
    return { requests, tokens, cost };
  }, [logs]);

  const byProject = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of logs) map.set(l.project, (map.get(l.project) ?? 0) + (l.requests ?? 0));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [logs]);

  return (
    <>
      <AdminHeader
        title="استهلاك الذكاء الاصطناعي"
        subtitle="سجلات تجريبية لطلبات المساعد الذكي حسب المشروع والمزود والمهمة."
      />

      <div className="grid-4">
        <KpiCard label="إجمالي الطلبات" value={totals.requests} icon={getIcon('sparkle')} tone="purple" />
        <KpiCard label="إجمالي التوكنات" value={totals.tokens.toLocaleString('en-US')} icon={getIcon('chart')} tone="teal" />
        <KpiCard label="التكلفة التقديرية" value={`$${totals.cost.toFixed(2)}`} icon={getIcon('receipt')} tone="amber" />
        <KpiCard label="عدد السجلات" value={logs.length} icon={getIcon('file')} tone="green" />
      </div>

      <TableToolbar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="ابحث بالمشروع أو المهمة..."
        filters={[{ v: '', l: 'كل المزودين' }, ...providers.map((p) => ({ v: p, l: p }))]}
        activeFilter={providerFilter}
        onFilterChange={setProviderFilter}
      />

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>المشروع</th>
              <th>المزود</th>
              <th>الموديل</th>
              <th>نوع المهمة</th>
              <th>عدد الطلبات</th>
              <th>التوكنات</th>
              <th>التكلفة التقديرية</th>
              <th>التاريخ</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td className="font-bold text-text-primary">{l.project}</td>
                <td><span className="badge badge-primary">{l.provider}</span></td>
                <td dir="ltr" className="text-muted">{l.model}</td>
                <td className="text-muted">{l.task}</td>
                <td>{l.requests}</td>
                <td>{l.tokens.toLocaleString('en-US')}</td>
                <td className="font-bold">{l.estCost}</td>
                <td className="text-muted">{l.date}</td>
                <td><StatusBadge status={l.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-2">
        <div className="card">
          <span className="text-xs text-muted">أعلى المشاريع استهلاكًا (تجريبي)</span>
          <div className="mt-3 space-y-2">
            {byProject.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between rounded-md border border-border p-2">
                <span className="text-sm font-bold">{name}</span>
                <span className="badge badge-primary">{count} طلبًا</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ background: 'var(--muted-surface)' }}>
          <span className="badge badge-warning">قيود السجل التجريبي</span>
          <p className="mt-2 text-sm">
            هذه السجلات تجريبية فقط لاستعراض شكل لوحة المالك. في الإنتاج تُجمع هذه البيانات من الخادم مع مراقبة
            الحدود الشهرية لكل باقة.
          </p>
        </div>
      </div>
    </>
  );
}
