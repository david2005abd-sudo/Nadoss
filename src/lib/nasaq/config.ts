/**
 * نَسَق — platform configuration.
 * Ported verbatim from APP_CONFIG in the original single-file mockup.
 */

export const BUSINESS_TYPES = [
 { id: 'store', name: 'متجر إلكتروني', shortDesc: 'بيع المنتجات المادية، إدارة المخزون، الفئات، وسلة المشتريات.', icon: 'bag', sampleProject: 'proj_store' },
 { id: 'restaurant', name: 'مطعم أو مقهى', shortDesc: 'منيو رقمي تفاعلي، إدارة الطلبات، الإضافات، التوصيل، وحجوزات الطاولات.', icon: 'utensils', sampleProject: 'proj_restaurant' },
 { id: 'maintenance', name: 'خدمات وصيانة', shortDesc: 'إدارة الخدمات، مواعيد الفحص، المركبات، قطع الغيار، والفواتير.', icon: 'wrench', sampleProject: 'proj_workshop' },
 { id: 'engineering', name: 'هندسة وعمارة', shortDesc: 'إدارة المشاريع الهندسية، معرض الأعمال، عروض الأسعار، وملفات المخططات.', icon: 'compass', sampleProject: 'proj_engineering' },
 { id: 'realestate', name: 'عقارات', shortDesc: 'عرض الوحدات العقارية للبيع والإيجار، طلبات المعاينة، وإدارة العملاء.', icon: 'home', sampleProject: 'proj_realestate' },
 { id: 'beauty', name: 'مركز تجميل أو عيادة', shortDesc: 'حجز المواعيد، قائمة الجلسات والخدمات، وإدارة ملفات العملاء.', icon: 'sparkle', sampleProject: 'proj_workshop' },
 { id: 'education', name: 'تعليم وتدريب', shortDesc: 'عرض الدورات التدريبية، التسجيل، الجداول، والمحتوى التعليمي.', icon: 'book', sampleProject: 'proj_digital' },
 { id: 'digital', name: 'ألعاب ومنتجات رقمية', shortDesc: 'بيع الكتب، القوالب، البرمجيات، والتسليم الرقمي الفوري.', icon: 'cpu', sampleProject: 'proj_digital' },
 { id: 'cards', name: 'بطاقات وشحن إلكتروني', shortDesc: 'إدارة الأكواد الرقمية، مخزون البطاقات، والتسليم الآلي ال.', icon: 'card', sampleProject: 'proj_digital' },
 { id: 'tech', name: 'شركة تقنية أو برمجة', shortDesc: 'عرض الحلول الرقمية، سابقة الأعمال، طلبات عروض الأسعار، والمشاريع.', icon: 'code', sampleProject: 'proj_engineering' },
 { id: 'autoparts', name: 'متجر قطع غيار', shortDesc: 'فهرس أرقام القطع OEM، توافق المركبات، المخزون، والطلبات.', icon: 'cog', sampleProject: 'proj_workshop' },
 { id: 'mixed', name: 'مشروع مختلط', shortDesc: 'دمج مرن بين بيع المنتجات وتقديم الخدمات والحجوزات في لوحة واحدة.', icon: 'layers', sampleProject: 'proj_store' },
 { id: 'other', name: 'نشاط آخر', shortDesc: 'تخصيص كامل للوحدات والأقسام بما يناسب طبيعة عملك الخاصة.', icon: 'grid', sampleProject: 'proj_store' },
] as const;

export type BusinessTypeId = (typeof BUSINESS_TYPES)[number]['id'];

export const SUPPORTED_ACTIVITIES = [
 'المتاجر الإلكترونية', 'متاجر الملابس والأزياء', 'متاجر العطور ومستحضرات التجميل',
 'متاجر الإلكترونيات', 'متاجر قطع غيار السيارات', 'ورش صيانة السيارات',
 'المطاعم', 'المقاهي', 'المخابز والحلويات', 'الشركات الخدمية',
 'خدمات المنازل', 'مكاتب الهندسة المعمارية', 'التصميم الداخلي',
 'المقاولات', 'مكاتب العقارات', 'مراكز التجميل', 'العيادات',
 'مراكز التدريب', 'الخدمات الاستشارية', 'شركات البرمجة والتصميم',
 'متاجر الألعاب الإلكترونية', 'متاجر المنتجات الرقمية',
 'متاجر البطاقات والشحن الإلكتروني', 'شركات الخدمات الذكية',
 'المكتبات', 'المشاريع التعليمية', 'الأنشطة التجارية المختلطة',
];

export const GOALS = [
 { id: 'goal_services', name: 'عرض الخدمات', modules: ['services', 'quotes'] },
 { id: 'goal_products', name: 'بيع المنتجات', modules: ['products', 'categories', 'orders'] },
 { id: 'goal_orders', name: 'استقبال الطلبات', modules: ['orders', 'delivery'] },
 { id: 'goal_bookings', name: 'حجز المواعيد', modules: ['bookings', 'services'] },
 { id: 'goal_quotes', name: 'استقبال طلبات عروض الأسعار', modules: ['quotes', 'invoices'] },
 { id: 'goal_portfolio', name: 'عرض المشاريع السابقة', modules: ['projects', 'portfolio', 'files'] },
 { id: 'goal_digital', name: 'تقديم المنتجات الرقمية', modules: ['products', 'digitalDelivery', 'stock'] },
 { id: 'goal_inventory', name: 'إدارة المخزون', modules: ['inventory', 'spareParts'] },
 { id: 'goal_customers', name: 'إدارة العملاء', modules: ['customers', 'marketing'] },
 { id: 'goal_employees', name: 'إدارة الموظفين', modules: ['employees'] },
] as const;

export const CURRENCIES = [
 'ريال سعودي (ر.س)',
 'درهم إماراتي (د.إ)',
 'دينار كويتي (د.ك)',
 'دينار عراقي (د.ع)',
 'جنيه مصري (ج.م)',
 'دولار أمريكي (USD)',
] as const;

export const LANGUAGES = ['العربية (RTL)', 'العربية مع دعم الإنجليزية'] as const;

export const FONTS = ['Tajawal', 'Almarai', 'Arial / System'] as const;

export const BRAND = {
 name: 'نَسَق',
 short: 'ن',
 tagline: 'منصة إنشاء المواقع وإدارة المشاريع بالذكاء الاصطناعي',
 defaultPrimaryColor: '#5B5CE2',
 storageKey: 'nasaq_state_v1',
};

export const WIZARD_STEPS = [
 '1. نوع النشاط',
 '2. معلومات المشروع',
 '3. أهداف المشروع',
 '4. أقسام لوحة التحكم',
 '5. اختيار القالب',
 '6. المعاينة والإنشاء',
] as const;
