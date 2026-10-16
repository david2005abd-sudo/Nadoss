'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';

export default function ForgotPasswordForm() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">نسيت كلمة المرور؟</h1>
      <p className="mb-6 text-sm text-gray-500">
        أدخل رقم هاتفك وسنساعدك في استعادة حسابك
      </p>

      <p className="text-sm text-gray-600">
        إذا كان الرقم مسجلًا، سيتواصل معك فريق الدعم لإعادة تعيين كلمة المرور.
      </p>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/login" className="font-medium text-nados-primary hover:underline">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
