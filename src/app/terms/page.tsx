import Link from 'next/link';

export const metadata = { title: 'الشروط والأحكام' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-4 py-4">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nados-primary text-xs font-bold text-white">ن</div>
            <span className="font-bold text-gray-900">نادوس</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900">الشروط والأحكام</h1>
        <div className="mt-6 space-y-5 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. قبول الشروط</h2>
            <p className="mt-2">
              باستخدامك منصة نادوس، فإنك توافق على هذه الشروط والأحكام. إذا لم توافق، يرجى عدم استخدام المنصة.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. الحساب والمسؤولية</h2>
            <p className="mt-2">
              أنت مسؤول عن سرية بيانات حسابك وعن جميع النشاطات التي تحدث عبر حسابك. يجب أن تكون بيانات متجرك دقيقة وحقيقية.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. المحتوى والمنتجات</h2>
            <p className="mt-2">
              أنت المالك الوحيد لمحتوى متجرك ومنتجاتك. يُمنع بيع أي منتجات مخالفة للقانون العراقي أو الأعراف العامة.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. الاشتراكات والمدفوعات</h2>
            <p className="mt-2">
              الخطة المجانية دائمة. الخطط المدفوعة تُدفع شهريًا مقدمًا ويمكن الإلغاء في أي وقت مع بقاء الميزات حتى نهاية الفترة المدفوعة.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. الخصوصية</h2>
            <p className="mt-2">
              بيانات عملائك ملكك حصريًا — لا نستخدمها ولا نشاركها مع أي طرف ثالث. راجع سياسة الخصوصية للتفاصيل.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. إنهاء الخدمة</h2>
            <p className="mt-2">
              يمكن لأي طرف إنهاء الاتفاقية بإشعار مسبق. عند الإنهاء، ستحصل على فترة 30 يومًا لتصدير بياناتك.
            </p>
          </section>
        </div>
        <p className="mt-8 text-xs text-gray-400">آخر تحديث: أكتوبر 2026</p>
      </main>
    </div>
  );
}
