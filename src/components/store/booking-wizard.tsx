'use client';

import { useActionState, useState } from 'react';
import { Check, Clock, Loader2, User, Calendar, ChevronLeft } from 'lucide-react';
import { createPublicBookingAction, type BookingActionState } from '@/app/dashboard/bookings/actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Label } from '@/components/ui/label';
import { formatIQD } from '@/lib/utils';

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

export function BookingWizard({
  tenantSlug,
  tenantName,
  services,
  staff,
}: {
  tenantSlug: string;
  tenantName: string;
  services: Service[];
  staff: Staff[];
}) {
  const [state, formAction, isPending] = useActionState(createPublicBookingAction, initialState);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');

  const service = services.find((s) => s.id === serviceId);

  // Compute available time slots for tomorrow + next 14 days (10am-8pm)
  const slotsByDate = generateSlots();

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-5">
      <input type="hidden" name="tenantSlug" value={tenantSlug} />
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="staffId" value={staffId} />

      {/* Step indicator */}
      <div className="flex items-center gap-2 justify-center mb-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                step >= n
                  ? 'bg-nados-primary text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step > n ? <Check className="h-4 w-4" /> : n}
            </div>
            {n < 3 && (
              <div className={`h-0.5 w-8 ${step > n ? 'bg-nados-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Step 1: Service */}
      {step === 1 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="font-semibold text-gray-900 mb-4">اختر الخدمة</h2>
          <div className="space-y-2">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setServiceId(s.id);
                  setStep(2);
                }}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-right transition-colors ${
                  serviceId === s.id
                    ? 'border-nados-primary bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{s.name_ar}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {s.duration_minutes} دقيقة
                    </p>
                  </div>
                </div>
                <span className="font-bold text-nados-primary">
                  {formatIQD(s.price_iqd)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Step 2: Staff + Time */}
      {step === 2 && service && (
        <>
          <section className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">اختر الموظف</h2>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-gray-500 hover:text-nados-primary flex items-center gap-1"
              >
                <ChevronLeft className="h-3 w-3" />
                تغيير الخدمة
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStaffId('')}
                className={`rounded-xl border p-3 text-sm ${
                  staffId === ''
                    ? 'border-nados-primary bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <User className="mx-auto h-5 w-5 text-gray-500" />
                <p className="mt-1 text-xs font-medium">أي موظف</p>
              </button>
              {staff.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStaffId(s.id)}
                  className={`rounded-xl border p-3 text-sm ${
                    staffId === s.id
                      ? 'border-nados-primary bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <User className="mx-auto h-5 w-5 text-gray-500" />
                  <p className="mt-1 text-xs font-medium">{s.name}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              اختر الموعد
            </h2>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {Array.from(slotsByDate.entries()).map(([dateKey, slots]) => (
                <div key={dateKey}>
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    {new Date(dateKey).toLocaleDateString('ar-IQ', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <label
                        key={slot}
                        className="cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="scheduledAt"
                          value={slot}
                          required
                          className="peer sr-only"
                        />
                        <div className="rounded-lg border border-gray-200 px-3 py-2 text-center text-sm peer-checked:border-nados-primary peer-checked:bg-blue-50 peer-checked:text-nados-primary hover:bg-gray-50">
                          {new Date(slot).toLocaleTimeString('ar-IQ', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={!serviceId}
              >
                التالي
              </Button>
            </div>
          </section>
        </>
      )}

      {/* Step 3: Contact + Confirm */}
      {step === 3 && service && (
        <>
          <section className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-gray-900">معلوماتك</h2>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-gray-500 hover:text-nados-primary flex items-center gap-1"
              >
                <ChevronLeft className="h-3 w-3" />
                تغيير الموعد
              </button>
            </div>

            <FormField
              label="الاسم الكامل"
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
            <div className="space-y-1.5">
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
              />
            </div>
          </section>

          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="font-semibold text-gray-900 mb-3">ملخص الحجز</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">الخدمة</span>
                <span className="font-medium">{service.name_ar}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">المدة</span>
                <span className="font-medium">{service.duration_minutes} دقيقة</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2">
                <span className="text-gray-500">السعر</span>
                <span className="font-bold text-nados-primary">
                  {formatIQD(service.price_iqd)}
                </span>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            تأكيد الحجز
          </Button>
        </>
      )}
    </form>
  );
}

/**
 * Generate available time slots: next 14 days, 10am-8pm, on the hour.
 * In production: replace with real availability RPC call per day.
 */
function generateSlots(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const now = new Date();

  for (let d = 1; d <= 14; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString();
    const slots: string[] = [];

    for (let hour = 10; hour < 20; hour++) {
      for (const min of [0, 30]) {
        const slot = new Date(date);
        slot.setHours(hour, min, 0, 0);
        slots.push(slot.toISOString());
      }
    }
    map.set(key, slots);
  }
  return map;
}
