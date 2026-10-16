'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { createBookingAction, type BookingActionState } from '@/app/dashboard/bookings/actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Label } from '@/components/ui/label';

interface Service {
  id: string;
  name_ar: string;
  duration_minutes: number;
  price_iqd: number;
  color: string;
}

interface Staff {
  id: string;
  name: string;
}

const initialState: BookingActionState = {};

export function BookingForm({
  services,
  staff,
}: {
  services: Service[];
  staff: Staff[];
}) {
  const [state, formAction, isPending] = useActionState(createBookingAction, initialState);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? '');

  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Default datetime: now + 1 hour, rounded to next 15 min
  const defaultDt = new Date(Date.now() + 60 * 60 * 1000);
  defaultDt.setMinutes(Math.ceil(defaultDt.getMinutes() / 15) * 15, 0, 0);
  const localDefault = new Date(defaultDt.getTime() - defaultDt.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);

  return (
    <form action={formAction} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        {state.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <section className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">معلومات العميل</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="الاسم"
              name="customerName"
              required
              placeholder="علي محمد"
              errors={state.fieldErrors?.customerName}
            />
            <FormField
              label="رقم الهاتف"
              name="customerPhone"
              type="tel"
              required
              placeholder="07XXXXXXXXX"
              errors={state.fieldErrors?.customerPhone}
            />
          </div>
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">الموعد</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="serviceId">الخدمة</Label>
              <select
                id="serviceId"
                name="serviceId"
                required
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_ar} — {s.duration_minutes} د — {s.price_iqd.toLocaleString('ar-IQ')} د.ع
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staffId">الموظف (اختياري)</Label>
              <select
                id="staffId"
                name="staffId"
                defaultValue=""
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
              >
                <option value="">بدون تخصيص</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="التاريخ والوقت"
              name="scheduledAt"
              type="datetime-local"
              required
              defaultValue={localDefault}
              errors={state.fieldErrors?.scheduledAt}
            />
            <FormField
              label="المدة (دقائق)"
              name="durationMinutes"
              type="number"
              min={5}
              max={480}
              defaultValue={selectedService?.duration_minutes ?? 30}
              hint="اتركه فارغًا لاستخدام مدة الخدمة"
              errors={state.fieldErrors?.durationMinutes}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="أي تفاصيل إضافية..."
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
            />
          </div>
        </section>
      </div>

      <aside>
        <div className="sticky top-20 rounded-xl border border-gray-100 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">ملخص</h2>

          {selectedService && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">الخدمة</span>
                <span className="font-medium text-gray-900">{selectedService.name_ar}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">المدة</span>
                <span className="font-medium text-gray-900">{selectedService.duration_minutes} د</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2">
                <span className="text-gray-500">السعر</span>
                <span className="font-bold text-nados-primary">
                  {selectedService.price_iqd.toLocaleString('ar-IQ')} د.ع
                </span>
              </div>
            </div>
          )}

          <input type="hidden" name="source" value="admin" />

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              إنشاء الحجز
            </Button>
            <Link href="/dashboard/bookings">
              <Button type="button" variant="ghost" className="w-full">
                إلغاء
              </Button>
            </Link>
          </div>
        </div>
      </aside>
    </form>
  );
}
