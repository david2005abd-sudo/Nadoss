'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { forgotPasswordAction, type ActionState } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';

const initialState: ActionState = {};

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useFormState(forgotPasswordAction, initialState);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">نسيت كلمة المرور؟</h1>
      <p className="mb-6 text-sm text-gray-500">
        أدخل رقم هاتفك وسنساعدك في استعادة حسابك
      </p>

      {state.success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {state.success}
        </div>
      )}

      {state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
          {isPending ? 'جارٍ الإرسال...' : 'استعادة كلمة المرور'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/login" className="font-medium text-nados-primary hover:underline">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
