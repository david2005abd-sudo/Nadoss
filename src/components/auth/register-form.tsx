'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { registerAction, type ActionState } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';

const initialState: ActionState = {};

export default function RegisterForm() {
  const [state, formAction, isPending] = useFormState(registerAction, initialState);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">أنشئ متجرك</h1>
      <p className="mb-6 text-sm text-gray-500">
        مجانًا — بدون بطاقة ائتمان، تبدأ البيع في دقائق
      </p>

      {state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
          hint="سيُستخدم لتسجيل الدخول والتنبيهات"
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

      <p className="mt-4 text-center text-xs text-gray-400">
        بإنشائك الحساب، أنت توافق على{' '}
        <Link href="/terms" className="text-nados-primary hover:underline">الشروط</Link>
        {' '}و{' '}
        <Link href="/privacy" className="text-nados-primary hover:underline">الخصوصية</Link>
      </p>

      <p className="mt-6 text-center text-sm text-gray-600">
        لديك حساب بالفعل؟{' '}
        <Link href="/login" className="font-medium text-nados-primary hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
