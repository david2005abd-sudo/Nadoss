'use client';

import { useActionState, useState } from 'react';
import { Truck, Loader2, X, CheckCircle2 } from 'lucide-react';
import { createShipmentAction, type DeliveryActionState } from '@/app/dashboard/delivery/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Company {
  id: number;
  name_ar: string;
  slug: string;
}

const initialState: DeliveryActionState = {};

export function CreateShipmentButton({
  orderId,
  orderNumber,
  companies,
}: {
  orderId: string;
  orderNumber: string;
  companies: Company[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createShipmentAction, initialState);

  if (companies.length === 0) {
    return (
      <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800">
        اربط شركة توصيل أولًا من{' '}
        <a href="/dashboard/delivery" className="underline font-medium">
          صفحة التوصيل
        </a>
      </div>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full">
        <Truck className="h-4 w-4" />
        إنشاء شحنة توصيل
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="font-semibold text-gray-900">إنشاء شحنة — {orderNumber}</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </header>

            <form action={formAction} className="p-5 space-y-4">
              <input type="hidden" name="orderId" value={orderId} />

              {state.error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {state.error}
                </div>
              )}
              {state.success && (
                <div className="flex items-start gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-800">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  {state.success}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="deliveryCompanySlug">شركة التوصيل</Label>
                <select
                  id="deliveryCompanySlug"
                  name="deliveryCompanySlug"
                  required
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isPickup"
                  className="h-4 w-4 rounded border-gray-300 text-nados-primary focus:ring-nados-primary"
                />
                <span>طلب استلام من العميل (Pickup)</span>
              </label>

              <div className="space-y-1.5">
                <Label htmlFor="shipNotes">ملاحظات (اختياري)</Label>
                <textarea
                  id="shipNotes"
                  name="notes"
                  rows={2}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-nados-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                  إنشاء
                </Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
