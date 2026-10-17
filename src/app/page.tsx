'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useNasaq } from '@/lib/nasaq/store';
import { BUSINESS_TYPES, SUPPORTED_ACTIVITIES } from '@/lib/nasaq/config';
import { MODULE_REGISTRY } from '@/lib/nasaq/modules';
import { getIcon } from '@/components/nasaq/icons';

/* ==========================================================================
  Static copy (verbatim from the نَسَق mockup)
  ========================================================================== */

const FEATURES = [
 { title: 'موقع إلكتروني احترافي', desc: 'صفحات متجاوبة وسريعة بهوية عربية واضحة قابلة للتخصيص الفوري.', icon: 'layout' },
 { title: 'لوحة تحكم مخصصة لنشاطك', desc: 'تتغير أقسام ومؤشرات اللوحة تلقائيًا حسب نوع مشروعك دون ازدحام.', icon: 'layers' },
 { title: 'مساعد ذكاء اصطناعي سياقي', desc: 'يكتب أوصاف المنتجات والوجبات ويجهز عروض الأسعار ويحلل المبيعات.', icon: 'sparkle' },
 { title: 'إدارة المنتجات والخدمات', desc: 'جداول مرنة للمنتجات، الوجبات، الخدمات، العقارات، أو قطع الغيار.', icon: 'bag' },
 { title: 'الطلبات والحجوزات', desc: 'تتبع حالات الطلبات خطوة بخطوة وجدولة مواعيد العملاء بسهولة.', icon: 'calendar' },
 { title: 'إدارة العملاء وسجل النشاط', desc: 'ملف متكامل لكل عميل مع إجمالي المشتريات وسجل الطلبات.', icon: 'users' },
 { title: 'تقارير وتحليلات بصرية', desc: 'رسوم بيانية تفاعلية لمقارنة الفترات ومعرفة الأكثر مبيعًا.', icon: 'chart' },
 { title: 'تصميم متجاوب للهاتف', desc: 'إدارة كاملة للمشروع والطلبات من الهاتف أو الحاسوب بنفس الكفاءة.', icon: 'cpu' },
 { title: 'تخصيص وترتيب الوحدات', desc: 'أظهر أو أخفِ أو أعد ترتيب أقسام لوحة التحكم في أي لحظة.', icon: 'cog' },
 { title: 'دعم الأنشطة المختلطة', desc: 'اجمع بين بيع المنتجات وتقديم الخدمات والحجوزات في مساحة عمل واحدة.', icon: 'grid' },
] as const;

const STEPS = [
 { num: '01', title: 'اختر نوع مشروعك', desc: 'حدد نشاطك من بين المتاجر، المطاعم، الورش، الهندسة، العقارات، أو المنتجات الرقمية.' },
 { num: '02', title: 'خصص موقعك وهيتك', desc: 'اختر القالب، الألوان، الخط العربي، وعدّل نصوص وأقسام صفحتك الرئيسية.' },
 { num: '03', title: 'جهز لوحة التحكم', desc: 'يقترح محرك الوحدات الأقسام المناسبة لنشاطك مع حرية التفعيل أو الإخفاء.' },
 { num: '04', title: 'راجع المعاينة الحية', desc: 'عاين موقعك على سطح المكتب والهاتف وجرّب إضافة منتجاتك وطلباتك ال.' },
 { num: '05', title: 'انشر موقعك عند ربط الخادم', desc: 'في بيئة الإنتاج الكاملة، اربط نطاقك الخاص وبوابات الدفع وانطلق رسميًا.' },
] as const;

const AI_EXAMPLES = [
 { role: 'للمتاجر الإلكترونية', prompt: '«اكتب وصفًا تسويقيًا لعطر شرقي فاخر واقترح باقة هدايا»', output: 'يولّد وصفًا جذابًا متوافقًا مع محركات البحث ويقترح حملة كوبونات موسمية.' },
 { role: 'للمطاعم والمقاهي', prompt: '«اقترح عرض غداء ترويجي وحسّن وصف برغر كلاسيكي»', output: 'يصيغ وصفًا شهيًا للوجبة مع اقتراح كومبو يرفع متوسط قيمة الطلب.' },
 { role: 'للخدمات والمكاتب الهندسية', prompt: '«جهز مسودة عرض سعر لتصميم واجهة تجارية أو صيانة دورية»', output: 'يرتب بنود العرض الفني والمالي ومراحل التنفيذ بلهجة احترافية.' },
] as const;

const FAQS = [
 { q: 'هل أحتاج إلى خبرة برمجية؟', a: 'لا إطلاقًا. صُممت المنصة لأصحاح المشاريع الصغيرة والمتوسطة لإنشاء مواقعهم وإدارة أعمالهم عبر واجهة عربية مرئية بالكامل دون كتابة سطر كود واحد.' },
 { q: 'هل يمكن إنشاء أكثر من نوع مشروع؟', a: 'نعم! يمكنك إنشاء متجر إلكتروني، مطعم، ورشة صيانة، مكتب هندسي، أو متجر بطاقات رقمية، والتبديل بينها بضغطة زر من محدد المشاريع في الشريط العلوي.' },
 { q: 'هل أستطيع تخصيص لوحة التحكم؟', a: 'بالتأكيد. من خلال (تخصيص الوحدات) يمكنك إظهار أو إخفاء أي قسم، إعادة ترتيب الأقسام في القائمة الجانبية، وتثبيت وحداتك المفضلة.' },
 { q: 'هل أستطيع ربط نطاق خاص؟', a: 'في هذا النموذج الأولي يمكنك تجربة واجهة إعداد النطاقات ومعاينة حالتها، بينما يتطلب الربط الفعلي لـ DNS خادمًا خلفيًا (Backend) في بيئة الإنتاج.' },
 { q: 'كيف يعمل الذكاء الاصطناعي؟', a: 'يقرأ المساعد الذكي سياق مشروعك الحالي (نوع النشاط والمنتجات أو الخدمات) ليقترح أوصافًا، حملات، وعروض أسعار مناسبة. يعمل بوضع الردود السريعة داخل متصفحك دون إرسال بياناتك لأي جهة خارجية، ويمكن ربطه بمزوّدي ذكاء اصطناعي عند الحاجة.' },
 { q: 'هل أستطيع تغيير القالب؟', a: 'نعم، يمكنك تغيير القالب والألوان والخطوط وترتيب أقسام الصفحة في أي وقت من خلال (محرر الموقع) دون فقدان بيانات منتجاتك أو عملائك.' },
 { q: 'هل أستطيع إدارة الطلبات من الهاتف؟', a: 'نعم، جميع شاشات المنصة ولوحة العميل مصممة باستجابة كاملة للهواتف الذكية والأجهزة اللوحية مع قوائم جانبية مريحة للمس.' },
 { q: 'هل بياناتي محفوظة عند إغلاق الصفحة؟', a: 'نعم، تُحفظ تغييراتك ومشاريعك بأمان في متصفحك عبر localStorage، ويمكنك تصديرها كملف JSON أو إعادة تعيينها متى شئت.' },
] as const;

const NAV_LINKS = [
 { label: 'الرئيسية', href: '#hero' },
 { label: 'المميزات', href: '#features' },
 { label: 'أنواع المشاريع', href: '#business-types' },
 { label: 'معرض القوالب', href: '#templates' },
 { label: 'الأسعار', href: '#pricing' },
 { label: 'الأسئلة الشائعة', href: '#faq' },
] as const;

const DEMO_TABS = [
 { id: 'store', label: 'متجر إلكتروني (متجر ندى)', projId: 'proj_store' },
 { id: 'restaurant', label: 'مطعم ومقهى (مطعم مذاق)', projId: 'proj_restaurant' },
 { id: 'maintenance', label: 'خدمات وصيانة (ورشة المحرك)', projId: 'proj_workshop' },
 { id: 'engineering', label: 'مكتب هندسي (أبعاد للهندسة)', projId: 'proj_engineering' },
 { id: 'cards', label: 'بطاقات رقمية (عالم البطاقات)', projId: 'proj_digital' },
] as const;

const FEATURED_TYPES = ['store', 'restaurant', 'maintenance', 'engineering', 'realestate', 'digital', 'cards', 'tech'] as const;

/* ==========================================================================
  Landing page
  ========================================================================== */

export default function HomePage() {
 const { state, setActiveProject } = useNasaq();
 const [navOpen, setNavOpen] = useState(false);
 const [previewTab, setDemoTab] = useState<string>('store');
 const [openFaq, setOpenFaq] = useState<number>(0);
 const [previewTpl, setPreviewTpl] = useState<string | null>(null);

 const previewProject = state.projects.find((p) => p.id === previewTab) ?? state.projects[0];
 const previewTemplate = state.templates.find((t) => t.id === previewTpl);

 return (
  <div>
   {/* ================= HEADER ================= */}
   <header className="nq-reveal landing-header">
    <div className="nasaq-container flex h-16 items-center justify-between gap-3">
     <a href="#hero" className="brand-logo">
      <span className="brand-mark">ن</span>
      <span className="font-extrabold">نَسَق</span>
     </a>

     <nav
      id="landing-nav-links"
      className={`nav-links items-center gap-6 ${navOpen ? 'mobile-open flex' : 'hidden lg:flex'}`}
      aria-label="التنقل الرئيسي"
     >
      {NAV_LINKS.map((l) => (
       <a key={l.href} href={l.href} className="nav-link" onClick={() => setNavOpen(false)}>
        {l.label}
       </a>
      ))}
     </nav>

     <div className="flex items-center gap-2">
      <Link href="/admin/overview" className="btn btn-sm btn-ghost hide-sm" title="فتح لوحة المالك">
       لوحة المالك
      </Link>
      <Link href="/login" className="btn btn-sm btn-outline">
       تسجيل الدخول
      </Link>
      <Link href="/onboarding" className="btn btn-sm btn-primary">
       ابدأ مجانًا
      </Link>
      <button
       type="button"
       className="btn btn-ghost !px-2 lg:hidden"
       aria-label="القائمة"
       aria-expanded={navOpen}
       onClick={() => setNavOpen((v) => !v)}
      >
       {getIcon(navOpen ? 'x' : 'menu', { size: 20 })}
      </button>
     </div>
    </div>
   </header>

   {/* ================= HERO ================= */}
   <section id="hero" className="hero-section">
    <div className="nasaq-container hero-grid">
     <div>
      <span className="badge badge-primary mb-4 inline-block">منصة عربية متعددة الأنشطة مدعومة بالذكاء الاصطناعي</span>
      <h1 className="hero-title">
       مشروعك يستحق موقعًا يدير أعماله، لا مجرد صفحة تعرضه.
      </h1>
      <p className="hero-desc">
       أنشئ موقع مشروعك وأدر منتجاتك وخدماتك وعملائك من مكان واحد، مع لوحة تحكم مصممة حسب نشاطك ومساعد ذكاء
       اصطناعي يساعدك على التطور.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
       <Link href="/onboarding" className="btn btn-lg btn-primary">
        <span>أنشئ موقعك مجانًا</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
       </Link>
       <a href="#interactive-preview" className="btn btn-lg btn-outline">
        استكشف المنصة
       </a>
       <Link href="/dashboard" className="btn btn-lg btn-secondary">
        دخول لوحة التحكم
       </Link>
      </div>
      <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
       {[
        'لوحة تتكيف مع 27+ نشاطًا تجاريًا',
        'بدون خبرة برمجية',
        'محرك وحدات ذكي قابل للتخصيص',
       ].map((t) => (
        <li key={t} className="flex items-center gap-1.5">
         <span className="nq-check" aria-hidden="true">✓</span>
         <span>{t}</span>
        </li>
       ))}
      </ul>
     </div>

     <div className="hero-composition" aria-label="معاينة تفاعلية لمكونات المنصة">
      <button type="button" className="mini-ui-card text-right" onClick={() => setActiveProject('proj_store')}>
       <div className="flex items-center justify-between">
        <span className="badge badge-primary">متجر إلكتروني</span>
        <span className="badge badge-success">نشط</span>
       </div>
       <p className="text-xs text-muted">متجر ندى</p>
       <p className="text-sm font-bold">عطر شرقي فاخر — 1,150,000 د.ع</p>
       <p className="mb-2 text-xs text-muted">المخزون: 34 قطعة • 6 منتجات نشطة</p>
       <span className="text-xs font-bold text-primary">فتح لوحة المتجر ←</span>
      </button>

      <button type="button" className="mini-ui-card text-right" onClick={() => setActiveProject('proj_restaurant')}>
       <span className="badge badge-secondary">مطعم ومقهى</span>
       <p className="text-xs text-muted">مطعم مذاق</p>
       <p className="text-sm font-bold">برغر كلاسيكي مشوي — 16,000 د.ع</p>
       <p className="mb-2 text-xs text-muted">المنيو الرقمي • 18 طلبًا اليوم</p>
       <span className="text-xs font-bold text-primary">معاينة المنيو والطلبات ←</span>
      </button>

      <div className="mini-ui-card">
       <p className="text-sm font-bold">لوحة إدارة مخصصة</p>
       <span className="badge badge-muted">مؤشر مباشر</span>
       <p className="text-xl font-extrabold text-primary">104,500,000 د.ع</p>
       <p className="mt-1 text-xs text-muted">مبيعات (+18% هذا الشهر)</p>
       <div className="flex h-8 items-end gap-1">
        {[40, 65, 45, 80, 60].map((h, i) => (
         <div key={i} className="chart-bar" style={{ height: `${h}%` }} />
        ))}
       </div>
      </div>

      <Link href="/ai-assistant" className="mini-ui-card text-right">
       <span className="badge badge-primary">مساعد الذكاء الاصطناعي</span>
       <p className="mb-2 text-xs text-muted">سياقي</p>
       <p className="mb-2 text-xs text-muted">
        &ldquo;لاحظت أن (عطر شرقي فاخر) يمثل 42% من المبيعات ال. هل نجهز باقة هدايا لزيادة متوسط السلة؟&rdquo;
       </p>
       <span className="text-xs font-bold text-primary">تجربة المساعد الذكي ←</span>
      </Link>
     </div>
    </div>
   </section>

   {/* ================= BUSINESS TYPES ================= */}
   <section id="business-types" className="nq-reveal section-block section-block-alt">
    <div className="nasaq-container">
     <div className="section-header">
      <span className="section-badge">تخصيص ذكي حسب القطاع</span>
      <h2 className="section-title">منصة واحدة تتشكل حسب طبيعة نشاطك التجاري</h2>
      <p className="section-desc">
       لا نعرض عليك عشرات الأقسام غير المفيدة؛ بل يختار محرك الوحدات الأقسام التي يحتاجها مشروعك فعلًا مع
       حرية التعديل الكاملة.
      </p>
     </div>

     <div className="grid-4">
      {FEATURED_TYPES.map((tId) => {
       const bt = BUSINESS_TYPES.find((b) => b.id === tId);
       if (!bt) return null;
       return (
        <button
         key={bt.id}
         type="button"
         className="card card-interactive flex-col justify-between text-right"
         onClick={() => {
          setActiveProject(bt.sampleProject);
          window.location.href = `/dashboard`;
         }}
        >
         <div>
          <div className="icon-box mb-2">{getIcon(bt.icon, { size: 22 })}</div>
          <h3 className="mb-1 text-base">{bt.name}</h3>
          <p className="mb-3 text-xs text-muted">{bt.shortDesc}</p>
         </div>
         <div className="flex items-center justify-between border-t border-muted-surface pt-2">
          <span className="text-xs font-bold text-primary">معاينة النشاط واللوحة ←</span>
          <span className="badge badge-muted">تفاعلي</span>
         </div>
        </button>
       );
      })}
     </div>

     <div className="card mt-4" style={{ background: 'var(--muted-surface)' }}>
      <div className="mb-2 text-center text-sm font-bold">
       ندعم أكثر من 27 نشاطًا تجاريًا متخصصًا ومختلطًا:
      </div>
      <div className="flex flex-wrap justify-center gap-2">
       {SUPPORTED_ACTIVITIES.map((act) => (
        <span key={act} className="activity-pill">{act}</span>
       ))}
      </div>
     </div>
    </div>
   </section>

   {/* ================= INTERACTIVE DEMO ================= */}
   <section id="interactive-preview" className="nq-reveal section-block">
    <div className="nasaq-container">
     <div className="section-header">
      <span className="section-badge section-badge-secondary">معاينة تفاعلية فورية</span>
      <h2 className="section-title">جرّب بنفسك كيف يتغير الموقع ولوحة التحكم بتغيير النشاط</h2>
      <p className="section-desc">
       بدّل بين الأنشطة أدناه لترى كيف تتغير وحدات لوحة العميل ومعاينة الموقع ومقترحات الذكاء الاصطناعي فورًا.
      </p>
     </div>

     {previewProject && (
      <>
       <div className="nq-tabs-bar nq-reveal mb-4 flex flex-wrap justify-center gap-2">
        {DEMO_TABS.map((t) => (
         <button
          key={t.id}
          type="button"
          className={`nq-tab-btn ${previewTab === t.id ? 'active' : ''}`}
          onClick={() => setDemoTab(t.id)}
         >
          {t.label}
         </button>
        ))}
       </div>

       <div className="grid-2">
        <div className="card" style={{ background: 'var(--muted-surface)' }}>
         <div className="mb-2 flex items-center justify-between">
          <span className="badge badge-primary">الأقسام المفعلة في لوحة العميل</span>
          <span className="text-xs text-muted">تتغير تلقائيًا حسب النشاط</span>
         </div>
         <h3 className="mb-2 text-lg">{previewProject.name} — ({previewProject.city})</h3>
         <p className="mb-3 text-sm text-muted">{previewProject.description}</p>
         <div className="mb-4 flex flex-wrap gap-2">
          {previewProject.enabledModules.map((mId) => (
           <span
            key={mId}
            className="badge badge-secondary"
            style={{ background: '#fff', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
           >
            {MODULE_REGISTRY[mId]?.name ?? mId}
           </span>
          ))}
         </div>
         <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard" className="btn btn-primary btn-sm" onClick={() => setActiveProject(previewProject.id)}>
           افتح لوحة تحكم هذا المشروع ←
          </Link>
          <Link href="/builder" className="btn btn-outline btn-sm" onClick={() => setActiveProject(previewProject.id)}>
           افتح محرر موقع المشروع
          </Link>
         </div>
        </div>

        <div className="card">
         <div className="mb-2 flex items-center justify-between">
          <Link href={`/store/${previewProject.id}`} className="badge badge-secondary hover:underline">معاينة موقع المشروع ←</Link>
          <span className="text-xs text-muted">{previewProject.domain}</span>
         </div>
         <div
          className="rounded-lg border border-border p-4"
          style={{ background: `linear-gradient(180deg, ${previewProject.primaryColor}12 0%, #FFFFFF 100%)` }}
         >
          <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
           <span className="font-extrabold" style={{ color: previewProject.primaryColor }}>
            {previewProject.builder.logoText}
           </span>
           <span className="badge badge-muted">قالب متجاوب</span>
          </div>
          <h4 className="mb-1 text-base">{previewProject.builder.heroTitle}</h4>
          <p className="mb-3 text-xs text-muted">{previewProject.builder.heroSubtitle}</p>
          <div className="mb-2 text-xs font-bold">أقسام الصفحة المفعلة لهذا النشاط:</div>
          <div className="flex flex-wrap gap-1">
           {previewProject.builder.sections.filter((s) => s.visible).map((s) => (
            <span key={s.id} className="badge badge-muted">{s.title}</span>
           ))}
          </div>
         </div>
        </div>
       </div>
      </>
     )}
    </div>
   </section>

   {/* ================= FEATURES ================= */}
   <section id="features" className="nq-reveal section-block section-block-alt">
    <div className="nasaq-container">
     <div className="section-header">
      <span className="section-badge">مميزات المنصة</span>
      <h2 className="section-title">كل ما يحتاجه مشروعك للنمو في مكان واحد</h2>
      <p className="section-desc">
       جمعنا أدوات بناء المواقع، وإدارة العمليات اليومية، والذكاء الاصطناعي في تجربة عربية سلسة.
      </p>
     </div>
     <div className="grid-3">
      {FEATURES.map((f) => (
       <div key={f.title} className="card">
        <div className="icon-box mb-2">{getIcon(f.icon, { size: 22 })}</div>
        <h3 className="mb-1 text-base">{f.title}</h3>
        <p className="text-sm text-muted">{f.desc}</p>
       </div>
      ))}
     </div>
    </div>
   </section>

   {/* ================= HOW IT WORKS ================= */}
   <section id="how-it-works" className="nq-reveal section-block">
    <div className="nasaq-container">
     <div className="section-header">
      <span className="section-badge section-badge-secondary">خطوات واضحة</span>
      <h2 className="section-title">كيف يعمل نَسَق في 5 خطوات؟</h2>
      <p className="section-desc">رحلة إعداد سريعة تنقلك من الفكرة إلى موقع ولوحة إدارة جاهزة للعمل.</p>
     </div>
     <div className="grid-3">
      {STEPS.map((s) => (
       <div key={s.num} className="card">
        <span className="badge badge-primary mb-2">الخطوة {s.num}</span>
        <h3 className="mb-1 text-base">{s.title}</h3>
        <p className="text-sm text-muted">{s.desc}</p>
       </div>
      ))}
     </div>
    </div>
   </section>

   {/* ================= AI SHOWCASE ================= */}
   <section id="ai-showcase" className="nq-reveal section-block section-block-alt">
    <div className="nasaq-container">
     <div className="section-header">
      <span className="section-badge">ذكاء اصطناعي يفهم نشاطك</span>
      <h2 className="section-title">مساعد ذكي مدمج في كل خطوة، وليس مجرد زر زخرفي</h2>
      <p className="section-desc">
       يتعرف المساعد على نوع مشروعك ويقترح أوصاف المنتجات، خطط التسويق، عروض الأسعار، وتحليل البيانات ال.
      </p>
     </div>

     <div className="grid-3">
      {AI_EXAMPLES.map((ex) => (
       <div key={ex.prompt} className="card">
        <span className="badge badge-secondary mb-2">{ex.role}</span>
        <div className="mb-2 text-sm font-bold">{ex.prompt}</div>
        <p className="text-xs text-muted">{ex.output}</p>
       </div>
      ))}
     </div>

     <div className="card mt-4" style={{ background: 'var(--light-purple)' }}>
      <span className="badge badge-warning mb-1">تنبيه الشفافية التقنية</span>
      <p className="font-bold">وضع الردود السريعة</p>
      <p className="mt-1 text-sm text-muted">
       يعمل المساعد داخل متصفحك دون إرسال بياناتك لأي خادم خارجي، ويمكن ربطه بمزوّدي ذكاء اصطناعي عند الحاجة.
      </p>
      <Link href="/ai-assistant" className="btn btn-primary mt-3">
       افتح المساعد الذكي الآن
      </Link>
     </div>
    </div>
   </section>

   {/* ================= TEMPLATES ================= */}
   <section id="templates" className="nq-reveal section-block">
    <div className="nasaq-container">
     <div className="section-header">
      <span className="section-badge section-badge-secondary">معرض القوالب</span>
      <h2 className="section-title">قوالب عربية احترافية مصممة لكل قطاع</h2>
      <p className="section-desc">
       اختر القالب الأنسب لنشاطك وعدّل ألوانه وأقسامه ومحتواه في أي وقت من محرر الموقع.
      </p>
     </div>
     <div className="grid-3">
      {state.templates.map((tpl) => (
       <div key={tpl.id} className="card flex-col justify-between">
        <div>
         <div
          className="mb-3 flex flex-col justify-between p-3"
          style={{
           height: 120,
           borderRadius: 8,
           background: `linear-gradient(135deg, ${tpl.accent}24, ${tpl.accent}08)`,
           border: `1px solid ${tpl.accent}33`,
          }}
         >
          <div className="flex items-center justify-between">
           <span className="badge" style={{ background: tpl.accent, color: '#fff' }}>
            {tpl.businessLabel}
           </span>
           <span className="text-xs font-bold" style={{ color: tpl.accent }}>RTL Ready</span>
          </div>
          <div>
           <div style={{ height: 8, width: '70%', background: tpl.accent, borderRadius: 4, marginBottom: 6, opacity: 0.75 }} />
           <div style={{ height: 6, width: '45%', background: tpl.accent, borderRadius: 4, opacity: 0.4 }} />
          </div>
         </div>
         <h3 className="mb-1 text-base">{tpl.name}</h3>
         <p className="mb-3 text-xs text-muted">{tpl.desc}</p>
        </div>
        <div className="flex items-center gap-2">
         <button type="button" className="btn btn-sm btn-outline" style={{ flex: 1 }} onClick={() => setPreviewTpl(tpl.id)}>
          معاينة القالب
         </button>
         <Link
          href="/onboarding"
          className="btn btn-sm btn-primary"
          style={{ flex: 1 }}
          onClick={() => window.localStorage.setItem('nasaq_pending_template', JSON.stringify({ businessType: tpl.businessType, templateId: tpl.id }))}
         >
          اختيار القالب
         </Link>
        </div>
       </div>
      ))}
     </div>
    </div>
   </section>

   {/* ================= PRICING ================= */}
   <section id="pricing" className="nq-reveal section-block section-block-alt">
    <div className="nasaq-container">
     <div className="section-header">
      <span className="badge badge-warning mb-2">أسعار توضيحية قابلة للتعديل</span>
      <h2 className="section-title">باقات مرنة تنمو مع حجم أعمالك</h2>
      <p className="section-desc">
       الأسعار المعروضة أدناه قابلة للتعديل والإدارة مباشرة من لوحة المالك.
      </p>
     </div>
     <div className="grid-3">
      {state.plans.filter((p) => p.status === 'نشطة').map((pl) => (
       <div
        key={pl.id}
        className="card flex-col justify-between"
        style={{ borderWidth: pl.popular ? 2 : 1, borderColor: pl.popular ? 'var(--primary)' : 'var(--border)' }}
       >
        <div>
         <div className="mb-2 flex items-center justify-between">
          <span className="text-lg font-extrabold">{pl.nameAr}</span>
          {pl.popular ? <span className="badge badge-primary">الأكثر اختيارًا</span> : <span className="badge badge-muted">خطة </span>}
         </div>
         <div className="my-3">
          <span className="text-3xl font-extrabold text-primary">{pl.price}</span>
          <span className="text-sm text-muted"> د.ع / {pl.period}</span>
         </div>
         <ul className="mb-4 flex-col gap-2 text-sm">
          <li>✓ الحد الأقصى للمشاريع: <strong>{pl.maxProjects}</strong></li>
          <li>✓ عدد الصفحات: <strong>حتى {pl.maxPages} صفحة</strong></li>
          <li>✓ حصة الذكاء الاصطناعي: <strong>{pl.aiLimit}</strong></li>
          <li>✓ التخزين: <strong>{pl.storage}</strong></li>
          <li>✓ الوحدات: <strong>{pl.availableModules}</strong></li>
         </ul>
        </div>
        <Link href="/onboarding" className={`btn ${pl.popular ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%' }}>
         ابدأ بهذه الباقة 
        </Link>
       </div>
      ))}
     </div>
    </div>
   </section>

   {/* ================= FAQ ================= */}
   <section id="faq" className="nq-reveal section-block">
    <div className="nasaq-container">
     <div className="section-header">
      <span className="section-badge">الأسئلة الشائعة</span>
      <h2 className="section-title">إجابات واضحة وصريحة حول المنصة</h2>
     </div>
     <div className="mx-auto max-w-3xl space-y-3">
      {FAQS.map((item, idx) => (
       <div key={item.q} className="faq-item">
        <button
         type="button"
         className="faq-question"
         aria-expanded={openFaq === idx}
         onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
        >
         <span>{item.q}</span>
         <span className="font-extrabold text-primary">{openFaq === idx ? '−' : '+'}</span>
        </button>
        {openFaq === idx && <div className="faq-answer text-sm">{item.a}</div>}
       </div>
      ))}
     </div>
    </div>
   </section>

   {/* ================= FOOTER ================= */}
   <footer className="border-t border-border bg-surface py-10">
    <div className="nasaq-container">
     <div className="grid-2 lg:grid-cols-4">
      <div>
       <div className="brand-logo mb-3">
        <span className="brand-mark">ن</span>
        <span className="font-extrabold">نَسَق</span>
       </div>
       <p className="text-sm text-muted">
        منصة SaaS عربية متعددة الأنشطة لإنشاء المواقع الإلكترونية وإدارة المشاريع الصغيرة والمتوسطة
        بالذكاء الاصطناعي (نموذج تفاعلي متكامل).
       </p>
      </div>

      <div>
       <h3 className="mb-3 text-sm font-bold">روابط سريعة</h3>
       <ul className="space-y-2 text-sm text-muted">
        <li><a href="#hero" className="hover:text-primary">نبذة عن المنصة</a></li>
        <li><a href="#features" className="hover:text-primary">المميزات</a></li>
        <li><a href="#pricing" className="hover:text-primary">الأسعار</a></li>
        <li><a href="#templates" className="hover:text-primary">معرض القوالب</a></li>
       </ul>
      </div>

      <div>
       <h3 className="mb-3 text-sm font-bold">روابط سريعة</h3>
       <ul className="space-y-2 text-sm text-muted">
        <li><Link href="/onboarding" className="hover:text-primary">معالج إنشاء مشروع (6 خطوات)</Link></li>
        <li><Link href="/dashboard" className="hover:text-primary">لوحة تحكم العميل</Link></li>
        <li><Link href="/builder" className="hover:text-primary">محرر المواقع التفاعلي</Link></li>
        <li><Link href="/admin/overview" className="hover:text-primary">لوحة مالك المنصة (Super Admin)</Link></li>
       </ul>
      </div>

      <div>
       <h3 className="mb-3 text-sm font-bold">المساعدة والسياسات</h3>
       <ul className="space-y-2 text-sm text-muted">
        <li>مركز المساعدة والدعم</li>
        <li>سياسة الخصوصية والبيانات المحلية</li>
        <li>شروط الاستخدام والحدود التقنية</li>
        <li>معلومات التواصل</li>
       </ul>
      </div>
     </div>

     <div className="mt-8 border-t border-border pt-5 text-center text-xs text-muted">
      <p>© 2026 نَسَق — جميع الحقوق محفوظة</p>
      <p className="mt-1">الوضع النهاري القياسي • RTL • متوافق مع الهواتف والشاشات الواسعة</p>
     </div>
    </div>
   </footer>

   {/* ================= TEMPLATE PREVIEW MODAL ================= */}
   {previewTemplate && (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setPreviewTpl(null)}>
     <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
       <h2 className="text-base font-bold">{previewTemplate.name}</h2>
       <button type="button" className="btn btn-ghost !px-2" onClick={() => setPreviewTpl(null)} aria-label="إغلاق">✕</button>
      </div>
      <div className="modal-body">
       <div
        className="flex h-44 flex-col justify-between rounded-lg border border-border p-4"
        style={{ background: `linear-gradient(135deg, ${previewTemplate.accent}1A, #FFFFFF)` }}
       >
        <div className="flex items-center justify-between">
         <span className="badge" style={{ background: previewTemplate.accent, color: '#fff' }}>
          {previewTemplate.businessLabel}
         </span>
         <span className="text-xs font-bold" style={{ color: previewTemplate.accent }}>RTL Ready</span>
        </div>
        <div>
         <div style={{ height: 12, width: '72%', background: previewTemplate.accent, borderRadius: 6, marginBottom: 8, opacity: 0.8 }} />
         <div style={{ height: 8, width: '50%', background: previewTemplate.accent, borderRadius: 4, opacity: 0.45 }} />
        </div>
       </div>
       <p className="text-sm text-muted">{previewTemplate.desc}</p>
      </div>
      <div className="modal-footer">
       <button type="button" className="btn btn-outline btn-sm" onClick={() => setPreviewTpl(null)}>إغلاق</button>
       <Link
        href="/onboarding"
        className="btn btn-primary btn-sm"
        onClick={() => window.localStorage.setItem('nasaq_pending_template', JSON.stringify({ businessType: previewTemplate.businessType, templateId: previewTemplate.id }))}
       >
        اختيار القالب
       </Link>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}
