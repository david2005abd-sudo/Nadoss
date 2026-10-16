## [0.1.5] — 2026-10-16
### إصلاحات RLS
- إضافة migration 00019 لتفعيل RLS على subscription_plans وiraq_governorates وdelivery_companies وwhatsapp_pricing_rates.
- إضافة سياسات قراءة صريحة للخطط والمحافظات وشركات التوصيل النشطة، وقصر قراءة أسعار WhatsApp على المستخدمين المسجلين.

## [0.1.4] — 2026-10-16
### إصلاحات أمان وتدفقات الحساب
- استعادة كلمة المرور لحسابات الهاتف عبر SMS OTP وصفحة تعيين كلمة مرور جديدة.
- رفض بوابات الدفع غير المعروفة ومقارنة مبلغ callback الموثّق بإجمالي الطلب قبل اعتماد الدفع.
- إيقاف WhatsApp webhook في الإنتاج عند غياب سر التوقيع بدل قبول طلبات غير موقعة.

## [0.1.3] — 2026-10-16
### إصلاحات ما قبل التحقق
- إصلاح SQL في migration 00005 الذي كان يعلّق عبارة إنشاء المتجر.
- إضافة supabase/config.toml مع custom access-token hook للبيئة المحلية.
- إضافة صلاحية schema المطلوبة وتأمين hook كـ SECURITY DEFINER مع search_path ثابت.
- إضافة سكربت لإنشاء مستخدم تاجر لاختبارات E2E والتحقق من العضوية.
- إصلاح تدفق GitHub Actions لمفاتيح Supabase المحلية وseed وwait-on.

## [0.1.2] — 2026-10-16
### أُضيف
- src/lib/validations/booking.ts — schemas + state machine
- src/app/dashboard/bookings/actions.ts — 9 server actions
- src/lib/whatsapp/sender.ts — outbound-only WhatsApp sender
- صفحات لوحة التحكم: bookings list, new, detail, services, staff, calendar
- مكونات: BookingForm, BookingStatusBadge, BookingStatusUpdater, RescheduleForm, BookingCalendar, ServiceCategoryCreateForm, ServiceCategoryRowActions, StaffCreateForm
- صفحة عامة: /store/[slug]/book (Wizard 3 خطوات) + success
- إشعار WhatsApp للتاجر عند حجز جديد
- تحديث sidebar بقسم "الحجوزات"

## [0.1.1] — 2026-10-16
- WhatsApp Cost Tracker + Wayl Integration (المرحلة 10 — الجزء 2)
