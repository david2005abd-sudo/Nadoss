import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <p className="text-7xl font-bold text-nados-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">الصفحة غير موجودة</h1>
      <p className="mt-2 text-gray-500">
        قد يكون الرابط خاطئًا أو أن المتجر غير متاح
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-nados-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-nados-primary-dark"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
