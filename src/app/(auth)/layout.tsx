import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nados-primary text-lg font-bold text-white">
          ن
        </div>
        <span className="text-2xl font-bold text-gray-900">نادوس</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-xs text-gray-400">
        © {new Date().getFullYear()} نادوس — جميع الحقوق محفوظة
      </p>
    </div>
  );
}
