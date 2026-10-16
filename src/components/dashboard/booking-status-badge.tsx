import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from '@/lib/validations/booking';

export function BookingStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        BOOKING_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'
      }`}
    >
      {BOOKING_STATUS_LABELS[status] ?? status}
    </span>
  );
}
