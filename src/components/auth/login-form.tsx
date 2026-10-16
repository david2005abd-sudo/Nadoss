'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { useClientAuth } from '@/lib/supabase/client-auth';

function InnerLoginForm() {
  const { state, signIn } = useClientAuth();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === '1';

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    void signIn(String(form.get('phone') ?? ''), String(form.get('password') ?? ''));
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">تسجيل الدخول</h1>
      <p className="mb-6 text-sm text-gray-500">أدخل رقم هاتفك وكلمة المرور للمتابعة</p>

      {registered && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          تم إنشاء حسابك بنجاح — سجّل الدخول الآن
        </div>
      )}

      {state.success && !state.error && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {state.success}
        </div>
      )}

      {state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <Button type="submit" className="w-full" disabled={state.loading}>
          {state.loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        ليس لديك حساب؟{' '}
        <Link href="/register" className="font-medium text-nados-primary hover:underline">
          أنشئ متجرك الآن
        </Link>
      </p>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="text-center text-gray-400">جارٍ التحميل...</div>}>
      <InnerLoginForm />
    </Suspense>
  );
}
