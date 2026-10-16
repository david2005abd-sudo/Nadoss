# TODO.md — المهام القادمة

## للنشر الفوري (يحتاج المستخدم)
- [ ] إنشاء مشروع Supabase وتطبيق migrations الـ6 (دليل: README.md)
- [ ] إضافة متغيرات البيئة في Vercel والنشر
- [ ] تفعيل مزود SMS أو التحويل للبريد الإلكتروني في المصادقة

## المرحلة 5 — التكاملات (الأولوية القادمة)
- [ ] Supabase Storage bucket لصور المنتجات + سياسات RLS
- [ ] صفحة إضافة/تعديل منتج كاملة مع رفع صور
- [ ] Checkout في المتجر العام: سلة + إنشاء طلب (COD)
- [ ] Server Action إنشاء طلب من المتجر مع خصم مخزون ذري
- [ ] صفحة تأكيد الطلب

## المرحلة 6 — التوصيل
- [ ] واجهة DeliveryAdapter (TypeScript)
- [ ] HiExpressAdapter + BoxyAdapter + GalinaAdapter
- [ ] تشفير بيانات الاعتماد AES-256-GCM
- [ ] صفحة ربط شركات التوصيل
- [ ] Webhook موحد `/api/webhooks/delivery/[provider]`

## المرحلة 7 — الدفع
- [ ] iraqpay integration (ZainCash + FIB)
- [ ] Payment callback مع idempotency
- [ ] تحديث حالة الطلب عند الدفع

## المرحلة 8 — بوت الواتساب
- [ ] Webhook WhatsApp Cloud API + التحقق بالتوقيع
- [ ] GPT-4o mini استخراج باللهجة العراقية
- [ ] pg_trgm لمطابقة المنتجات
- [ ] صفحة المحادثات

## المرحلة 9 — الفوترة
- [ ] صفحة الاشتراك والفواتير
- [ ] حواجز الحدود (checkQuota)
- [ ] Cron تجديد الاشتراكات

## تحسينات مستمرة
- [ ] اختبارات Playwright E2E
- [ ] Sentry لرصد الأخطاء
- [ ] صور OG ديناميكية للمتاجر
- [ ] sitemap.xml + robots.txt
