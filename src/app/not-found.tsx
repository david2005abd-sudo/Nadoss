import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <p className="text-7xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-extrabold">الصفحة غير موجودة</h1>
      <p className="mt-2 text-muted">قد يكون الرابط خاطئًا أو أن القسم غير مفعّل في هذا النموذج.</p>
      <Link href="/" className="btn btn-primary mt-6">
        العودة للرئيسية
      </Link>
    </div>
  );
}
