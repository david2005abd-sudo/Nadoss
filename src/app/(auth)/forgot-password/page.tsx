'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction, type ActionState } from '../actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';

const initialState: ActionState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">نسيت كلمة المرور؟</h1>
      <p className="text-sm text-gray-500 mb-6">
        أدخل رقم هاتفك وسنرسل لك رابط إعادة التعيين
      </p>

      {state.success && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {state.success}
        </div>
      )}

      {state.error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <FormField
          label="رقم الهاتف"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="07XXXXXXXXX"
          required
          errors={state.fieldErrors?.phone}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'جارٍ الإرسال...' : 'إرسال رابط إعادة التعيين'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/login" className="text-nados-primary font-medium hover:underline">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
