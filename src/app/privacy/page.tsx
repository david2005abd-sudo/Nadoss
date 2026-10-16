import Link from 'next/link';

export const metadata = { title: 'سياسة الخصوصية' };

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">سياسة الخصوصية</h1>
        <div className="mt-6 space-y-5 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">البيانات التي نجمعها</h2>
            <p className="mt-2">
              نجمع فقط ما نحتاجه لتشغيل المنصة: رقم هاتفك، اسم متجرك، وبيانات المنتجات والطلبات التي تضيفها بنفسك.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">عزل بيانات المتاجر</h2>
            <p className="mt-2">
              كل متجر معزول تقنيًا عن الآخر عبر Row Level Security على مستوى قاعدة البيانات — لا يمكن لأي تاجر رؤية بيانات تاجر آخر مهما حدث.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">بيانات عملائك</h2>
            <p className="mt-2">
              أسماء وأرقام هواتف عملائك ملكك حصريًا. لا نبيعها ولا نستخدمها لأي غرض تسويقي ولا نشاركها مع أطراف ثالثة.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">الذكاء الاصطناعي</h2>
            <p className="mt-2">
              عند تفعيل بوت الواتساب، تُعالج الرسائل عبر نماذج ذكاء اصطناعي لتحويلها إلى طلبات. التعليمات النظامية معزولة تمامًا عن محتوى الرسائل.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">الأمان</h2>
            <p className="mt-2">
              HTTPS إلزامي في كل الاتصالات، وبيانات اعتماد التوصيل والدفع مشفرة بـ AES-256، مع نسخ احتياطي يومي تلقائي.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">حقوقك</h2>
            <p className="mt-2">
              يمكنك طلب تصدير أو حذف بياناتك في أي وقت عبر صفحة الدعم الفني داخل لوحة التحكم.
            </p>
          </section>
        </div>
        <p className="mt-8 text-xs text-gray-400">آخر تحديث: أكتوبر 2026</p>
      </main>
    </div>
  );
}
