'use client';

import { Suspense, useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction, type ActionState } from '../actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';

const initialState: ActionState = {};

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === '1';

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">تسجيل الدخول</h1>
      <p className="text-sm text-gray-500 mb-6">أدخل رقم هاتفك وكلمة المرور للمتابعة</p>

      {registered && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          تم إنشاء حسابك بنجاح، سجّل الدخول الآن
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
          autoComplete="tel"
          errors={state.fieldErrors?.phone}
        />
        <FormField
          label="كلمة المرور"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          errors={state.fieldErrors?.password}
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-nados-primary hover:underline">
            نسيت كلمة المرور؟
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        ليس لديك حساب؟{' '}
        <Link href="/register" className="text-nados-primary font-medium hover:underline">
          أنشئ متجرك الآن
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-400">جارٍ التحميل...</div>}>
      <LoginForm />
    </Suspense>
  );
}
