import Link from 'next/link';
import {
  Store,
  Package,
  Truck,
  Bot,
  BarChart3,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  ShoppingCart,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Store,
    title: 'متجر إلكتروني جاهز',
    description: 'واجهة عربية RTL كاملة مع رابط خاص لمتجرك — شاركه على إنستغرام وواتساب وابدأ البيع فورًا.',
  },
  {
    icon: Package,
    title: 'إدارة مخزون ذكية',
    description: 'منتجات، تصنيفات، أسعار بالدينار العراقي، وتنبيهات المخزون المنخفض تلقائيًا.',
  },
  {
    icon: Truck,
    title: 'ربط شركات التوصيل',
    description: 'Hi Express وBoxy وGalina والمزيد — أنشئ شحنة وتتبعها من لوحة التحكم مباشرة.',
  },
  {
    icon: Bot,
    title: 'بوت يفهم العراقية',
    description: 'ذكاء اصطناعي يحوّل رسائل واتساب باللهجة العراقية إلى طلبات منظمة تلقائيًا.',
  },
  {
    icon: CreditCard,
    title: 'دفع محلي كامل',
    description: 'الدفع عند الاستلام + زين كاش وFIB وكي كارد وناس باي — كل ما يحتاجه التاجر العراقي.',
  },
  {
    icon: BarChart3,
    title: 'تقارير وتحليلات',
    description: 'إيرادات، أفضل المنتجات، أفضل المحافظات، ومتوسط قيمة الطلب — بضغطة زر.',
  },
];

const PLANS = [
  {
    name: 'مجاني',
    slug: 'free',
    price: '0$',
    period: 'للأبد',
    features: ['10 منتجات', '50 طلب شهريًا', '100 رسالة بوت', 'متجر إلكتروني', 'دعم أساسي'],
    cta: 'ابدأ مجانًا',
    highlighted: false,
  },
  {
    name: 'المبتدئ',
    slug: 'starter',
    price: '19$',
    period: 'شهريًا',
    features: [
      '100 منتج',
      '500 طلب شهريًا',
      '2000 رسالة بوت',
      'ربط شركة توصيل',
      'تقارير أساسية',
    ],
    cta: 'اختر المبتدئ',
    highlighted: false,
  },
  {
    name: 'الاحترافي',
    slug: 'pro',
    price: '49$',
    period: 'شهريًا',
    features: [
      '1000 منتج',
      '5000 طلب شهريًا',
      '3000 رسالة بوت',
      'ربط 3 شركات توصيل',
      'بوابات دفع إلكتروني',
      'بوت واتساب كامل',
    ],
    cta: 'اختر الاحترافي',
    highlighted: true,
  },
  {
    name: 'المؤسسات',
    slug: 'enterprise',
    price: 'تواصل معنا',
    period: '',
    features: ['منتجات غير محدودة', 'API مخصص', 'مدير حساب خاص', 'SLA 99.9%'],
    cta: 'تواصل معنا',
    highlighted: false,
  },
];

const FAQ = [
  {
    q: 'هل أحتاج خبرة تقنية لاستخدام نادوس؟',
    a: 'لا — أنشئ حسابك، أضف منتجاتك، وشارك رابط متجرك. كل شيء بواجهة عربية بسيطة.',
  },
  {
    q: 'هل يدعم الدفع عند الاستلام؟',
    a: 'نعم، الدفع عند الاستلام (COD) متاح افتراضيًا في كل المحافظات العراقية الـ18، مع دعم زين كاش وFIB وكي كارد وناس باي.',
  },
  {
    q: 'كيف يعمل بوت الواتساب؟',
    a: 'اربط رقم واتساب Business، والبوت يقرأ رسائل عملائك باللهجة العراقية ويحوّلها إلى طلبات منظمة — أنت تراجع وتؤكد فقط.',
  },
  {
    q: 'هل يمكنني ربط شركة التوصيل الخاصة بي؟',
    a: 'نعم — ندعم Hi Express وBoxy (أكثر من 15 شركة) وGalina Express. أدخل بيانات API مرة واحدة، وتُشفَّر آمنًا.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-nados-primary text-sm font-bold text-white">
              ن
            </div>
            <span className="text-lg font-bold text-gray-900">نادوس</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            <a href="#features" className="hover:text-nados-primary">الميزات</a>
            <a href="#pricing" className="hover:text-nados-primary">الأسعار</a>
            <a href="#faq" className="hover:text-nados-primary">الأسئلة الشائعة</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              دخول
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-nados-primary px-4 py-2 text-sm font-medium text-white hover:bg-nados-primary-dark"
            >
              أنشئ متجرك
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-nados-secondary" />
            صُممت خصيصًا للسوق العراقي
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
            متجرك الإلكتروني مع <span className="text-nados-primary">ذكاء اصطناعي</span> يفهم عراقي
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-gray-600">
            متجر + إدارة مخزون + توصيل محلي + بوت يحوّل رسائل واتساب إلى طلبات منظمة — كل ما تحتاجه
            بدون خبرة تقنية.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-nados-primary px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-nados-primary-dark"
            >
              أنشئ متجرك مجانًا
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-base font-medium text-gray-700 transition hover:bg-gray-50"
            >
              استكشف الميزات
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-400">بدون بطاقة ائتمان — خطة مجانية دائمة</p>

          {/* Mock dashboard preview */}
          <div className="mx-auto mt-14 max-w-4xl rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl shadow-blue-900/5">
            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="mx-auto rounded-md bg-gray-50 px-3 py-0.5 text-[10px] text-gray-400">
                app.nados.iq/dashboard
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
              {[
                { label: 'الطلبات', value: '128', icon: ShoppingCart, tone: 'text-green-600 bg-green-50' },
                { label: 'المنتجات', value: '45', icon: Package, tone: 'text-blue-600 bg-blue-50' },
                { label: 'العملاء', value: '89', icon: MessageCircle, tone: 'text-purple-600 bg-purple-50' },
                { label: 'الإيرادات', value: '4.2م د.ع', icon: BarChart3, tone: 'text-amber-600 bg-amber-50' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-gray-100 p-4 text-right">
                  <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${s.tone}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">كل ما يحتاجه التاجر العراقي</h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-600">
              منصة واحدة تجمع المتجر والمخزون والتوصيل والدفع والذكاء الاصطناعي
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-gray-200/50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-nados-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">ابدأ البيع في 3 خطوات</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { n: '1', title: 'أنشئ حسابك', desc: 'سجّل برقم هاتفك العراقي — متجرك يُنشأ تلقائيًا مع خطة مجانية.' },
              { n: '2', title: 'أضف منتجاتك', desc: 'الصور والأسعار والمخزون — بواجهة عربية بسيطة ودعم كامل للدينار.' },
              { n: '3', title: 'شارك واستقبل الطلبات', desc: 'رابط متجرك على واتساب وإنستغرام — والبوت يستقبل الطلبات عنك.' },
            ].map((s) => (
              <div key={s.n} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-nados-primary text-xl font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">أسعار بسيطة وشفافة</h2>
            <p className="mt-3 text-gray-600">ابدأ مجانًا وارتقِ عندما ينمو متجرك</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => (
              <div
                key={p.slug}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  p.highlighted
                    ? 'border-nados-primary bg-white shadow-xl shadow-blue-600/10'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {p.highlighted && (
                  <span className="absolute -top-3 right-6 rounded-full bg-nados-primary px-3 py-1 text-xs font-medium text-white">
                    الأكثر شيوعًا
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-gray-900">{p.price}</span>
                  {p.period && <span className="text-sm text-gray-500"> / {p.period}</span>}
                </div>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-nados-secondary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-6 rounded-lg py-2.5 text-center text-sm font-medium transition ${
                    p.highlighted
                      ? 'bg-nados-primary text-white hover:bg-nados-primary-dark'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900 md:text-4xl">الأسئلة الشائعة</h2>
          <div className="mt-10 space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-gray-100 bg-gray-50/50 p-5"
              >
                <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-900">
                  {item.q}
                  <span className="text-nados-primary transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-nados-dark py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-blue-400" />
          <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
            جاهز تنقل متجرك لمستوى جديد؟
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-300">
            انضم لمئات التجار العراقيين الذين يديرون أعمالهم بنادوس — ابدأ مجانًا اليوم.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-nados-primary px-8 py-4 text-base font-semibold text-white transition hover:bg-blue-500"
          >
            أنشئ متجرك مجانًا
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nados-primary text-xs font-bold text-white">
              ن
            </div>
            <span className="font-bold text-gray-900">نادوس</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            New Age Digital Online Service — صُنع بفخر في العراق 🇮🇶
          </p>
          <div className="mt-4 flex items-center justify-center gap-5 text-xs text-gray-400">
            <Link href="/terms" className="hover:text-nados-primary">الشروط</Link>
            <Link href="/privacy" className="hover:text-nados-primary">الخصوصية</Link>
            <Link href="/dashboard" className="hover:text-nados-primary">حالة النظام</Link>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            © {new Date().getFullYear()} نادوس — جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
}
