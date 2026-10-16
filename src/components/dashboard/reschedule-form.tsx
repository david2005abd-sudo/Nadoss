'use client';

import { useActionState } from 'react';
import { Loader2, CalendarClock } from 'lucide-react';
import { rescheduleBookingAction, type BookingActionState } from '@/app/dashboard/bookings/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: BookingActionState = {};

export function RescheduleForm({
  bookingId,
  currentScheduledAt,
  currentDuration,
}: {
  bookingId: string;
  currentScheduledAt: string;
  currentDuration: number;
}) {
  const [state, formAction, isPending] = useActionState(rescheduleBookingAction, initialState);

  // Convert to local datetime-local format (YYYY-MM-DDTHH:mm)
  const dt = new Date(currentScheduledAt);
  const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5">
      <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
        <CalendarClock className="h-4 w-4" />
        إعادة الجدولة
      </h2>

      {state.error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="mb-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-800">
          {state.success}
        </div>
      )}

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="bookingId" value={bookingId} />

        <div className="space-y-1.5">
          <Label htmlFor="scheduledAt">الموعد الجديد</Label>
          <Input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            defaultValue={local}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="durationMinutes">المدة (دقائق)</Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={5}
            max={480}
            defaultValue={currentDuration}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          إعادة الجدولة
        </Button>
      </form>
    </section>
  );
}
