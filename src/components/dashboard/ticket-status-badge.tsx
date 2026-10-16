const COLORS: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-indigo-50 text-indigo-700',
  waiting: 'bg-amber-50 text-amber-700',
  resolved: 'bg-green-50 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

const LABELS: Record<string, string> = {
  open: 'مفتوحة',
  in_progress: 'قيد المعالجة',
  waiting: 'بانتظار العميل',
  resolved: 'تم الحل',
  closed: 'مغلقة',
};

export function TicketStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        COLORS[status] ?? 'bg-gray-100 text-gray-700'
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
