import { AlertTriangle } from 'lucide-react';

const LABELS: Record<string, string> = {
  products: 'المنتجات',
  orders: 'الطلبات',
  ai_messages: 'رسائل الذكاء الاصطناعي',
};

export function UsageMeter({
  metric,
  current,
  limit,
}: {
  metric: string;
  current: number;
  limit: number | null;
}) {
  const isUnlimited = limit === null;
  const pct = isUnlimited ? 0 : Math.min(100, (current / Math.max(1, limit)) * 100);
  const isCritical = !isUnlimited && pct >= 90;
  const isWarning = !isUnlimited && pct >= 70 && pct < 90;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">
          {LABELS[metric] ?? metric}
        </span>
        <span className="text-xs text-gray-500">
          {isUnlimited ? `${current} / ∞` : `${current} / ${limit}`}
        </span>
      </div>

      {!isUnlimited && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full transition-all ${
              isCritical ? 'bg-nados-danger' : isWarning ? 'bg-amber-500' : 'bg-nados-primary'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {isCritical && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-nados-danger">
          <AlertTriangle className="h-3 w-3" />
          قاربت على الوصول للحد الأقصى
        </p>
      )}
    </div>
  );
}
