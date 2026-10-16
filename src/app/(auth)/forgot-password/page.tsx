'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(true);
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">نسيت كلمة المرور؟</h1>
      <p className="mb-6 text-sm text-gray-500">
        أدخل رقم هاتفك وسنساعدك في استعادة حسابك
      </p>

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          إذا كان الرقم مسجلًا، سيتواصل معك فريق الدعم لإعادة تعيين كلمة المرور
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
        />
        <Button type="submit" className="w-full">
          استعادة كلمة المرور
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
