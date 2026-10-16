import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-nados-primary flex items-center justify-center text-white font-bold text-lg">
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
