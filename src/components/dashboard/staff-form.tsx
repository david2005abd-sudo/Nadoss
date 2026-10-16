'use client';

import { useActionState } from 'react';
import { Loader2, CheckCircle2, Plus } from 'lucide-react';
import { createStaffAction, type BookingActionState } from '@/app/dashboard/bookings/actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';

const initialState: BookingActionState = {};

export function StaffCreateForm() {
  const [state, formAction, isPending] = useActionState(createStaffAction, initialState);

  return (
    <form action={formAction} className="rounded-xl border border-gray-100 bg-white p-5 space-y-4 h-fit">
      <h2 className="font-semibold text-gray-900">موظف جديد</h2>

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
        label="الاسم"
        name="name"
        required
        placeholder="حسين علي"
        errors={state.fieldErrors?.name}
      />
      <FormField
        label="رقم الهاتف (اختياري)"
        name="phone"
        type="tel"
        placeholder="07XXXXXXXXX"
        errors={state.fieldErrors?.phone}
      />
      <FormField
        label="الدور (اختياري)"
        name="role"
        placeholder="حلاق، مدرب..."
        errors={state.fieldErrors?.role}
      />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        إضافة
      </Button>
    </form>
  );
}
