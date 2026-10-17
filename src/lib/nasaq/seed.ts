/**
 * نَسَق — بيانات المنصة الأولية (المشاريع، القوالب، الباقات، المشتركون، المزودون).
 * تُشتق من مواصفات واجهات المنصة وتُستخدم كحالة ابتدائية للمتاجر.
 */

import { BUSINESS_DEFAULT_MODULES } from './modules';

/* ==========================================================================
  1. TYPES
  ========================================================================== */

export type BuilderSectionType =
 | 'Hero'
 | 'Products'
 | 'Menu'
 | 'Services'
 | 'Portfolio'
 | 'Properties'
 | 'About'
 | 'Testimonials'
 | 'FAQ'
 | 'Contact'
 | 'Footer';

export type BuilderSection = {
 id: string;
 type: BuilderSectionType;
 title: string;
 content: string;
 visible: boolean;
};

export type Product = {
 id: string;
 name: string;
 category: string;
 price: number;
 stock: number;
 minStock: number;
 sales: number;
 status: string;
 featured?: boolean;
};

export type Category = {
 id: string;
 name: string;
 description: string;
};

export type Order = {
 id: string;
 number: string;
 customer: string;
 date: string;
 items: string;
 total: number;
 status: string;
 history: string[];
};

export type Customer = {
 id: string;
 name: string;
 phone: string;
 city: string;
 ordersCount: number;
 totalSpent: number;
 lastActivity: string;
};

export type Employee = {
 id: string;
 name: string;
 role: string;
 status: string;
 allowedModules: string;
};

export type PageItem = {
 id: string;
 title: string;
 slug: string;
 seoDesc: string;
 status: string;
};

export type Coupon = {
 id: string;
 code: string;
 discount: string;
 uses: number;
 status: string;
};

export type Invoice = {
 id: string;
 client: string;
 amount: number;
 date: string;
 status: string;
};

export type Quote = {
 id: string;
 client: string;
 title: string;
 amount: number;
 status: string;
};

export type Service = {
 id: string;
 name: string;
 description: string;
 price: number;
 duration: string;
 status: string;
};

export type Booking = {
 id: string;
 customer: string;
 service: string;
 date: string;
 time: string;
 status: string;
};

export type MenuItem = {
 id: string;
 name: string;
 category: string;
 price: number;
 addons: string;
 available: boolean;
 orders: number;
 popular: boolean;
};

export type ProProject = {
 id: string;
 name: string;
 client: string;
 description: string;
 startDate: string;
 dueDate: string;
 status: string;
 files: string;
};

export type Property = {
 id: string;
 name: string;
 price: string;
 city: string;
 type: string;
 status: string;
 area: string;
};

export type SparePart = {
 id: string;
 name: string;
 partNo: string;
 manufacturer: string;
 compatibility: string;
 price: number;
 stock: number;
};

export type DigitalItem = {
 id: string;
 name: string;
 type: string;
 price: number;
 availableCodes: number;
 sampleCode: string;
 deliveryStatus: string;
};

export type Vehicle = {
 id: string;
 plate: string;
 model: string;
 owner: string;
 lastService: string;
};

export type ProjectBuilder = {
 siteName: string;
 logoText: string;
 heroTitle: string;
 heroSubtitle: string;
 sections: BuilderSection[];
};

export type Project = {
 id: string;
 name: string;
 businessType: string;
 description: string;
 city: string;
 phone: string;
 email: string;
 currency: string;
 language: string;
 primaryColor: string;
 secondaryColor: string;
 fontFamily: string;
 domain: string;
 domainStatus: string;
 siteStatus: string;
 ownerName: string;
 createdAt: string;
 templateId: string;
 enabledModules: string[];
 pinnedModules: string[];
 builder: ProjectBuilder;
 products: Product[];
 categories: Category[];
 orders: Order[];
 customers: Customer[];
 services: Service[];
 bookings: Booking[];
 menu: MenuItem[];
 proProjects: ProProject[];
 properties: Property[];
 spareParts: SparePart[];
 digitalItems: DigitalItem[];
 employees: Employee[];
 pages: PageItem[];
 coupons: Coupon[];
 quotes: Quote[];
 invoices: Invoice[];
 vehicles: Vehicle[];
};

export type Template = {
 id: string;
 name: string;
 businessType: string;
 businessLabel: string;
 accent: string;
 desc: string;
};

export type Plan = {
 id: string;
 code: string;
 nameAr: string;
 price: number;
 period: string;
 maxProjects: number;
 maxPages: number;
 aiLimit: string;
 storage: string;
 availableModules: string;
 status: string;
 popular: boolean;
};

export type Subscriber = {
 id: string;
 name: string;
 email: string;
 projectsCount: number;
 activity: string;
 plan: string;
 status: string;
 createdAt: string;
 aiUsage: string;
};

export type AiProviderStatus = 'نشط' | 'غير مهيأ';

export type AiProvider = {
 id: string;
 name: string;
 status: AiProviderStatus;
 model: string;
 modelId: string;
 baseUrl: string;
 features: string[];
 connStatus: string;
 limit: string;
 isDefault: boolean;
 desc: string;
};

export type AiUsageLog = {
 id: string;
 project: string;
 provider: string;
 model: string;
 task: string;
 requests: number;
 tokens: number;
 estCost: string;
 date: string;
 status: string;
};

export type NotificationType = 'info' | 'warning' | 'success';

export type Notification = {
 id: string;
 title: string;
 text: string;
 time: string;
 read: boolean;
 type: NotificationType;
};

export type SupportTicket = {
 id: string;
 ticketNumber: string;
 subscriber: string;
 subject: string;
 priority: string;
 status: string;
 date: string;
};

export type ActivityEntry = {
 id: string;
 time: string;
 actor: string;
 action: string;
};

export type PlatformSettings = {
 brandName: string;
 brandShort: string;
 primaryColor: string;
 supportEmail: string;
 defaultCurrency: string;
 maintenanceMode: boolean;
};

export type UserSettings = {
 name: string;
 email: string;
 role: string;
 density: string;
 fontSize: string;
 emailAlerts: boolean;
 stockAlerts: boolean;
};

export type NasaqState = {
 platformSettings: PlatformSettings;
 userSettings: UserSettings;
 activeProjectId: string;
 projects: Project[];
 templates: Template[];
 plans: Plan[];
 subscribers: Subscriber[];
 aiProviders: AiProvider[];
 aiUsageLogs: AiUsageLog[];
 notifications: Notification[];
 supportTickets: SupportTicket[];
 activityLog: ActivityEntry[];
};

/* ==========================================================================
  2. TEMPLATES & PLANS
  ========================================================================== */

const templates: Template[] = [
 {
  id: 'tpl_store_modern',
  name: 'أفق المتاجر العصري',
  businessType: 'store',
  businessLabel: 'متجر إلكتروني',
  accent: '#5B5CE2',
  desc: 'واجهة متجر نظيفة تبرز المنتجات والفئات مع بطاقات سريعة.',
 },
 {
  id: 'tpl_rest_warm',
  name: 'مذاق الضيافة',
  businessType: 'restaurant',
  businessLabel: 'مطعم ومقهى',
  accent: '#D97706',
  desc: 'تصميم دافئ يستعرض المنيو الرقمي والإضافات وحجز الطاولات.',
 },
 {
  id: 'tpl_service_pro',
  name: 'إتقان للخدمات والصيانة',
  businessType: 'maintenance',
  businessLabel: 'خدمات وصيانة',
  accent: '#0F766E',
  desc: 'قالب عملي لحجز مواعيد الفحص وعرض الخدمات وقطع الغيار.',
 },
 {
  id: 'tpl_eng_minimal',
  name: 'أبعاد المعماري',
  businessType: 'engineering',
  businessLabel: 'هندسة وعمارة',
  accent: '#1E293B',
  desc: 'تصميم هندسي هادئ يركز على معرض الأعمال وطلبات عروض الأسعار.',
 },
 {
  id: 'tpl_realestate_lux',
  name: 'واحة العقار',
  businessType: 'realestate',
  businessLabel: 'عقارات',
  accent: '#16A34A',
  desc: 'قالب عقاري منظم لاستعراض الوحدات السكنية والتجارية بالمدينة والسعر.',
 },
 {
  id: 'tpl_digital_neon',
  name: 'نبض الرقمية والبطاقات',
  businessType: 'cards',
  businessLabel: 'ألعاب وبطاقات رقمية',
  accent: '#4F46E5',
  desc: 'قالب مخصص للمنتجات الرقمية وبطاقات الشحن الفوري.',
 },
];

const plans: Plan[] = [
 {
  id: 'plan_starter',
  code: 'Starter',
  nameAr: 'باقة البداية (Starter)',
  price: 15000,
  period: 'شهريًا',
  maxProjects: 1,
  maxPages: 5,
  aiLimit: '100 طلب / شهر',
  storage: '2 جيجابايت ',
  availableModules: 'الوحدات الأساسية للنشاط المختار',
  status: 'نشطة',
  popular: false,
 },
 {
  id: 'plan_growth',
  code: 'Growth',
  nameAr: 'باقة النمو (Growth)',
  price: 35000,
  period: 'شهريًا',
  maxProjects: 3,
  maxPages: 25,
  aiLimit: '500 طلب / شهر',
  storage: '15 جيجابايت ',
  availableModules: 'جميع وحدات النشاط + المخزون + عروض الأسعار + التسويق',
  status: 'نشطة',
  popular: true,
 },
 {
  id: 'plan_business',
  code: 'Business',
  nameAr: 'باقة الأعمال (Business)',
  price: 75000,
  period: 'شهريًا',
  maxProjects: 10,
  maxPages: 100,
  aiLimit: '2,500 طلب / شهر',
  storage: '100 جيجابايت ',
  availableModules: 'كامل الوحدات + إدارة الفريق + المشاريع المتعددة',
  status: 'نشطة',
  popular: false,
 },
];

/* ==========================================================================
  3. PROJECTS
  ========================================================================== */

const projects: Project[] = [
 /* ---------------- متجر ندى ---------------- */
 {
  id: 'proj_store',
  name: 'متجر ندى',
  businessType: 'store',
  description: 'متجر عربي متخصص في العطور الفاخرة، الأزياء الراقية، والإكسسوارات الذكية.',
  city: 'بغداد',
  phone: '0701112233',
  email: 'info@nada-store.example',
  currency: 'دينار عراقي (د.ع)',
  language: 'ar',
  primaryColor: '#5B5CE2',
  secondaryColor: '#16B8A6',
  fontFamily: 'Tajawal',
  templateId: 'tpl_store_modern',
  domain: 'nada-store.nasaq.iq',
  domainStatus: 'مرتبط ',
  siteStatus: 'منشور ',
  ownerName: 'ندى العتيبي',
  createdAt: '2026-08-12',
  enabledModules: [...BUSINESS_DEFAULT_MODULES.store],
  pinnedModules: ['dashboard', 'products', 'orders'],
  builder: {
   siteName: 'متجر ندى للعطور والأناقة',
   logoText: 'متجر ندى',
   heroTitle: 'أناقتك تبدأ من تفاصيلك اليومية المختارة بعناية',
   heroSubtitle: 'تشكيلة فاخرة من العطور الشرقية، الحقائب الجلدية، والساعات الذكية بتوصيل سريع.',
   sections: [
    { id: 'sec_1', type: 'Hero', title: 'الواجهة الترحيبية (Hero)', visible: true, content: 'تشكيلة الموسم الجديدة بخصم 15% ' },
    { id: 'sec_2', type: 'Products', title: 'أحدث المنتجات المختارة', visible: true, content: 'عرض أفضل منتجات متجر ندى' },
    { id: 'sec_3', type: 'About', title: 'عن متجر ندى', visible: true, content: 'نختار لك أجود الخامات والعطور الأصيلة منذ 2022.' },
    { id: 'sec_4', type: 'Testimonials', title: 'آراء عملائنا', visible: true, content: 'تجربة تسوق راقية وتغليف فاخر.' },
    { id: 'sec_5', type: 'FAQ', title: 'الأسئلة الشائعة للشحن والاستبدال', visible: true, content: 'التوصيل خلال 24-48 ساعة داخل المدن الرئيسية.' },
    { id: 'sec_6', type: 'Contact', title: 'تواصل معنا', visible: true, content: 'بغداد — خدمة العملاء متاحة طوال الأسبوع.' },
    { id: 'sec_7', type: 'Footer', title: 'تذييل الموقع', visible: true, content: 'جميع الحقوق محفوظة لمتجر ندى' },
   ],
  },
  products: [
   { id: 'p_1', name: 'عطر شرقي فاخر', category: 'العطور', price: 1120000, stock: 34, minStock: 10, status: 'نشط', sales: 64, featured: false },
   { id: 'p_2', name: 'حقيبة جلدية', category: 'الحقائب والأزياء', price: 1360000, stock: 18, minStock: 5, status: 'نشط', sales: 41, featured: false },
   { id: 'p_3', name: 'سماعة لاسلكية', category: 'الإلكترونيات', price: 780000, stock: 7, minStock: 10, status: 'نشط', sales: 52, featured: true },
   { id: 'p_4', name: 'ساعة ذكية', category: 'الإلكترونيات', price: 1680000, stock: 15, minStock: 6, status: 'نشط', sales: 38, featured: false },
   { id: 'p_5', name: 'كريم ترطيب', category: 'العناية والجمال', price: 380000, stock: 4, minStock: 12, status: 'منخفض المخزون', sales: 73, featured: false },
   { id: 'p_6', name: 'قميص قطني', category: 'الحقائب والأزياء', price: 540000, stock: 29, minStock: 8, status: 'نشط', sales: 29, featured: false },
  ],
  categories: [
   { id: 'cat_1', name: 'العطور', description: 'عطور شرقية وفرنسية فاخرة' },
   { id: 'cat_2', name: 'الحقائب والأزياء', description: 'حقائب جلدية وملابس قطنية' },
   { id: 'cat_3', name: 'الإلكترونيات', description: 'ساعات ذكية وسماعات لاسلكية' },
   { id: 'cat_4', name: 'العناية والجمال', description: 'منتجات العناية بالبشرة والترطيب' },
  ],
  orders: [
   { id: 'ORD-1041', number: 'ORD-1041', customer: 'سارة القحطاني', date: '2026-10-15', total: 2480000, status: 'مكتمل', items: 'عطر شرقي فاخر + حقيبة جلدية', history: ['تم إنشاء الطلب', 'تم تأكيد الدفع ال', 'تم الشحن', 'مكتمل'] },
   { id: 'ORD-1042', number: 'ORD-1042', customer: 'خالد السبيعي', date: '2026-10-15', total: 1680000, status: 'قيد التجهيز', items: 'ساعة ذكية', history: ['تم إنشاء الطلب', 'قيد التجهيز في المستودع'] },
   { id: 'ORD-1043', number: 'ORD-1043', customer: 'ريم الشمري', date: '2026-10-16', total: 1160000, status: 'جديد', items: 'سماعة لاسلكية + كريم ترطيب', history: ['تم استلام الطلب'] },
   { id: 'ORD-1044', number: 'ORD-1044', customer: 'فهد الدوسري', date: '2026-10-16', total: 1120000, status: 'بانتظار التوصيل', items: 'عطر شرقي فاخر', history: ['تم إنشاء الطلب', 'خرج مع مندوب التوصيل'] },
  ],
  customers: [
   { id: 'c_1', name: 'سارة القحطاني', phone: '0751234567', city: 'بغداد', ordersCount: 12, totalSpent: 7200000, lastActivity: 'شراء عطر شرقي فاخر' },
   { id: 'c_2', name: 'خالد السبيعي', phone: '0759876543', city: 'البصرة', ordersCount: 5, totalSpent: 3750000, lastActivity: 'طلب ساعة ذكية' },
   { id: 'c_3', name: 'ريم الشمري', phone: '0755555555', city: 'أربيل', ordersCount: 8, totalSpent: 4400000, lastActivity: 'طلب سماعة لاسلكية' },
  ],
  services: [],
  bookings: [],
  menu: [],
  proProjects: [],
  properties: [],
  spareParts: [],
  digitalItems: [],
  employees: [
   { id: 'emp_1', name: 'ندى العتيبي', role: 'مالك', status: 'نشط', allowedModules: 'الكل' },
   { id: 'emp_2', name: 'عمر الحربي', role: 'مشرف مبيعات', status: 'نشط', allowedModules: 'الطلبات والعملاء' },
  ],
  pages: [
   { id: 'pg_1', title: 'الرئيسية', slug: '/', seoDesc: 'متجر ندى للعطور والأزياء والإلكترونيات', status: 'منشورة' },
   { id: 'pg_2', title: 'المتجر', slug: '/', seoDesc: 'أفخم العطور الشرقية الأصيلة', status: 'منشورة' },
   { id: 'pg_3', title: 'اتصل بنا', slug: '/contact', seoDesc: 'ضمان استبدال مرن خلال 14 يومًا', status: 'منشورة' },
  ],
  coupons: [
   { id: 'cp_1', code: 'NADA15', discount: '15%', uses: 34, status: 'نشط' },
   { id: 'cp_2', code: 'WELCOME', discount: '10%', uses: 120, status: 'نشط' },
  ],
  quotes: [],
  invoices: [
   { id: 'INV-901', client: 'سارة القحطاني', amount: 2480000, date: '2026-10-15', status: 'مدفوعة ' },
  ],
  vehicles: [],
 },

 /* ---------------- مطعم مذاق ---------------- */
 {
  id: 'proj_restaurant',
  name: 'مطعم مذاق',
  businessType: 'restaurant',
  description: 'مطعم ومقهى عصري يقدم البرغر المشوي، البيتزا الإيطالية، والقهوة المختصة.',
  city: 'البصرة',
  phone: '0702223344',
  email: 'hello@mathaq-rest.example',
  currency: 'دينار عراقي (د.ع)',
  language: 'ar',
  primaryColor: '#D97706',
  secondaryColor: '#16A34A',
  fontFamily: 'Almarai',
  templateId: 'tpl_rest_warm',
  domain: 'mathaq-rest.nasaq.iq',
  domainStatus: 'مرتبط ',
  siteStatus: 'منشور ',
  ownerName: 'ماجد الزهراني',
  createdAt: '2026-09-01',
  enabledModules: [...BUSINESS_DEFAULT_MODULES.restaurant],
  pinnedModules: ['dashboard', 'menu', 'orders', 'bookings'],
  builder: {
   siteName: 'مطعم ومقهى مذاق',
   logoText: 'مطعم مذاق',
   heroTitle: 'نكهات طازجة تُحضّر بشغف وتصلك ساخنة أينما كنت',
   heroSubtitle: 'اطلب الآن من المنيو الرقمي أو احجز طاولتك لعشاء عائلي مميز في قلب البصرة.',
   sections: [
    { id: 'sec_r1', type: 'Hero', title: 'واجهة المطعم', visible: true, content: 'وجبات طازجة يوميًا وتوصيل سريع' },
    { id: 'sec_r2', type: 'Menu', title: 'قائمة الطعام والقهوة (Menu)', visible: true, content: 'تصفح أشهر وجبات مطعم مذاق' },
    { id: 'sec_r3', type: 'About', title: 'قصتنا في مذاق', visible: true, content: 'مكونات محلية طازجة وخبز يحضر يوميًا في فرننا.' },
    { id: 'sec_r4', type: 'Contact', title: 'الفروع وأوقات العمل', visible: true, content: 'البصرة — يوميًا من 12 ظهرًا حتى 1 منتصف الليل.' },
    { id: 'sec_r5', type: 'Footer', title: 'تذييل الموقع', visible: true, content: 'مطعم مذاق — جميع الحقوق محفوظة' },
   ],
  },
  products: [],
  categories: [
   { id: 'rcat_1', name: 'الأطباق الرئيسية والبرغر', description: 'برغر مشوي، بيتزا، ووجبات دجاج' },
   { id: 'rcat_2', name: 'السلطات والمقبلات', description: 'سلطات موسمية طازجة' },
   { id: 'rcat_3', name: 'العصائر والقهوة', description: 'عصائر طبيعية وقهوة باردة مختصة' },
  ],
  menu: [
   { id: 'm_1', name: 'برغر كلاسيكي مشوي', category: 'الأطباق الرئيسية والبرغر', price: 152000, addons: 'جبن إضافي (+5)، صوص مدخن (+4)', available: true, orders: 94, popular: true },
   { id: 'm_2', name: 'بيتزا خضار', category: 'الأطباق الرئيسية والبرغر', price: 180000, addons: 'أطراف جبن (+8)، فطر طازج (+6)', available: true, orders: 78, popular: true },
   { id: 'm_3', name: 'وجبة دجاج مقرمش', category: 'الأطباق الرئيسية والبرغر', price: 168000, addons: 'بطاطس حارة (+6)، ثوم إضافي (+3)', available: false, orders: 61, popular: false },
   { id: 'm_4', name: 'سلطة موسمية', category: 'السلطات والمقبلات', price: 104000, addons: 'جبن فيتا (+5)، صوص رمان (+3)', available: true, orders: 44, popular: false },
   { id: 'm_5', name: 'عصير طبيعي', category: 'العصائر والقهوة', price: 72000, addons: 'بدون سكر، نعناع طازج', available: true, orders: 82, popular: true },
   { id: 'm_6', name: 'قهوة باردة', category: 'العصائر والقهوة', price: 88000, addons: 'حليب شوفان (+5)، كراميل (+4)', available: true, orders: 110, popular: true },
  ],
  orders: [
   { id: 'ORD-2081', number: 'ORD-2081', customer: 'عبدالله الغامدي', date: '2026-10-16', total: 392000, status: 'قيد التجهيز', items: '2 برغر كلاسيكي + قهوة باردة', history: ['استلام الطلب', 'في المطبخ'] },
   { id: 'ORD-2082', number: 'ORD-2082', customer: 'منى الحارثي', date: '2026-10-16', total: 284000, status: 'بانتظار التوصيل', items: 'بيتزا خضار + سلطة موسمية', history: ['استلام الطلب', 'جاهز للتسليم للمندوب'] },
   { id: 'ORD-2083', number: 'ORD-2083', customer: 'ياسر المالكي', date: '2026-10-16', total: 240000, status: 'مكتمل', items: 'وجبة دجاج + عصير طبيعي', history: ['تم التسليم للعميل'] },
  ],
  bookings: [
   { id: 'bk_r1', customer: 'عائلة أ. طارق', service: 'حجز طاولة عشاء (5 أشخاص)', date: '2026-10-17', time: '08:30 م', status: 'مؤكد' },
   { id: 'bk_r2', customer: 'ليلى الجهني', service: 'حجز طاولة ركن القهوة (شخصان)', date: '2026-10-18', time: '06:00 م', status: 'بانتظار التأكيد' },
  ],
  customers: [
   { id: 'rc_1', name: 'ليان الغامدي', phone: '0741122334', city: 'البصرة', ordersCount: 12, totalSpent: 890, lastActivity: 'طلب برغر كلاسيكي' },
   { id: 'rc_2', name: 'فهد الاحمدي', phone: '0742233445', city: 'البصرة', ordersCount: 4, totalSpent: 420, lastActivity: 'طلب بيتزا خضار' },
  ],
  services: [],
  proProjects: [],
  properties: [],
  spareParts: [],
  digitalItems: [],
  employees: [
   { id: 'remp_1', name: 'ماجد الزهراني', role: 'مدير المطعم', status: 'نشط', allowedModules: 'جميع الوحدات' },
   { id: 'remp_2', name: 'سامي كمال', role: 'مشرف الصالة والطلبات', status: 'نشط', allowedModules: 'المنيو، الطلبات، الحجوزات' },
  ],
  pages: [
   { id: 'rpg_1', title: 'الرئيسية', slug: '/', seoDesc: 'مطعم مذاق للبرغر والبيتزا والقهوة المختصة', status: 'منشور' },
   { id: 'rpg_2', title: 'المنيو', slug: '/booking', seoDesc: 'احجز طاولتك في مطعم مذاق بسهولة', status: 'منشور' },
  ],
  coupons: [
   { id: 'rcp_1', code: 'LUNCH20', discount: '20%', uses: 18, status: 'نشط' },
  ],
  quotes: [],
  invoices: [],
  vehicles: [],
 },

 /* ---------------- ورشة المحرك ---------------- */
 {
  id: 'proj_workshop',
  name: 'ورشة المحرك',
  businessType: 'maintenance',
  description: 'مركز متخصص في فحص المركبات، الصيانة الدورية، تشخيص الأعطال بالكمبيوتر، وقطع الغيار.',
  city: 'أربيل',
  phone: '0703334455',
  email: 'service@engine-workshop.example',
  currency: 'دينار عراقي (د.ع)',
  language: 'ar',
  primaryColor: '#0F766E',
  secondaryColor: '#5B5CE2',
  fontFamily: 'Tajawal',
  templateId: 'tpl_service_pro',
  domain: 'engine-care.nasaq.iq',
  domainStatus: 'يحتاج إلى إعداد',
  siteStatus: 'معاينة نشطة',
  ownerName: 'م. سلطان الشمري',
  createdAt: '2026-09-14',
  enabledModules: [...BUSINESS_DEFAULT_MODULES.maintenance],
  pinnedModules: ['dashboard', 'services', 'bookings', 'spareParts'],
  builder: {
   siteName: 'مركز ورشة المحرك لصيانة السيارات',
   logoText: 'ورشة المحرك',
   heroTitle: 'صيانة احترافية وفحص دقيق لمركبتك بأحدث أجهزة التشخيص',
   heroSubtitle: 'احجز موعد الفحص أو الصيانة الدورية أونلاين واستلم تقريرًا فنيًا شفافًا.',
   sections: [
    { id: 'sec_w1', type: 'Hero', title: 'واجهة المركز', visible: true, content: 'احجز موعد صيانة مركبتك خلال دقيقة' },
    { id: 'sec_w2', type: 'Services', title: 'خدمات الصيانة والفحص', visible: true, content: 'فحص شامل، تغيير زيت، مكابح، وتشخيص كمبيوتر' },
    { id: 'sec_w3', type: 'FAQ', title: 'أسئلة شائعة حول الضمان', visible: true, content: 'ضمان 30 يومًا على أعمال الصيانة الدورية' },
    { id: 'sec_w4', type: 'Contact', title: 'موقع الورشة وساعات العمل', visible: true, content: 'أربيل — الصناعية الحديثة' },
    { id: 'sec_w5', type: 'Footer', title: 'تذييل الموقع', visible: true, content: 'ورشة المحرك للصيانة' },
   ],
  },
  products: [],
  categories: [],
  services: [
   { id: 'srv_1', name: 'فحص شامل للمركبة', description: 'فحص شامل لـ 45 نقطة سلامة وميكانيكا وكهرباء.', price: 720000, duration: '45 دقيقة', status: 'متاح' },
   { id: 'srv_2', name: 'تغيير الزيت والفلاتر', description: 'تغيير زيت المحرك التخليقي بالكامل مع الفلتر الأصلي.', price: 660000, duration: '30 دقيقة', status: 'متاح' },
   { id: 'srv_3', name: 'فحص وصيانة المكابح', description: 'فحص الفحمات والهوبات وزيت الفرامل ومعايرة الأداء.', price: 440000, duration: '40 دقيقة', status: 'متاح' },
   { id: 'srv_4', name: 'صيانة دورية شاملة', description: 'صيانة 40,000 كم تشمل الفلاتر، البواجي، والسوائل.', price: 2160000, duration: '120 دقيقة', status: 'متاح' },
   { id: 'srv_5', name: 'تشخيص الأعطال الإلكترونية', description: 'فحص كمبيوتر متقدم لقراءة أكواد الأعطال وتحليل الحساسات.', price: 600000, duration: '60 دقيقة', status: 'متاح' },
  ],
  bookings: [
   { id: 'bk_w1', customer: 'ناصر العجمي', service: 'صيانة دورية', date: '2026-10-17', time: '09:30 ص', status: 'مؤكد' },
   { id: 'bk_w2', customer: 'بدر الخالدي', service: 'تشخيص الأعطال', date: '2026-10-17', time: '11:00 ص', status: 'بانتظار التأكيد' },
   { id: 'bk_w3', customer: 'فيصل المري', service: 'تغيير الزيت', date: '2026-10-18', time: '04:30 م', status: 'مؤكد' },
  ],
  spareParts: [
   { id: 'sp_1', name: 'رديتر تبريد ألمنيوم', partNo: 'OEM-RAD-550', manufacturer: 'Denso', compatibility: 'تويوتا كامري / أفالون 2019-2025', price: 1680000, stock: 8 },
   { id: 'sp_2', name: 'فلتر زيت أصلي', partNo: 'OEM-FLT-90915', manufacturer: 'Denso', compatibility: 'تويوتا كامري 2018-2024', price: 260000, stock: 22 },
   { id: 'sp_3', name: 'بوجيه إشعال', partNo: 'NGK-IR-8810', manufacturer: 'NGK', compatibility: 'نيسان التيما / x-trail 2019-2024', price: 140000, stock: 30 },
   { id: 'sp_4', name: 'حساس أكسجين', partNo: 'BOSCH-O2-771', manufacturer: 'Bosch', compatibility: 'مازدا 6 / CX-5 2019-2025', price: 960000, stock: 6 },
  ],
  vehicles: [
   { id: 'vh_1', plate: 'أ ب ج 4821', model: 'تويوتا كامري 2023', owner: 'ناصر العجمي', lastService: '2026-09-10' },
   { id: 'vh_2', plate: 'د هـ و 9104', model: 'هيونداي سوناتا 2022', owner: 'بدر الخالدي', lastService: '2026-10-02' },
  ],
  customers: [
   { id: 'wc_1', name: 'ناصر العجمي', phone: '0731112299', city: 'أربيل', ordersCount: 4, totalSpent: 1420, lastActivity: 'حجز صيانة دورية' },
   { id: 'wc_2', name: 'بدر الخالدي', phone: '0732223388', city: 'ذي قار', ordersCount: 2, totalSpent: 460, lastActivity: 'طلب تشخيص أعطال' },
  ],
  orders: [],
  menu: [],
  proProjects: [],
  properties: [],
  digitalItems: [],
  employees: [
   { id: 'wemp_1', name: 'م. سلطان الشمري', role: 'مدير الورشة', status: 'نشط', allowedModules: 'جميع الوحدات' },
   { id: 'wemp_2', name: 'فني/ كريم محمود', role: 'مهندس فحص وتشخيص', status: 'نشط', allowedModules: 'الخدمات، الحجوزات، قطع الغيار' },
  ],
  pages: [
   { id: 'wpg_1', title: 'الرئيسية وحجز الصيانة', slug: '/', seoDesc: 'ورشة المحرك لفحص وصيانة السيارات', status: 'منشور' },
  ],
  coupons: [],
  quotes: [
   { id: 'QT-301', client: 'ناصر العجمي', title: 'عرض سعر صيانة شاملة + تغيير فحمات', amount: 3400000, status: 'معتمد' },
   { id: 'QT-302', client: 'بدر الخالدي', title: 'عرض سعر إصلاح حساس الأكسجين وفحص الضفيرة', amount: 1700000, status: 'بانتظار موافقة العميل' },
  ],
  invoices: [
   { id: 'INV-501', client: 'ناصر العجمي', amount: 3400000, date: '2026-10-14', status: 'مدفوعة ' },
  ],
 },

 /* ---------------- أبعاد للهندسة ---------------- */
 {
  id: 'proj_engineering',
  name: 'أبعاد للهندسة',
  businessType: 'engineering',
  description: 'مكتب استشارات هندسية وتصميم معماري وداخلي للمشاريع السكنية والتجارية.',
  city: 'بغداد',
  phone: '0704445566',
  email: 'studio@abaad-eng.example',
  currency: 'دينار عراقي (د.ع)',
  language: 'ar',
  primaryColor: '#1E293B',
  secondaryColor: '#5B5CE2',
  fontFamily: 'Tajawal',
  templateId: 'tpl_eng_minimal',
  domain: 'abaad-arch.nasaq.iq',
  domainStatus: 'مرتبط ',
  siteStatus: 'منشور ',
  ownerName: 'م. طارق المهنا',
  createdAt: '2026-07-20',
  enabledModules: [...BUSINESS_DEFAULT_MODULES.engineering],
  pinnedModules: ['dashboard', 'projects', 'portfolio', 'quotes'],
  builder: {
   siteName: 'مكتب أبعاد للهندسة المعمارية والتصميم',
   logoText: 'أبعاد للهندسة',
   heroTitle: 'نصمم مساحات معمارية تجمع بين الأصالة وكفاءة الوظيفة',
   heroSubtitle: 'مخططات معمارية، تصميم داخلي، وإشراف هندسي متكامل للمشاريع السكنية والتجارية.',
   sections: [
    { id: 'sec_e1', type: 'Hero', title: 'واجهة المكتب الهندسي', visible: true, content: 'استشارات معمارية وهندسية متكاملة' },
    { id: 'sec_e2', type: 'Portfolio', title: 'معرض المشاريع المعمارية', visible: true, content: 'نماذج من أعمالنا السكنية والتجارية' },
    { id: 'sec_e3', type: 'Services', title: 'خدماتنا الهندسية', visible: true, content: 'التصميم المعماري، التصميم الداخلي، والواجهات' },
    { id: 'sec_e4', type: 'Contact', title: 'اطلب استشارة أو عرض سعر', visible: true, content: 'بغداد — حي العليا' },
    { id: 'sec_e5', type: 'Footer', title: 'تذييل الموقع', visible: true, content: 'أبعاد للهندسة المعمارية' },
   ],
  },
  products: [],
  categories: [],
  proProjects: [
   { id: 'prj_1', name: 'تصميم منزل سكني حديث', client: 'أ. عبدالرحمن السديري', description: 'تصميم فيلا سكنية مودرن بمساحة 450 م² مع الفناء الداخلي.', startDate: '2026-08-01', dueDate: '2026-11-15', status: 'قيد التنفيذ (75%)', files: 'مخطط_الدور_الأرضي.pdf، الواجهة_الشمالية.dwg' },
   { id: 'prj_2', name: 'تصميم واجهة تجارية', client: 'شركة روافد التجارية', description: 'تطوير واجهة مجمع مكاتب ومعارض على طريق الملك فهد.', startDate: '2026-09-05', dueDate: '2026-10-30', status: 'مراجعة العميل', files: 'منظور_ليلي_3D.png، جدول_المواد.pdf' },
   { id: 'prj_3', name: 'تصميم داخلي لمقر شركة', client: 'د. هيفاء العلي', description: 'تصميم داخلي متكامل لعيادة تخصصية ومنطقة استقبال.', startDate: '2026-09-20', dueDate: '2026-11-10', status: 'قيد التنفيذ (50%)', files: 'مخطط_الإضاءة.pdf، لوحة_الخامات.pdf' },
   { id: 'prj_4', name: 'مخطط معماري لمجمع سكني', client: 'مؤسسة البنيان', description: 'إعداد المخططات المعمارية والإنشائية لمجمع سكني (6 وحدات).', startDate: '2026-06-10', dueDate: '2026-09-25', status: 'مكتمل', files: 'المخططات_المعتمدة_النهائية.pdf' },
  ],
  services: [
   { id: 'esrv_1', name: 'استشارة معمارية متخصصة', description: 'دراسة الأرض وتوزيع الفراغات وإصدار المخططات المعتمدة.', price: 39200000, duration: '4 أسابيع', status: 'متاح' },
   { id: 'esrv_2', name: 'إشراف هندسي على التنفيذ', description: 'تصميم الفراغات الداخلية مع جداول الكميات والإضاءة.', price: 58000000, duration: '3 أسابيع', status: 'متاح' },
  ],
  customers: [
   { id: 'ec_1', name: 'شركة المدار العقارية', phone: '0709988771', city: 'بغداد', ordersCount: 2, totalSpent: 110000000, lastActivity: 'اعتماد واجهة الفيلا' },
   { id: 'ec_2', name: 'مؤسسة البناء الحديث', phone: '0709988772', city: 'بغداد', ordersCount: 1, totalSpent: 180000000, lastActivity: 'مراجعة تصميم الواجهة التجارية' },
  ],
  quotes: [
   { id: 'EQT-11', client: 'شركة روافد التجارية', title: 'عرض سعر تصميم واجهة تجارية وإشراف', amount: 128000000, status: 'معتمد' },
   { id: 'EQT-12', client: 'د. هيفاء العلي', title: 'عرض سعر تصميم داخلي للعيادة', amount: 74000000, status: 'بانتظار موافقة العميل' },
  ],
  invoices: [
   { id: 'EINV-21', client: 'أ. عبدالرحمن السديري', amount: 56000000, date: '2026-09-15', status: 'مدفوعة ' },
  ],
  orders: [],
  bookings: [],
  menu: [],
  properties: [],
  spareParts: [],
  digitalItems: [],
  employees: [
   { id: 'eemp_1', name: 'م. طارق المهنا', role: 'معماري رئيسي', status: 'نشط', allowedModules: 'جميع الوحدات' },
   { id: 'eemp_2', name: 'م. دانة الفهد', role: 'مصممة داخلية', status: 'نشط', allowedModules: 'المشاريع، معرض الأعمال، الملفات' },
  ],
  pages: [
   { id: 'epg_1', title: 'الرئيسية ومعرض الأعمال', slug: '/', seoDesc: 'مكتب أبعاد للهندسة المعمارية والتصميم الداخلي', status: 'منشور' },
  ],
  coupons: [],
  vehicles: [],
 },

 /* ---------------- عقارات الواحة ---------------- */
 {
  id: 'proj_realestate',
  name: 'عقارات الواحة',
  businessType: 'realestate',
  description: 'مكتب تسويق واستشارات عقارية لعرض الفلل السكنية، الشقق التمليك، والمكاتب التجارية.',
  city: 'بغداد',
  phone: '0706667788',
  email: 'sales@oasis-realty.example',
  currency: 'دينار عراقي (د.ع)',
  language: 'ar',
  primaryColor: '#0F766E',
  secondaryColor: '#5B5CE2',
  fontFamily: 'Tajawal',
  templateId: 'tpl_realestate_lux',
  domain: 'oasis-realty.nasaq.iq',
  domainStatus: 'غير مرتبط',
  siteStatus: 'مسودة ',
  ownerName: 'سعد التميمي',
  createdAt: '2026-10-01',
  enabledModules: [...BUSINESS_DEFAULT_MODULES.realestate],
  pinnedModules: ['dashboard', 'properties', 'bookings'],
  builder: {
   siteName: 'عقارات الواحة للتسويق العقاري',
   logoText: 'عقارات الواحة',
   heroTitle: 'اكتشف عقارك السكني أو الاستثماري القادم بثقة ووضوح',
   heroSubtitle: 'عروض موثقة للفلل والشقق والأراضي التجارية مع إمكانية حجز موعد معاينة ميدانية.',
   sections: [
    { id: 'sec_re1', type: 'Hero', title: 'واجهة العقارات', visible: true, content: 'خيارات عقارية متنوعة في أرقى الأحياء' },
    { id: 'sec_re2', type: 'Properties', title: 'أحدث العروض العقارية', visible: true, content: 'تصفح الفلل والشقق المتاحة' },
    { id: 'sec_re3', type: 'Contact', title: 'احجز موعد معاينة', visible: true, content: 'تواصل مع مستشارنا العقاري' },
    { id: 'sec_re4', type: 'Footer', title: 'تذييل الموقع', visible: true, content: 'عقارات الواحة' },
   ],
  },
  products: [],
  categories: [
   { id: 'recat_1', name: 'فلل سكنية', description: 'فلل تمليك ودوبلكس' },
   { id: 'recat_2', name: 'شقق تمليك', description: 'شقق حديثة بتشطيب فاخر' },
   { id: 'recat_3', name: 'مكاتب تجارية', description: 'مساحات إدارية وتجارية' },
  ],
  properties: [
   { id: 'prop_1', name: 'فيلا الياسمين بحي الملقا', price: '2,450,000,000 د.ع', city: 'بغداد — حي الياسمين', type: 'فيلا سكنية (بيع)', status: 'متاح للعرض', area: '375 م²' },
   { id: 'prop_2', name: 'شقة النرجس — حي الياسمين', price: '890,000,000 د.ع', city: 'بغداد — حي النرجس', type: 'شقة تمليك (بيع)', status: 'متاح للعرض', area: '165 م²' },
   { id: 'prop_3', name: 'مكتب إداري حي العليا', price: '95,000,000 د.ع / سنويًا', city: 'بغداد — طريق الملك فهد', type: 'مكتب تجاري (إيجار)', status: 'محجوز / مباع', area: '140 م²' },
  ],
  bookings: [
   { id: 'rebk_1', customer: 'إبراهيم العبدالله', service: 'معاينة ميدانية — فيلا الياسمين', date: '2026-10-18', time: '04:30 م', status: 'مؤكد' },
  ],
  customers: [
   { id: 'rec_1', name: 'إبراهيم العبدالله', phone: '0758877665', city: 'بغداد', ordersCount: 1, totalSpent: 0, lastActivity: 'طلب معاينة فيلا الياسمين' },
  ],
  orders: [],
  services: [],
  menu: [],
  proProjects: [],
  spareParts: [],
  digitalItems: [],
  employees: [],
  pages: [
   { id: 'repg_1', title: 'الرئيسية والعروض العقارية', slug: '/', seoDesc: 'عقارات الواحة للفلل والشقق السكنية', status: 'منشور' },
  ],
  coupons: [],
  quotes: [],
  invoices: [],
  vehicles: [],
 },

 /* ---------------- عالم البطاقات ---------------- */
 {
  id: 'proj_digital',
  name: 'عالم البطاقات',
  businessType: 'cards',
  description: 'متجر رقمي متخصص في بطاقات الألعاب، بطاقات المتاجر، الشحن الفوري، والاشتراكات الرقمية.',
  city: 'بغداد',
  phone: '0705556677',
  email: 'support@cards-world.example',
  currency: 'دينار عراقي (د.ع)',
  language: 'ar',
  primaryColor: '#4F46E5',
  secondaryColor: '#16B8A6',
  fontFamily: 'Tajawal',
  templateId: 'tpl_digital_neon',
  domain: 'cards-world.nasaq.iq',
  domainStatus: 'مرتبط ',
  siteStatus: 'منشور ',
  ownerName: 'ريان الحربي',
  createdAt: '2026-09-25',
  enabledModules: [...BUSINESS_DEFAULT_MODULES.cards],
  pinnedModules: ['dashboard', 'products', 'digitalDelivery', 'stock'],
  builder: {
   siteName: 'عالم البطاقات والشحن الرقمي الفوري',
   logoText: 'عالم البطاقات',
   heroTitle: 'بطاقاتك الرقمية واشتراكاتك تصلك فورًا على الشاشة',
   heroSubtitle: 'تسليم آلي خلال ثوانٍ لبطاقات الألعاب والمتاجر العالمية.',
   sections: [
    { id: 'sec_d1', type: 'Hero', title: 'واجهة المتجر الرقمي', visible: true, content: 'تسليم فوري على مدار الساعة' },
    { id: 'sec_d2', type: 'Products', title: 'البطاقات والاشتراكات الأكثر طلبًا', visible: true, content: 'اختر فئة البطاقة واستلم الكود مباشرة' },
    { id: 'sec_d3', type: 'FAQ', title: 'طريقة تفعيل الأكواد الرقمية', visible: true, content: 'خطوات ميسرة لتفعيل كل بطاقة' },
    { id: 'sec_d4', type: 'Footer', title: 'تذييل الموقع', visible: true, content: 'عالم البطاقات الرقمية' },
   ],
  },
  products: [
   { id: 'dp_1', name: 'بطاقة ألعاب رقمية 50 دولار', category: 'بطاقات الألعاب', price: 740000, stock: 50, minStock: 10, status: 'نشط', sales: 120, featured: false },
   { id: 'dp_2', name: 'بطاقة متجر إلكتروني بقيمة 100,000 د.ع', category: 'بطاقات المتاجر', price: 400000, stock: 38, minStock: 10, status: 'نشط', sales: 95, featured: false },
   { id: 'dp_3', name: 'بطاقة شحن ', category: 'بطاقات الاتصالات والشحن', price: 200000, stock: 8, minStock: 15, status: 'منخفض المخزون', sales: 140, featured: false },
   { id: 'dp_4', name: 'اشتراك رقمي شهري', category: 'الاشتراكات الرقمية', price: 260000, stock: 42, minStock: 10, status: 'نشط', sales: 88, featured: false },
  ],
  categories: [
   { id: 'dcat_1', name: 'بطاقات الألعاب', description: 'بطاقات منصات الألعاب العالمية' },
   { id: 'dcat_2', name: 'بطاقات المتاجر', description: 'بطاقات الهدايا والتسوق' },
   { id: 'dcat_3', name: 'الاشتراكات الرقمية', description: 'اشتراكات البرامج والمنصات' },
  ],
  digitalItems: [
   { id: 'dig_1', name: 'بطاقة ستور 50', type: 'كود تفعيل فوري', price: 760000, deliveryStatus: 'تسليم آلي فوري', availableCodes: 30, sampleCode: 'DEMO-GAME-8821-XXXX' },
   { id: 'dig_2', name: 'بطاقة متجر إلكتروني', type: 'كود تفعيل فوري', price: 400000, deliveryStatus: 'تسليم آلي فوري', availableCodes: 18, sampleCode: 'DEMO-SHOP-4410-XXXX' },
   { id: 'dig_3', name: 'رصيد شحن ', type: 'رصيد فوري', price: 200000, deliveryStatus: 'تسليم آلي فوري', availableCodes: 42, sampleCode: 'DEMO-TOPUP-1920-XXXX' },
   { id: 'dig_4', name: 'اشتراك شهري ', type: 'تفعيل تلقائي', price: 260000, deliveryStatus: 'تسليم آلي فوري', availableCodes: 25, sampleCode: 'DEMO-SUB-9932-XXXX' },
  ],
  orders: [
   { id: 'ORD-5011', number: 'ORD-5011', customer: 'تركي العنزي', date: '2026-10-16', total: 740000, status: 'مكتمل (تم تسليم الكود)', items: 'بطاقة ألعاب رقمية', history: ['تم الطلب', 'تم تسليم الكود ال آليًا'] },
   { id: 'ORD-5012', number: 'ORD-5012', customer: 'نواف الشهري', date: '2026-10-16', total: 460000, status: 'مكتمل (تم تسليم الكود)', items: 'بطاقة شحن + اشتراك رقمي ', history: ['تم الطلب', 'تم تسليم الأكواد'] },
  ],
  customers: [
   { id: 'dc_1', name: 'تركي العنزي', phone: '0761122331', city: 'بغداد', ordersCount: 11, totalSpent: 1620, lastActivity: 'شراء بطاقة ألعاب رقمية' },
   { id: 'dc_2', name: 'نواف الشهري', phone: '0762233442', city: 'مكة', ordersCount: 7, totalSpent: 790, lastActivity: 'شراء اشتراك رقمي ' },
  ],
  services: [],
  bookings: [],
  menu: [],
  proProjects: [],
  properties: [],
  spareParts: [],
  vehicles: [],
  employees: [
   { id: 'demp_1', name: 'ريان الحربي', role: 'مدير المتجر الرقمي', status: 'نشط', allowedModules: 'جميع الوحدات' },
  ],
  pages: [
   { id: 'dpg_1', title: 'الرئيسية', slug: '/', seoDesc: 'عالم البطاقات والاشتراكات الرقمية', status: 'منشور' },
  ],
  coupons: [],
  quotes: [],
  invoices: [
   { id: 'DINV-10', client: 'تركي العنزي', amount: 740000, date: '2026-10-16', status: 'مدفوعة ' },
  ],
 },
];

/* ==========================================================================
  4. PLATFORM DATA
  ========================================================================== */

const subscribers: Subscriber[] = [
 { id: 'sub_1', name: 'ندى العتيبي', email: 'nada@nada-store.example', projectsCount: 1, activity: 'متجر إلكتروني', plan: 'Growth', status: 'نشط', createdAt: '2026-08-12', aiUsage: '142 طلبًا' },
 { id: 'sub_2', name: 'ماجد الزهراني', email: 'majed@mathaq-rest.example', projectsCount: 1, activity: 'مطعم ومقهى', plan: 'Growth', status: 'نشط', createdAt: '2026-09-01', aiUsage: '98 طلبًا' },
 { id: 'sub_3', name: 'م. سلطان الشمري', email: 'sultan@engine-workshop.example', projectsCount: 1, activity: 'خدمات وصيانة', plan: 'Business', status: 'نشط', createdAt: '2026-09-14', aiUsage: '215 طلبًا' },
 { id: 'sub_4', name: 'م. طارق المهنا', email: 'tareq@abaad-eng.example', projectsCount: 1, activity: 'هندسة وعمارة', plan: 'Business', status: 'نشط', createdAt: '2026-07-20', aiUsage: '310 طلبات' },
 { id: 'sub_5', name: 'ريان الحربي', email: 'rayan@cards-world.example', projectsCount: 1, activity: 'بطاقات وشحن إلكتروني', plan: 'Starter', status: 'نشط', createdAt: '2026-09-25', aiUsage: '64 طلبًا' },
 { id: 'sub_6', name: 'سعد التميمي', email: 'saad@oasis-realty.example', projectsCount: 1, activity: 'عقارات', plan: 'Starter', status: '', createdAt: '2026-10-01', aiUsage: '29 طلبًا' },
];

const aiProviders: AiProvider[] = [
 {
  id: 'prov_openai',
  name: 'OpenAI',
  status: 'نشط',
  model: 'GPT-4o Mini',
  modelId: 'gpt-4o-mini',
  baseUrl: 'https://api.openai.com/v1',
  features: ['توليد النصوص', 'تحليل المبيعات', 'اقتراح الأقسام'],
  connStatus: 'غير مُختبر',
  limit: '50,000 رمز / يوم',
  isDefault: true,
  desc: 'مزود افتراضي لتوليد أوصاف المنتجات والخطط.',
 },
 {
  id: 'prov_anthropic',
  name: 'Claude',
  status: 'نشط',
  model: 'Claude 3.5 Sonnet',
  modelId: 'claude-3-5-sonnet',
  baseUrl: 'https://api.anthropic.com/v1',
  features: ['كتابة إبداعية عربية', 'صياغة عقود وعروض أسعار'],
  connStatus: 'غير مُختبر',
  limit: '40,000 رمز / يوم',
  isDefault: false,
  desc: 'ممتاز لصياغة عروض الأسعار والمحتوى التفصيلي.',
 },
 {
  id: 'prov_gemini',
  name: 'Google Gemini',
  status: 'نشط',
  model: 'Gemini 1.5 Flash',
  modelId: 'gemini-1.5-flash',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  features: ['سرعة الاستجابة', 'تحليل البيانات', 'ملخصات سريعة'],
  connStatus: 'غير مُختبر',
  limit: '100,000 رمز / يوم',
  isDefault: false,
  desc: 'مناسب للمهام السريعة وتلخيص الطلبات.',
 },
 {
  id: 'prov_deepseek',
  name: 'DeepSeek',
  status: 'غير مهيأ',
  model: 'DeepSeek V3',
  modelId: 'deepseek-chat',
  baseUrl: 'https://api.deepseek.com/v1',
  features: ['تحليل التكلفة', 'كتابة تقنية'],
  connStatus: 'غير مُختبر',
  limit: '30,000 رمز / يوم',
  isDefault: false,
  desc: 'خيار اقتصادي لتحليل البيانات ال.',
 },
 {
  id: 'prov_mistral',
  name: 'Mistral AI',
  status: 'غير مهيأ',
  model: 'Mistral Large',
  modelId: 'mistral-large',
  baseUrl: 'https://api.mistral.ai/v1',
  features: ['توليد متعدد اللغات'],
  connStatus: 'غير مُختبر',
  limit: '25,000 رمز / يوم',
  isDefault: false,
  desc: 'مزود أوروبي يدعم تعدد اللغات.',
 },
 {
  id: 'prov_openrouter',
  name: 'OpenRouter',
  status: 'نشط',
  model: 'Auto Router',
  modelId: 'openrouter/auto',
  baseUrl: 'https://openrouter.ai/api/v1',
  features: ['توجيه ذكي بين النماذج'],
  connStatus: 'غير مُختبر',
  limit: '60,000 رمز / يوم',
  isDefault: false,
  desc: 'بوابة موحدة للتبديل بين عشرات النماذج عبر الخادم.',
 },
 {
  id: 'prov_compatible',
  name: 'متوافق مخصص (OpenAI-compatible)',
  status: 'غير مهيأ',
  model: 'Custom Endpoint',
  modelId: 'custom-model',
  baseUrl: 'https://llm.example.com/v1',
  features: ['ربط مخصص متوافق مع معيار OpenAI'],
  connStatus: 'غير مُختبر',
  limit: 'غير محدود ',
  isDefault: false,
  desc: 'لربط أي مزود سحابي يدعم واجهة OpenAI القياسية.',
 },
 {
  id: 'prov_local',
  name: 'نموذج محلي (Local)',
  status: 'نشط',
  model: 'Qwen 2.5 Arabic Local ',
  modelId: 'local-model',
  baseUrl: 'http://localhost:11434/v1',
  features: ['خصوصية محلية على خادم خاص'],
  connStatus: 'محلي',
  limit: 'محلي',
  isDefault: false,
  desc: 'لربط النماذج المستضافة داخليًا عبر خادم المؤسسة.',
 },
];

const aiUsageLogs: AiUsageLog[] = [
 { id: 'ail_1', project: 'متجر ندى', provider: 'OpenAI', model: 'gpt-4o-mini', task: 'كتابة وصف عطر شرقي فاخر', requests: 14, tokens: 6420, estCost: '$0.04', date: '2026-10-16', status: 'مكتمل ' },
 { id: 'ail_2', project: 'مطعم مذاق', provider: 'Google Gemini', model: 'gemini-1.5-flash', task: 'اقتراح عرض غداء ترويجي', requests: 9, tokens: 4100, estCost: '$0.02', date: '2026-10-16', status: 'مكتمل ' },
 { id: 'ail_3', project: 'ورشة المحرك', provider: 'Claude', model: 'claude-3-5-sonnet', task: 'صياغة مسودة عرض سعر صيانة', requests: 18, tokens: 11200, estCost: '$0.11', date: '2026-10-15', status: 'مكتمل ' },
 { id: 'ail_4', project: 'أبعاد للهندسة', provider: 'Claude', model: 'claude-3-5-sonnet', task: 'تحسين وصف مشروع معماري', requests: 27, tokens: 19800, estCost: '$0.19', date: '2026-10-15', status: 'تنبيه اقتراب الحد ال' },
 { id: 'ail_5', project: 'عالم البطاقات', provider: 'OpenRouter', model: 'openrouter/auto', task: 'تنظيم فئات البطاقات الرقمية', requests: 7, tokens: 2900, estCost: '$0.01', date: '2026-10-14', status: 'مكتمل ' },
];

const notifications: Notification[] = [
 { id: 'nt_1', title: 'طلب جديد #ORD-1043', text: 'وصل طلب جديد في متجر ندى بقيمة 1,250,000 د.ع.', time: 'منذ 10 دقائق', read: false, type: 'info' },
 { id: 'nt_2', title: 'تنبيه انخفاض مخزون', text: 'منتج (كريم ترطيب) وصل إلى 4 قطع فقط (الحد الأدنى 12).', time: 'منذ 35 دقيقة', read: false, type: 'warning' },
 { id: 'nt_3', title: 'اكتمال إعداد الموقع ال', text: 'تم حفظ قوالب وأقسام موقع متجر ندى بنجاح.', time: 'منذ ساعتين', read: false, type: 'success' },
 { id: 'nt_4', title: 'تنبيه استهلاك AI ', text: 'مشروع (أبعاد للهندسة) استهلك 80% من الحصة ال الشهرية.', time: 'أمس', read: true, type: 'warning' },
];

const supportTickets: SupportTicket[] = [
 { id: 'TCK-401', ticketNumber: 'TCK-401', subscriber: 'ندى العتيبي', subject: 'استفسار عن ربط نطاق خاص للمتجر', priority: 'متوسطة', status: 'مفتوحة', date: '2026-10-16' },
 { id: 'TCK-402', ticketNumber: 'TCK-402', subscriber: 'م. سلطان الشمري', subject: 'طلب تفعيل وحدة الفواتير والمركبات', priority: 'عالية', status: 'تم الرد ', date: '2026-10-15' },
];

const activityLog: ActivityEntry[] = [
 { id: 'act_1', time: '10:45 ص', actor: 'ندى العتيبي', action: 'تحديث سعر منتج (عطر شرقي فاخر) في متجر ندى' },
 { id: 'act_2', time: '10:15 ص', actor: 'ماجد الزهراني', action: 'تأكيد حجز طاولة عشاء في مطعم مذاق' },
 { id: 'act_3', time: '09:50 ص', actor: 'النظام ال', action: 'حفظ نسخة الحالة في التخزين المحلي للمتصفح' },
];

/* ==========================================================================
  5. INITIAL STATE
  ========================================================================== */

export function getInitialState(): NasaqState {
 return {
  platformSettings: {
   brandName: 'نَسَق',
   brandShort: 'ن',
   primaryColor: '#5B5CE2',
   supportEmail: 'support@nasaq.iq',
   defaultCurrency: 'د.ع',
   maintenanceMode: false,
  },
  userSettings: {
   name: 'مالك المشروع',
   email: 'owner@nasaq.iq',
   role: 'مالك المنصة',
   density: 'normal',
   fontSize: 'normal',
   emailAlerts: true,
   stockAlerts: true,
  },
  activeProjectId: 'proj_store',
  projects,
  templates,
  plans,
  subscribers,
  aiProviders,
  aiUsageLogs,
  notifications,
  supportTickets,
  activityLog,
 };
}
