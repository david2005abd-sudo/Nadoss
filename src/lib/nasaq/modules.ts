/**
 * نَسَق — central module registry engine.
 * Ported verbatim from MODULE_REGISTRY in the original mockup (26 modules).
 */

export type ModuleId = string;

export type ModuleDef = {
 id: ModuleId;
 name: string;
 description: string;
 icon: string;
 supportedBusinessTypes: string[];
 dependencies: ModuleId[];
 defaultEnabled: boolean;
 availableInPlans: string[];
 permissions: string[];
 route: string;
 status: string;
 recommendReason: string;
};

export const MODULE_REGISTRY: Record<ModuleId, ModuleDef> = {
 dashboard: {
  id: 'dashboard', name: 'نظرة عامة', description: 'ملخص المؤشرات، المبيعات، والنشاط اليومي حسب نوع مشروعك.',
  icon: 'home', supportedBusinessTypes: ['all'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner', 'manager', 'staff'],
  route: 'dashboard', status: 'active', recommendReason: 'أساسي لمتابعة أداء المشروع اليومي',
 },
 products: {
  id: 'products', name: 'المنتجات', description: 'إدارة قائمة المنتجات، الأسعار، الصور ال، وحالة التوفر.',
  icon: 'bag', supportedBusinessTypes: ['store', 'digital', 'cards', 'autoparts', 'mixed', 'other'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'products', status: 'active', recommendReason: 'مقترح لأن نشاطك يعتمد على عرض وبيع المنتجات',
 },
 categories: {
  id: 'categories', name: 'الفئات', description: 'تنظيم المنتجات أو الوجبات أو العقارات في تصنيفات واضحة.',
  icon: 'folder', supportedBusinessTypes: ['store', 'restaurant', 'realestate', 'digital', 'autoparts', 'mixed'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'categories', status: 'active', recommendReason: 'يسهل تصفح العملاء لأقسام موقعك',
 },
 inventory: {
  id: 'inventory', name: 'المخزون', description: 'مراقبة الكميات المتوفرة، الحد الأدنى، وتنبيهات انخفاض المخزون.',
  icon: 'box', supportedBusinessTypes: ['store', 'maintenance', 'autoparts', 'mixed'], dependencies: ['products'], defaultEnabled: true,
  availableInPlans: ['Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'inventory', status: 'active', recommendReason: 'لمتابعة الكميات وتفادي نفاد الأصناف',
 },
 orders: {
  id: 'orders', name: 'الطلبات', description: 'إدارة طلبات العملاء، تحديث حالات الطلب، وعرض سجل التغييرات.',
  icon: 'cart', supportedBusinessTypes: ['store', 'restaurant', 'digital', 'cards', 'autoparts', 'mixed'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner', 'manager', 'staff'],
  route: 'orders', status: 'active', recommendReason: 'لاستقبال ومتابعة طلبات الشراء خطوة بخطوة',
 },
 menu: {
  id: 'menu', name: 'المنيو والوجبات', description: 'إدارة قائمة الطعام والمشروبات، الإضافات، وتمييز الأصناف الأكثر طلبًا.',
  icon: 'utensils', supportedBusinessTypes: ['restaurant', 'mixed'], dependencies: ['categories'], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'menu', status: 'active', recommendReason: 'مخصص للمطاعم والمقاهي لعرض الوجبات والإضافات',
 },
 services: {
  id: 'services', name: 'الخدمات', description: 'تعريف الخدمات المقدمة، مدة التنفيذ، والأسعار التقديرية.',
  icon: 'wrench', supportedBusinessTypes: ['maintenance', 'engineering', 'beauty', 'education', 'tech', 'mixed', 'other'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'services', status: 'active', recommendReason: 'لعرض خدماتك المهنية أو الفنية بوضوح للعملاء',
 },
 bookings: {
  id: 'bookings', name: 'الحجوزات والمواعيد', description: 'جدولة مواعيد العملاء، تأكيد الحجوزات أو إلغاؤها، وفلترة الأوقات.',
  icon: 'calendar', supportedBusinessTypes: ['restaurant', 'maintenance', 'realestate', 'beauty', 'education', 'mixed'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner', 'manager', 'staff'],
  route: 'bookings', status: 'active', recommendReason: 'لتنظيم مواعيد الزيارات أو الفحص أو الجلسات',
 },
 projects: {
  id: 'projects', name: 'المشاريع المهنية', description: 'متابعة عقود ومشاريع العملاء، التواريخ المتوقعة، ومراحل الإنجاز.',
  icon: 'compass', supportedBusinessTypes: ['engineering', 'tech', 'mixed'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'projects', status: 'active', recommendReason: 'مخصص للمكاتب الهندسية والشركات التقنية والاستشارية',
 },
 portfolio: {
  id: 'portfolio', name: 'معرض الأعمال', description: 'عرض نماذج الأعمال والمشاريع المنجزة لإبراز خبرة مكتبك.',
  icon: 'layers', supportedBusinessTypes: ['engineering', 'tech', 'beauty', 'mixed'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'portfolio', status: 'active', recommendReason: 'لإبراز سابقة أعمالك أمام العملاء المحتملين',
 },
 properties: {
  id: 'properties', name: 'العقارات', description: 'إدارة العروض العقارية (بيع/إيجار)، المدن، الأسعار، وحالة العرض.',
  icon: 'home', supportedBusinessTypes: ['realestate', 'mixed'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'properties', status: 'active', recommendReason: 'مخصص لمكاتب العقارات والتطوير العقاري',
 },
 vehicles: {
  id: 'vehicles', name: 'المركبات', description: 'سجل مركبات العملاء وتاريخ الفحص والصيانة الدورية.',
  icon: 'truck', supportedBusinessTypes: ['maintenance', 'autoparts'], dependencies: ['customers'], defaultEnabled: true,
  availableInPlans: ['Growth', 'Business'], permissions: ['owner', 'manager', 'staff'],
  route: 'vehicles', status: 'active', recommendReason: 'لربط طلبات الصيانة بمركبات العملاء',
 },
 spareParts: {
  id: 'spareParts', name: 'قطع الغيار', description: 'إدارة قطع الغيار وأرقامها المصنعية (OEM) وتوافق المركبات.',
  icon: 'cog', supportedBusinessTypes: ['maintenance', 'autoparts', 'mixed'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'spareParts', status: 'active', recommendReason: 'لإدارة القطع وتوافقها مع الموديلات',
 },
 digitalDelivery: {
  id: 'digitalDelivery', name: 'التسليم الرقمي', description: 'إدارة تسليم الأكواد والملفات الرقمية والاشتراكات الفورية.',
  icon: 'cpu', supportedBusinessTypes: ['digital', 'cards', 'education', 'mixed'], dependencies: ['products'], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'digitalDelivery', status: 'active', recommendReason: 'لأتمتة تسليم البطاقات والمنتجات الرقمية',
 },
 stock: {
  id: 'stock', name: 'مخزون الأكواد والبطاقات', description: 'متابعة رصيد البطاقات الرقمية والأكواد الجاهزة للتسليم.',
  icon: 'card', supportedBusinessTypes: ['cards', 'digital'], dependencies: ['digitalDelivery'], defaultEnabled: true,
  availableInPlans: ['Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'stock', status: 'active', recommendReason: 'لمراقبة أرصدة بطاقات الشحن والأكواد',
 },
 quotes: {
  id: 'quotes', name: 'عروض الأسعار', description: 'إنشاء وإرسال عروض الأسعار التقديرية للعملاء ومتابعة الموافقة.',
  icon: 'file', supportedBusinessTypes: ['maintenance', 'engineering', 'realestate', 'tech', 'mixed'], dependencies: ['customers'], defaultEnabled: true,
  availableInPlans: ['Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'quotes', status: 'active', recommendReason: 'لتقديم تسعيرات رسمية للمشاريع والخدمات',
 },
 invoices: {
  id: 'invoices', name: 'الفواتير', description: 'إصدار فواتير ومتابعة حالات السداد.',
  icon: 'receipt', supportedBusinessTypes: ['maintenance', 'engineering', 'cards', 'tech', 'mixed'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'invoices', status: 'active', recommendReason: 'لتنظيم المطالبات المالية والفواتير ال',
 },
 delivery: {
  id: 'delivery', name: 'التوصيل والشحن', description: 'متابعة مناديب التوصيل ومناطق التغطية وحالات الشحن.',
  icon: 'truck', supportedBusinessTypes: ['restaurant', 'store', 'autoparts', 'mixed'], dependencies: ['orders'], defaultEnabled: true,
  availableInPlans: ['Growth', 'Business'], permissions: ['owner', 'manager', 'staff'],
  route: 'delivery', status: 'active', recommendReason: 'لتتبع توصيل الطلبات للعملاء',
 },
 customers: {
  id: 'customers', name: 'العملاء', description: 'قاعدة بيانات العملاء، سجل الطلبات، وإجمالي المشتريات ال.',
  icon: 'users', supportedBusinessTypes: ['all'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'customers', status: 'active', recommendReason: 'أساسي لبناء علاقة مستدامة مع عملائك',
 },
 employees: {
  id: 'employees', name: 'الموظفون والفريق', description: 'إدارة أعضاء الفريق وأدوارهم والوحدات المسموح لهم بالوصول إليها.',
  icon: 'users', supportedBusinessTypes: ['maintenance', 'engineering', 'beauty', 'tech', 'mixed'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Business'], permissions: ['owner'],
  route: 'employees', status: 'active', recommendReason: 'لتوزيع المهام والصلاحيات ال على فريق العمل',
 },
 marketing: {
  id: 'marketing', name: 'التسويق والعروض', description: 'إنشاء كوبونات خصم وحملات ترويجية لزيادة المبيعات.',
  icon: 'sparkle', supportedBusinessTypes: ['store', 'restaurant', 'digital', 'beauty', 'mixed'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'marketing', status: 'active', recommendReason: 'لتنشيط المبيعات عبر العروض والكوبونات',
 },
 files: {
  id: 'files', name: 'الملفات والمخططات', description: 'مكتبة لحفظ المخططات الهندسية والعقود والملفات المرفقة ال.',
  icon: 'folder', supportedBusinessTypes: ['engineering', 'tech', 'realestate', 'education'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'files', status: 'active', recommendReason: 'لحفظ ومشاركة ملفات المشاريع والمخططات',
 },
 analytics: {
  id: 'analytics', name: 'التحليلات والتقارير', description: 'رسوم بيانية تفاعلية لنمو المبيعات، الطلبات، ومقارنة الفترات.',
  icon: 'chart', supportedBusinessTypes: ['all'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'analytics', status: 'active', recommendReason: 'لقراءة مؤشرات الأداء واتخاذ قرارات مبنية على البيانات',
 },
 content: {
  id: 'content', name: 'المحتوى والصفحات', description: 'إدارة صفحات الموقع، العناوين، أوصاف SEO، وحالة النشر ال.',
  icon: 'layout', supportedBusinessTypes: ['all'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner', 'manager'],
  route: 'content', status: 'active', recommendReason: 'للتحكم بصفحات موقعك الإلكتروني ومحتواها',
 },
 aiAssistant: {
  id: 'aiAssistant', name: 'المساعد الذكي (AI)', description: 'توليد أوصاف المنتجات، خطط التسويق، عروض الأسعار، وتحليل النشاط.',
  icon: 'sparkle', supportedBusinessTypes: ['all'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner', 'manager', 'staff'],
  route: 'aiAssistant', status: 'active', recommendReason: 'لتسريع كتابة المحتوى وتحليل البيانات بالذكاء الاصطناعي',
 },
 moduleSettings: {
  id: 'moduleSettings', name: 'تخصيص الوحدات', description: 'إظهار أو إخفاء أو إعادة ترتيب أقسام لوحة التحكم وتثبيت المفضلة.',
  icon: 'layers', supportedBusinessTypes: ['all'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner'],
  route: 'moduleSettings', status: 'active', recommendReason: 'لتكييف القائمة الجانبية حسب رغبتك',
 },
 settings: {
  id: 'settings', name: 'الإعدادات', description: 'إعدادات المشروع، المستخدم، المنصة، والخصوصية وإدارة بيانات المشروع.',
  icon: 'cog', supportedBusinessTypes: ['all'], dependencies: [], defaultEnabled: true,
  availableInPlans: ['Starter', 'Growth', 'Business'], permissions: ['owner'],
  route: 'settings', status: 'active', recommendReason: 'لضبط هوية المشروع وتفضيلات الحساب',
 },
};

export const MODULE_IDS = Object.keys(MODULE_REGISTRY) as ModuleId[];

/** Modules that can never be disabled. */
export const CORE_MODULES: ModuleId[] = ['dashboard', 'settings'];

export const BUSINESS_DEFAULT_MODULES: Record<string, ModuleId[]> = {
 store: ['dashboard', 'products', 'categories', 'inventory', 'orders', 'customers', 'marketing', 'analytics', 'content', 'aiAssistant', 'moduleSettings', 'settings'],
 restaurant: ['dashboard', 'menu', 'categories', 'orders', 'bookings', 'delivery', 'customers', 'analytics', 'marketing', 'content', 'aiAssistant', 'moduleSettings', 'settings'],
 maintenance: ['dashboard', 'services', 'bookings', 'customers', 'vehicles', 'spareParts', 'inventory', 'quotes', 'invoices', 'employees', 'analytics', 'content', 'aiAssistant', 'moduleSettings', 'settings'],
 engineering: ['dashboard', 'projects', 'portfolio', 'services', 'customers', 'quotes', 'files', 'employees', 'analytics', 'content', 'aiAssistant', 'moduleSettings', 'settings'],
 realestate: ['dashboard', 'properties', 'categories', 'customers', 'bookings', 'quotes', 'analytics', 'content', 'aiAssistant', 'moduleSettings', 'settings'],
 digital: ['dashboard', 'products', 'categories', 'orders', 'digitalDelivery', 'customers', 'marketing', 'analytics', 'content', 'aiAssistant', 'moduleSettings', 'settings'],
 cards: ['dashboard', 'products', 'orders', 'digitalDelivery', 'stock', 'customers', 'invoices', 'analytics', 'aiAssistant', 'moduleSettings', 'settings'],
 beauty: ['dashboard', 'services', 'bookings', 'customers', 'products', 'employees', 'marketing', 'analytics', 'content', 'aiAssistant', 'moduleSettings', 'settings'],
 education: ['dashboard', 'services', 'bookings', 'digitalDelivery', 'customers', 'files', 'analytics', 'content', 'aiAssistant', 'moduleSettings', 'settings'],
 tech: ['dashboard', 'projects', 'portfolio', 'services', 'quotes', 'invoices', 'customers', 'employees', 'analytics', 'content', 'aiAssistant', 'moduleSettings', 'settings'],
 autoparts: ['dashboard', 'spareParts', 'products', 'categories', 'inventory', 'vehicles', 'orders', 'customers', 'analytics', 'content', 'aiAssistant', 'moduleSettings', 'settings'],
 mixed: ['dashboard', 'products', 'services', 'orders', 'bookings', 'inventory', 'customers', 'quotes', 'analytics', 'content', 'aiAssistant', 'moduleSettings', 'settings'],
 other: ['dashboard', 'services', 'products', 'orders', 'customers', 'analytics', 'content', 'aiAssistant', 'moduleSettings', 'settings'],
};

/**
 * Suggest the modules a project should start with, based on its business
 * type plus the goals picked during onboarding.
 * Goals are spliced in just before the trailing aiAssistant/moduleSettings/settings
 * block, matching the original behaviour.
 */
export function getRecommendedModules(
 businessType: string,
 selectedGoals: string[] | undefined,
 allGoals: { id: string; modules: string[] }[],
): ModuleId[] {
 const base = [...(BUSINESS_DEFAULT_MODULES[businessType] ?? BUSINESS_DEFAULT_MODULES.store)];

 if (Array.isArray(selectedGoals)) {
  for (const gId of selectedGoals) {
   const goal = allGoals.find((g) => g.id === gId);
   if (!goal?.modules) continue;
   for (const m of goal.modules) {
    if (!base.includes(m) && MODULE_REGISTRY[m]) {
     base.splice(Math.max(0, base.length - 3), 0, m);
    }
   }
  }
 }

 return base;
}

export function supportsBusinessType(mod: ModuleDef, businessType: string): boolean {
 return mod.supportedBusinessTypes.includes('all') || mod.supportedBusinessTypes.includes(businessType);
}
