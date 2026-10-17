'use client';

import Link from 'next/link';
import { useNasaq } from '@/lib/nasaq/store';
import { MODULE_REGISTRY } from '@/lib/nasaq/modules';
import { getIcon } from '@/components/nasaq/icons';
import { Breadcrumbs } from '@/components/nasaq/ui';
import { AnimatedKpi, LiveDot, StatBar, TiltCard, Reveal } from '@/components/nasaq/interactive';
import { formatIQD, formatPrice } from '@/lib/utils';

/** عناوين ونصائح حسب نوع النشاط. */
const HEADLINES: Record<string, { title: string; desc: string; tips: string[] }> = {
  store: {
    title: 'أداء متجرك اليوم',
    desc: 'ملخص المبيعات والطلبات وأفضل الأصناف.',
    tips: [
      'راجع الأصناف التي كميتها 5 قطع أو أقل',
      'فعّل كوبون خصم للعملاء العائدين',
      'رد على الطلبات الجديدة في أقرب وقت',
    ],
  },
  restaurant: {
    title: 'حركة مطعمك اليوم',
    desc: 'طلبات المنيو والحجوزات ومناطق التوصيل.',
    tips: [
      'راجع حجوزات اليوم والطاولات المتاحة',
      'ميّز الأصناف الأكثر طلبًا على المنيو',
      'تابع حالة طلبات التوصيل الجارية',
    ],
  },
  maintenance: {
    title: 'حركة ورشتك اليوم',
    desc: 'الخدمات ومواعيد الفحص وقطع الغيار.',
    tips: [
      'راجع مواعيد فحص اليوم والغد',
      'تابع تنبيهات انخفاض المخزون',
      'جهز عروض أسعار للطلبات المعلقة',
    ],
  },
  engineering: {
    title: 'لوحة مكتبك الهندسي',
    desc: 'المشاريع وعروض الأسعار وسابقة الأعمال.',
    tips: [
      'تابع مرحلة كل مشروع فعال',
      'جهز عروض أسعار للفرص الجديدة',
      'حدّث معرض الأعمال بمشروع منجز',
    ],
  },
  realestate: {
    title: 'لوحة مكتبك العقاري',
    desc: 'الوحدات المعروضة وحجوزات المعاينات.',
    tips: [
      'حدّث حالة الوحدات المتاحة',
      'تابع طلبات معاينة اليوم',
      'راجع حجوزات المعاينات المؤكدة',
    ],
  },
  cards: {
    title: 'منصة البطاقات الرقمية',
    desc: 'رصيد الأكواد والتسليم الفوري.',
    tips: [
      'تابع رصيد الأكواد الجاهزة',
      'راجع الطلبات المكتملة وأكوادها',
      'جهز باقة عرض للموزعين',
    ],
  },
  digital: {
    title: 'منتجاتك الرقمية',
    desc: 'التسليم الفوري والدعم.',
    tips: [
      'تابع حالة التسليمات الفورية',
      'راجع أفضل المنتجات الرقمية',
      'أضف اشتراكًا شهريًا جديدًا',
    ],
  },
  beauty: {
    title: 'مركزك اليوم',
    desc: 'الحجوزات والخدمات.',
    tips: [
      'راجع مواعيد اليوم والملغاة',
      'فعّل خدمة جديدة للموسم',
      'تابع أعلى الخدمات حجزًا',
    ],
  },
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  'جديد': 'جديد',
  'قيد التجهيز': 'قيد التجهيز',
  'بانتظار التوصيل': 'بانتظار التوصيل',
  'مكتمل': 'مكتمل',
  'ملغي': 'ملغي',
};

export default function DashboardPage() {
  const { project, state } = useNasaq();

  if (!project) {
    return (
      <div className="card text-center">
        <h1 className="mb-2 text-lg font-extrabold">لا يوجد مشروع مفعل</h1>
        <p className="mb-4 text-sm text-muted">اختر مشروعًا من الشريط العلوي أو أنشئ مشروعك الخاص.</p>
        <div className="flex justify-center gap-2">
          <Link href="/onboarding" className="btn btn-primary btn-sm">أنشئ مشروعًا</Link>
          <Link href="/" className="btn btn-outline btn-sm">الرئيسية</Link>
        </div>
      </div>
    );
  }

  const hero = HEADLINES[project.businessType] ?? HEADLINES.store;

  /* -------- المؤشرات -------- */
  const productsCount = project.products.length;
  const ordersCount = project.orders.length;
  const customersCount = project.customers.length;
  const menuCount = project.menu.length;
  const servicesCount = project.services.length;
  const bookingsCount = project.bookings.length;

  const totalOrdersValue = project.orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const completedOrders = project.orders.filter((o) => o.status === 'مكتمل');
  const deliveredRevenue = completedOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const pendingOrders = project.orders.filter((o) => o.status === 'جديد' || o.status === 'قيد التجهيز');
  const lowStock = project.products.filter((p) => p.stock > 0 && p.stock <= (p.minStock ?? 5));
  const outOfStock = project.products.filter((p) => p.stock === 0);

  const recentOrders = [...project.orders]
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .slice(0, 6);

  const visibleModules = project.enabledModules.filter((m) => m !== 'dashboard');
  const money = (n: number) => formatPrice(n, project.currency);

  return (
    <div className="space-y-6 nq-reveal">
      <Breadcrumbs items={['نَسَق', project.name, 'نظرة عامة']} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold sm:text-2xl">{hero.title}</h1>
          <p className="mt-1 text-sm text-muted">{hero.desc}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/builder" className="btn btn-outline btn-sm">
            {getIcon('layout', { size: 16 })} محرر الموقع
          </Link>
          <Link href="/dashboard/moduleSettings" className="btn btn-outline btn-sm">
            {getIcon('layers', { size: 16 })} تخصيص الوحدات
          </Link>
        </div>
      </div>

      {/* -------- KPIs -------- */}
      <div className="grid-4 nq-reveal nq-stagger">
        <AnimatedKpi label="المنتجات" value={productsCount} icon="bag" tone="purple" />
        <AnimatedKpi label="الطلبات" value={ordersCount} icon="cart" tone="teal" />
        <AnimatedKpi label="العملاء" value={customersCount} icon="users" tone="green" />
        <AnimatedKpi label="قيمة الطلبات" value={money(totalOrdersValue)} icon="chart" tone="amber" />
      </div>

      <div className="grid-2 lg:grid-cols-3">
        <div className="card">
          <span className="text-xs text-muted">طلبات مكتملة</span>
          <p className="kpi-value">
            {ordersCount ? Math.round((completedOrders.length / ordersCount) * 100) : 0}%
          </p>
          <p className="mt-1 text-xs text-muted">
            {completedOrders.length} من {ordersCount} طلبًا في هذا المشروع.
          </p>
        </div>
        <div className="card">
          <span className="text-xs text-muted">إيرادات مؤكدة</span>
          <p className="kpi-value">{money(deliveredRevenue)}</p>
          <p className="mt-1 text-xs text-muted">قيمة الطلبات بحالة «مكتمل».</p>
        </div>
        <div className="card">
          <span className="text-xs text-muted">بانتظار المعالجة</span>
          <p className="kpi-value">{pendingOrders.length}</p>
          <p className="mt-1 text-xs text-muted">طلبات جديدة أو قيد التجهيز.</p>
        </div>
      </div>

      <div className="grid-2 lg:grid-cols-4">
        <div className="card">
          <span className="text-xs text-muted">الوجبات (المنيو)</span>
          <p className="kpi-value">{menuCount}</p>
        </div>
        <div className="card">
          <span className="text-xs text-muted">الخدمات</span>
          <p className="kpi-value">{servicesCount}</p>
        </div>
        <div className="card">
          <span className="text-xs text-muted">الحجوزات</span>
          <p className="kpi-value">{bookingsCount}</p>
        </div>
        <div className="card">
          <span className="text-xs text-muted">أصناف تحتاج متابعة</span>
          <p className="kpi-value">{lowStock.length + outOfStock.length}</p>
          <p className="mt-1 text-xs text-muted">
            {lowStock.length} منخفضة • {outOfStock.length} نفذت
          </p>
        </div>
      </div>

      {/* -------- Recent orders -------- */}
      <div className="card !p-0 nq-reveal">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">آخر الطلبات</h2>
          <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">
            عرض الكل
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{order.number}</p>
                  <p className="text-xs text-muted">
                    {order.customer} • {order.date}
                  </p>
                </div>
                <div className="shrink-0 text-left">
                  <p className="text-sm font-bold">{money(order.total)}</p>
                  <p className="text-xs text-muted">{ORDER_STATUS_LABELS[order.status] ?? order.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-sm text-muted">
            لا توجد طلبات بعد — شارك رابط متجرك لتبدأ البيع.
          </div>
        )}
      </div>

      {/* -------- Store link -------- */}
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs text-muted">رابط متجرك</span>
          <p className="mt-1 text-sm font-bold">
            {project.siteStatus} — <span dir="ltr" className="font-mono text-xs">{project.domain}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/content" className="btn btn-outline btn-sm">إدارة الصفحات</Link>
          <Link href="/builder" className="btn btn-primary btn-sm">معاينة الموقع</Link>
        </div>
      </div>

      {/* -------- Enabled modules -------- */}
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

      {/* -------- Tips -------- */}
      <div className="card" style={{ background: 'var(--light-purple)' }}>
        <span className="text-xs text-muted">نصائح تشغيلية لهذا النشاط</span>
        <ul className="mt-2 space-y-1 text-sm">
          {hero.tips.map((t) => (
            <li key={t} className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted">
        أنت تشاهد مشروع «{project.name}» ضمن {state.projects.length} مشاريع في حسابك — بدّل بينها من القائمة أعلى
        الشاشة.
      </p>
    </div>
  );
}
