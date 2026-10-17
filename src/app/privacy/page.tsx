import Link from 'next/link';

export const metadata = { title: 'سياسة الخصوصية' };

export default function PrivacyPage() {
 return (
  <div className="nasaq-container max-w-3xl py-10">
   <Link href="/" className="brand-logo mb-6">
    <span className="brand-mark">ن</span>
    <span className="font-extrabold">نَسَق</span>
   </Link>

   <h1 className="text-2xl font-extrabold">سياسة الخصوصية والبيانات المحلية</h1>
   <p className="mt-2 text-sm text-muted">آخر تحديث: أكتوبر 2026</p>

   <div className="card mt-6 space-y-4 text-sm leading-relaxed">
    <section>
     <h2 className="font-bold">1. ما نجمعه</h2>
     <p className="mt-1 text-muted">
      في هذه النسخة ال لا نجمع أي بيانات شخصية على أي خادم. كل ما تُدخله يبقى داخل متصفحك في
      <span className="font-mono"> localStorage</span>.
     </p>
    </section>

    <section>
     <h2 className="font-bold">2. تسجيل الدخول</h2>
     <p className="mt-1 text-muted">
      عند ربط مشروع Supabase، تُعالج بيانات الدخول عبر خدمة Supabase Auth وفق سياسة الخصوصية الخاصة بها،
      ويُخزّن رمز الجلسة في متصفحك ليبقى تسجيل دخولك فعالًا.
     </p>
    </section>

    <section>
     <h2 className="font-bold">3. الذكاء الاصطناعي</h2>
     <p className="mt-1 text-muted">
      في وضع Demo لا تُرسل أي من بياناتك إلى مزودي الذكاء الاصطناعي. في نسخة الإنتاج يُمرّ كل طلب عبر
      خادم آمن ولا تُكشف مفاتيح المزودين للمتصفح.
     </p>
    </section>

    <section>
     <h2 className="font-bold">4. حذف بياناتك</h2>
     <p className="mt-1 text-muted">
      يمكنك حذف كل بيانات هذا النموذج في أي وقت من: الإعدادات ← الخصوصية وبيانات المشروع ← إعادة تعيين، أو
      بمسح بيانات متصفحك.
     </p>
    </section>

    <section>
     <h2 className="font-bold">5. التواصل</h2>
     <p className="mt-1 text-muted">
      للاستفسارات المتعلقة بالخصوصية، راسلنا على البريد الموضّح في لوحة المالك.
     </p>
    </section>
   </div>

   <div className="mt-6 flex gap-3">
    <Link href="/" className="btn btn-outline btn-sm">العودة للرئيسية</Link>
    <Link href="/terms" className="btn btn-outline btn-sm">شروط الاستخدام</Link>
   </div>
  </div>
 );
}
