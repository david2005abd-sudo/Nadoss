'use client';

import Link from 'next/link';
import { useNasaq } from '@/lib/nasaq/store';
import { MODULE_REGISTRY } from '@/lib/nasaq/modules';
import { getIcon } from '@/components/nasaq/icons';
import { Breadcrumbs, KpiCard } from '@/components/nasaq/ui';
import { formatIQD } from '@/lib/utils';

/** Business-type aware headline + copy, ported from the mockup. */
const HEADLINES: Record<string, { title: string; desc: string; tips: string[] }> = {
  store: {
    title: 'أداء متجرك اليوم',
    desc: 'لنوبات مختصرة عن المبيعات، الطلبات، وأفضل الأصناف.',
    tips: ['راجع مخزون الأصناف ذات 5 قطع أو أقل', 'فعّل كوبونًا للعملاء العائدين', 'ارد على الطلبات الجديدة أقرب وقت'],
  },
  restaurant: {
    title: 'حركة مطعمك اليوم',
    desc: 'طلبات المنيو، الحجوزات، ومناطق التوصيل.',
    tips: ['راجع حجوزات اليوم والمتاحة', 'ميّز الأصناف الأكثر طلبًا على المنيو', 'تابع حالة طلبات التوصيل الجارية'],
  },
  maintenance: {
    title: 'حركة ورشتك اليوم',
    desc: 'الخدمات، مواعيد الفحص، وقطع الغيار.',
    tips: ['راجع مواعيد فحص اليوم والغد', 'تابع تنبيهات انخفاض المخزون', 'جهز عروض أسعار للطلبات المعلقة'],
  },
  engineering: {
    title: 'لوحة مكتبك الهندسي',
    desc: 'المشاريع، عروض الأسعار، وسابقة الأعمال.',
    tips: ['تابع مرحلة كل مشروع فعال', 'جهز عروض أسعار للفرص الجديدة', 'حدّث معرض الأعمال بمشروع منجز'],
  },
  realestate: {
    title: 'لوحة مكتبك العقاري',
    desc: 'الوحدات المعروضة وحجوزات المعاينات.',
    tips: ['حدّث حالة الوحدات المتاحة', 'تابع طلبات معاينة اليوم', 'راجع حجوزات المعاينات المؤكدة'],
  },
  cards: {
    title: 'منصة البطاقات الرقمية',
    desc: 'رصيد الأكواد والتسليم الفوري.',
    tips: ['تابع رصيد الأكواد الجاهزة', 'راجع الطلبات المكتملة وأكوادها', 'جهز باقة عرض للموزعين'],
  },
  digital: {
    title: 'منتجاتك الرقمية',
    desc: 'التسليم الفوري والدعم.',
    tips: ['تابع حالة التسليمات الفورية', 'راجع أفضل المنتجات الرقمية', 'أضف اشتراكًا شهريًا جديدًا'],
  },
  beauty: {
    title: 'مركزك اليوم',
    desc: 'الحجوزات والخدمات.',
    tips: ['راجع مواعيد اليوم والملغاة', 'فعّل خدمة جديدة للموسم', 'تابع مواعيد أعلى الفروع'],
  },
};

export default function DashboardPage() {
  const { project } = useNasaq();

  if (!project) {
    return (
      <div className="card text-center">
        <h1 className="mb-2 text-lg font-extrabold">لا يوجد مشروع مفعل</h1>
        <p className="mb-4 text-sm text-muted">اختر مشروعًا تجريبيًا من الشريط العلوي أو أنشئ مشروعك الخاص.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/onboarding" className="btn btn-primary btn-sm">أنشئ مشروعًا</Link>
          <Link href="/" className="btn btn-outline btn-sm">الرئيسية</Link>
        </div>
      </div>
    );
  }

  const hero = HEADLINES[project.businessType] ?? HEADLINES.store;

  /* ---- KPIs by business type ---- */
  const productsCount = project.products.length;
  const ordersCount = project.orders.length;
  const menuCount = project.menu.length;
  const servicesCount = project.services.length;
  const customersCount = project.customers.length;
  const bookingsCount = project.bookings.length;

  const totalOrdersRevenue = project.orders.reduce((s, o) => s + (o.total ?? 0), 0);
  const deliveredRevenue = project.orders
    .filter((o) => o.status === 'مكتمل')
    .reduce((s, o) => s + (o.total ?? 0), 0);

  const lowStock = project.products.filter((p) => p.stock <= (p.minStock || 5)).length;

  const visibleModules = project.enabledModules.filter((m) => m !== 'dashboard');

  return (
    <div className="space-y-6">
      <Breadcrumbs items={['نَسَق', project.name, 'نظرة عامة']} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold sm:text-2xl">{hero.title}</h1>
          <p className="mt-1 text-sm text-muted">{hero.desc}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/builder" className="btn btn-outline btn-sm">
            {getIcon('layout', { size: 16 })} محرر موقع المشروع
          </Link>
          <Link href="/dashboard/moduleSettings" className="btn btn-outline btn-sm">
            {getIcon('layers', { size: 16 })} تخصيص الوحدات
          </Link>
        </div>
      </div>

      <div className="grid-4">
        <KpiCard label="المنتجات" value={productsCount} icon={getIcon('bag')} tone="purple" />
        <KpiCard label="الطلبات" value={ordersCount} icon={getIcon('cart')} tone="teal" />
        <KpiCard label="العملاء" value={customersCount} icon={getIcon('users')} tone="green" />
        <KpiCard label="إجمالي الطلبات" value={formatIQD(totalOrdersRevenue)} icon={getIcon('chart')} tone="amber" />
      </div>

      <div className="grid-2 lg:grid-cols-3">
        <div className="card">
          <SpanLabel>الطلبات المكتملة (تجريبي)</SpanLabel>
          <p className="kpi-value">{ordersCount ? Math.round((project.orders.filter((o) => o.status === 'مكتمل').length / ordersCount) * 100) : 0}%</p>
          <p className="mt-1 text-xs text-muted">من إجمالي {ordersCount} طلبًا في هذا المشروع التجريبي.</p>
        </div>
        <div className="card">
          <SpanLabel>إيرادات مؤكدة</SpanLabel>
          <p className="kpi-value">{formatIQD(deliveredRevenue)}</p>
          <p className="mt-1 text-xs text-muted">قيمة الطلبات بحالة «مكتمل» فقط.</p>
        </div>
        <div className="card">
          <SpanLabel>الأصناف منخفضة المخزون</SpanLabel>
          <p className="kpi-value">{lowStock}</p>
          <p className="mt-1 text-xs text-muted">أصناف تحتاج إعادة طلب قريبًا.</p>
        </div>
      </div>

      <div className="grid-3 lg:grid-cols-4">
        <div className="card">
          <SpanLabel>إجمالي الوجبات</SpanLabel>
          <p className="kpi-value">{menuCount}</p>
        </div>
        <div className="card">
          <SpanLabel>الخدمات</SpanLabel>
          <p className="kpi-value">{servicesCount}</p>
        </div>
        <div className="card">
          <SpanLabel>الحجوزات</SpanLabel>
          <p className="kpi-value">{bookingsCount}</p>
        </div>
        <div className="card">
          <SpanLabel>حالة الموقع</SpanLabel>
          <p className="mt-1 text-sm font-bold">{project.siteStatus}</p>
          <p className="mt-1 text-xs text-muted">{project.domain}</p>
        </div>
      </div>

      {/* ---------- Enabled modules ---------- */}
      <div>
        <h2 className="mb-3 text-base font-extrabold">وحدات هذا المشروع ({visibleModules.length})</h2>
        <div className="grid-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleModules.map((mId) => {
            const mod = MODULE_REGISTRY[mId];
            if (!mod) return null;
            return (
              <Link key={mId} href={`/dashboard/${mod.route}`} className="card card-interactive text-center">
                <div className="icon-box mx-auto mb-2">{getIcon(mod.icon)}</div>
                <span className="text-sm font-bold">{mod.name}</span>
                <p className="mt-1 text-xs text-muted">{mod.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ---------- Tips ---------- */}
      <div className="card" style={{ background: 'var(--light-purple)' }}>
        <SpanLabel>نصائح تشغيلية سريعة لهذا النشاط</SpanLabel>
        <ul className="mt-2 space-y-1 text-sm">
          {hero.tips.map((t) => (
            <li key={t} className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SpanLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-muted">{children}</span>;
}
