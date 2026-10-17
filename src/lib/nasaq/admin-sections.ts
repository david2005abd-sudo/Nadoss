/** أقسام لوحة المالك — مصدر واحد للقائمة الجانبية وصفحة /admin/. */

export const ADMIN_SECTIONS = [
  { id: 'overview', label: 'نظرة عامة على المنصة', icon: 'chart', desc: 'مؤشرات المشتركين والإيرادات واستهلاك الذكاء الاصطناعي.', href: '/admin/overview' },
  { id: 'subscribers', label: 'المشتركون', icon: 'users', desc: 'قائمة المشتركين وباقاتهم وحالة اشتراكهم.', href: '/admin/subscribers' },
  { id: 'projects', label: 'المشاريع المنشأة', icon: 'layers', desc: 'كل المشاريع التي أنشأها المشتركون وحالة مواقعها.', href: '/admin/projects' },
  { id: 'plans', label: 'الباقات والأسعار', icon: 'receipt', desc: 'إضافة أو تعديل باقات الاشتراك وأسعارها وحدودها.', href: '/admin/plans' },
  { id: 'modules', label: 'محرك الوحدات', icon: 'grid', desc: 'جدول وحدات المنصة مع الأنشطة والاعتماديات والصلاحيات.', href: '/admin/modules' },
  { id: 'ai', label: 'مزودو الذكاء الاصطناعي', icon: 'sparkle', desc: 'إدارة المزودين والموديلات والحدود والمزود الافتراضي.', href: '/admin/ai' },
  { id: 'ai-usage', label: 'استهلاك الذكاء الاصطناعي', icon: 'chart', desc: 'سجلات الطلبات والتوكنات والتكلفة حسب المشروع.', href: '/admin/ai-usage' },
  { id: 'notifications', label: 'الإشعارات والتقارير', icon: 'bell', desc: 'إشعارات المنصة وتحديدها كمقروءة.', href: '/admin/notifications' },
  { id: 'activity', label: 'سجل الإجراءات', icon: 'file', desc: 'سجل تدقيق لأحداث إدارة المنصة.', href: '/admin/activity' },
  { id: 'support', label: 'تذاكر الدعم الفني', icon: 'file', desc: 'طلبات الدعم وأولوياتها وحالاتها.', href: '/admin/support' },
  { id: 'branding', label: 'الهوية والإعدادات العامة', icon: 'cog', desc: 'اسم المنصة ولونها وبريد الدعم والعملة ووضع الصيانة.', href: '/admin/branding' },
] as const;
