import Link from 'next/link';

export const metadata = { title: 'شروط الاستخدام' };

export default function TermsPage() {
 return (
  <div className="nasaq-container max-w-3xl py-10">
   <Link href="/" className="brand-logo mb-6">
    <span className="brand-mark">ن</span>
    <span className="font-extrabold">نَسَق</span>
   </Link>

   <h1 className="text-2xl font-extrabold">شروط الاستخدام والحدود التقنية</h1>
   <p className="mt-2 text-sm text-muted">آخر تحديث: أكتوبر 2026</p>

   <div className="card mt-6 space-y-4 text-sm leading-relaxed">
    <section>
     <h2 className="font-bold">1. طبيعة هذا النموذج</h2>
     <p className="mt-1 text-muted">
      هذه نسخة أولية تعمل بالكامل داخل متصفحك، ولا ترتبط بأي خادم خارجي. جميع المشاريع والعملاء
      والطلبات والمدفوعات المعروضة هي بيانات لأغراض العرض فقط.
     </p>
    </section>

    <section>
     <h2 className="font-bold">2. البيانات المحلية</h2>
     <p className="mt-1 text-muted">
      تُحفظ تغييراتك في <span className="font-mono">localStorage</span> متصفحك فقط. مسح بيانات المتصفح يؤدي
      إلى فقدان هذه التغييرات، ويمكنك دائمًا إعادة التعيين من الإعدادات ← الخصوصية.
     </p>
    </section>

    <section>
     <h2 className="font-bold">3. حدود النسخة ال</h2>
     <p className="mt-1 text-muted">
      المساعد الذكي يعمل بردود سياقية مبرمجة مسبقًا. ربط النطاقات وبوابات الدفع وإرسال البريد و SMS غير
      مفعّلة، وتتطلب خادمًا خلفيًا في نسخة الإنتاج.
     </p>
    </section>

    <section>
     <h2 className="font-bold">4. الأسعار والباقات</h2>
     <p className="mt-1 text-muted">
      الأسعار المعروضة هي أسعار توضيحية قابلة للتعديل من لوحة المالك، ولا تمثل أي التزام مالي.
     </p>
    </section>

    <section>
     <h2 className="font-bold">5. الملكية الفكرية</h2>
     <p className="mt-1 text-muted">
      اسم نَسَق وشعاره وهويته البصرية ملك لأصحاب المشروع. لا يجوز إعادة استخدامها في منتج منافس دون إذن.
     </p>
    </section>
   </div>

   <div className="mt-6 flex gap-3">
    <Link href="/" className="btn btn-outline btn-sm">العودة للرئيسية</Link>
    <Link href="/privacy" className="btn btn-outline btn-sm">سياسة الخصوصية</Link>
   </div>
  </div>
 );
}
