'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction, type ActionState } from '../actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';

const initialState: ActionState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">أنشئ متجرك</h1>
      <p className="text-sm text-gray-500 mb-6">
        مجانًا — بدون بطاقة ائتمان، تبدأ البيع في دقائق
      </p>

      {state.error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <FormField
          label="الاسم الكامل"
          name="fullName"
          type="text"
          placeholder="علي محمد"
          required
          autoComplete="name"
          errors={state.fieldErrors?.fullName}
        />
        <FormField
          label="اسم المتجر"
          name="storeName"
          type="text"
          placeholder="متجر النور"
          required
          errors={state.fieldErrors?.storeName}
          hint="يمكنك تغييره لاحقًا من لوحة التحكم"
        />
        <FormField
          label="رقم الهاتف"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="07XXXXXXXXX"
          required
          autoComplete="tel"
          errors={state.fieldErrors?.phone}
          hint="سيُستخدم لتسجيل الدخول واستقبال التنبيهات"
        />
        <FormField
          label="كلمة المرور"
          name="password"
          type="password"
          placeholder="8 أحرف على الأقل"
          required
          autoComplete="new-password"
          errors={state.fieldErrors?.password}
        />
        <FormField
          label="تأكيد كلمة المرور"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          errors={state.fieldErrors?.confirmPassword}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
        </Button>
      </form>

      <p className="mt-4 text-xs text-gray-400 text-center">
        بإنشائك الحساب، أنت توافق على{' '}
        <Link href="/terms" className="text-nados-primary hover:underline">الشروط</Link>
        {' '}و{' '}
        <Link href="/privacy" className="text-nados-primary hover:underline">الخصوصية</Link>
      </p>

      <p className="mt-6 text-center text-sm text-gray-600">
        لديك حساب بالفعل؟{' '}
        <Link href="/login" className="text-nados-primary font-medium hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
