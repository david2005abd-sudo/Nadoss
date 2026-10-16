'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { verifyOtpAction, type ActionState } from '../actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';

const initialState: ActionState = {};

function VerifyOtpForm() {
  const [state, formAction, isPending] = useActionState(verifyOtpAction, initialState);
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') ?? '';
  const mode = searchParams.get('mode') ?? 'login';

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{mode === 'recovery' ? 'التحقق لاستعادة كلمة المرور' : 'تأكيد رقم الهاتف'}</h1>
      <p className="text-sm text-gray-500 mb-6">
        أدخل الرمز المكون من 6 أرقام المرسل إلى {phone || 'رقم هاتفك'}{mode === 'recovery' ? ' لتعيين كلمة مرور جديدة' : ''}
      </p>

      {state.error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="phone" value={phone} />
        <input type="hidden" name="mode" value={mode} />
        <FormField
          label="رمز التحقق"
          name="token"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="123456"
          required
          autoComplete="one-time-code"
          errors={state.fieldErrors?.token}
          className="[&_input]:text-center [&_input]:text-2xl [&_input]:tracking-widest"
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'جارٍ التحقق...' : 'تأكيد'}
        </Button>
      </form>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-400">جارٍ التحميل...</div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}
