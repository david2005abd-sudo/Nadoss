'use client';

import { useActionState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { updateBookingStatusAction, type BookingActionState } from '@/app/dashboard/bookings/actions';
import { Button } from '@/components/ui/button';
import { BOOKING_STATUS_LABELS } from '@/lib/validations/booking';

const VARIANT: Record<string, 'default' | 'outline' | 'danger' | 'secondary'> = {
  confirmed: 'default',
  in_progress: 'default',
  completed: 'secondary',
  cancelled: 'danger',
  no_show: 'outline',
};

const initialState: BookingActionState = {};

export function BookingStatusUpdater({
  bookingId,
  currentStatus,
  allowed,
}: {
  bookingId: string;
  currentStatus: string;
  allowed: string[];
}) {
  const [state, formAction, isPending] = useActionState(updateBookingStatusAction, initialState);

  if (allowed.length === 0) {
    return (
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="font-semibold text-gray-900 mb-3">تحديث الحالة</h2>
        <p className="text-sm text-gray-500">لا توجد انتقالات متاحة من هذه الحالة</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5">
      <h2 className="font-semibold text-gray-900 mb-3">تحديث الحالة</h2>

      {state.error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-800">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {state.success}
        </div>
      )}

      <div className="space-y-2">
        {allowed.map((s) => (
          <form key={s} action={formAction}>
            <input type="hidden" name="bookingId" value={bookingId} />
            <input type="hidden" name="newStatus" value={s} />
            <Button
              type="submit"
              variant={VARIANT[s] ?? 'outline'}
              className="w-full justify-start"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {BOOKING_STATUS_LABELS[s] ?? s}
            </Button>
          </form>
        ))}
      </div>
    </section>
  );
}
