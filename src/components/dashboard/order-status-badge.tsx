const COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  preparing: 'bg-indigo-50 text-indigo-700',
  ready: 'bg-purple-50 text-purple-700',
  shipped: 'bg-cyan-50 text-cyan-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  returned: 'bg-orange-50 text-orange-700',
};

const LABELS: Record<string, string> = {
  draft: 'مسودة',
  pending: 'بانتظار',
  confirmed: 'مؤكد',
  preparing: 'يُحضَّر',
  ready: 'جاهز',
  shipped: 'مشحون',
  delivered: 'مُسلَّم',
  cancelled: 'ملغي',
  returned: 'مرتجع',
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[status] ?? 'bg-gray-100 text-gray-700'}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
