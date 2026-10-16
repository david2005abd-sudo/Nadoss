'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { resetPasswordAction, type ActionState } from '../actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';

const initialState: ActionState = {};
export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">تعيين كلمة مرور جديدة</h1>
      <p className="text-sm text-gray-500 mb-6">بعد التحقق من رمز SMS، اختر كلمة مرور قوية لحسابك.</p>
      {state.error && <div role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</div>}
      <form action={formAction} className="space-y-4">
        <FormField label="كلمة المرور الجديدة" name="password" type="password" minLength={10} required autoComplete="new-password" errors={state.fieldErrors?.password} />
        <FormField label="تأكيد كلمة المرور" name="confirmPassword" type="password" minLength={10} required autoComplete="new-password" errors={state.fieldErrors?.confirmPassword} />
        <Button type="submit" className="w-full" disabled={isPending}>{isPending ? 'جارٍ التحديث...' : 'حفظ كلمة المرور'}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600"><Link href="/login" className="text-nados-primary font-medium hover:underline">العودة لتسجيل الدخول</Link></p>
    </div>
  );
}
