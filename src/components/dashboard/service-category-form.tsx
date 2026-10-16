'use client';

import { useActionState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { createServiceCategoryAction, type BookingActionState } from '@/app/dashboard/bookings/actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const initialState: BookingActionState = {};

export function ServiceCategoryCreateForm() {
  const [state, formAction, isPending] = useActionState(createServiceCategoryAction, initialState);

  return (
    <form action={formAction} className="rounded-xl border border-gray-100 bg-white p-5 space-y-4 h-fit">
      <h2 className="font-semibold text-gray-900">خدمة جديدة</h2>

      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-800">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {state.success}
        </div>
      )}

      <FormField
        label="الاسم (عربي)"
        name="nameAr"
        required
        placeholder="قص شعر"
        errors={state.fieldErrors?.nameAr}
      />
      <FormField
        label="الاسم (إنجليزي)"
        name="nameEn"
        placeholder="Haircut"
        errors={state.fieldErrors?.nameEn}
      />
      <FormField
        label="الرابط (slug)"
        name="slug"
        required
        placeholder="haircut"
        errors={state.fieldErrors?.slug}
        hint="أحرف إنجليزية وأرقام و- فقط"
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="المدة (دقائق)"
          name="durationMinutes"
          type="number"
          min={5}
          max={480}
          defaultValue={30}
          required
          errors={state.fieldErrors?.durationMinutes}
        />
        <FormField
          label="السعر (د.ع)"
          name="priceIqd"
          type="number"
          min={0}
          defaultValue={0}
          errors={state.fieldErrors?.priceIqd}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="color">اللون</Label>
        <Input
          id="color"
          name="color"
          type="color"
          defaultValue="#1a56db"
          className="h-10 w-full cursor-pointer"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked
          className="h-4 w-4 rounded border-gray-300 text-nados-primary focus:ring-nados-primary"
        />
        <span>نشط ومتاح للحجز</span>
      </label>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        إضافة
      </Button>
    </form>
  );
}

import { Plus } from 'lucide-react';
