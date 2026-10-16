import Link from 'next/link';
import { Info } from 'lucide-react';

export function StaticNotice({ title }: { title?: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
        <Info className="h-6 w-6 text-nados-primary" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-gray-900">
        {title ?? 'نسخة معاينة'}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        هذه نسخة معاينة ثابتة من موقع نادوس. تسجيل الحساب ولوحة التحكم تعمل على
        النسخة الحية المربوطة بقاعدة البيانات.
      </p>
      <div className="mt-5 rounded-lg bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-600">
        <strong>للنشر الحي الكامل:</strong> اربط المشروع على Vercel وأضف متغيرات
        بيئة Supabase — التعليمات الكاملة في ملف README داخل المستودع.
      </div>
      <Link
        href="/"
        className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-nados-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-nados-primary-dark"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
