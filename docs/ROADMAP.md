# ROADMAP.md — خطة العمل

## ✅ المرحلة 0 — التأسيس (مكتملة)
- [x] هيكل Next.js 14 + TypeScript + Tailwind
- [x] ملفات الذاكرة في docs/
- [x] تكوين Vercel + متغيرات البيئة

## ✅ المرحلة 1 — قاعدة البيانات (مكتملة)
- [x] 22 جدولًا: tenants, memberships, products, orders, customers, order_items, categories, shipments, delivery_companies, tenant_delivery_accounts, conversations, messages, ai_extractions, subscription_plans, subscriptions, invoices, usage_counters, support_tickets, audit_log, whatsapp_numbers, service_categories, staff_members, bookings
- [x] RLS على كل جدول فيه tenant_id
- [x] Seed: 18 محافظة + 7 شركات توصيل + 4 خطط اشتراك
- [x] فهارس مركبة على أعمدة RLS

## ✅ المرحلة 2 — المصادقة (مكتملة)
- [x] تسجيل/دخول برقم هاتف عراقي (+964)
- [x] Zod validation (078/079 Zain، 077 Asiacell، 075 Korek)
- [x] Trigger إنشاء متجر تلقائي عند التسجيل
- [x] صفحات مصادقة RTL كاملة

## ✅ المرحلة 3 — الواجهات الأساسية (مكتملة)
- [x] صفحة هبوط تسويقية (ميزات، أسعار، FAQ)
- [x] لوحة تحكم: نظرة عامة بإحصائيات حية
- [x] صفحات المنتجات والطلبات
- [x] واجهة متجر عامة `/store/[slug]`

## ✅ المرحلة 4 — الأمان والنشر (مكتملة)
- [x] Middleware حماية مسارات
- [x] API صحة النظام
- [x] دليل نشر كامل
- [x] CI على GitHub Actions

## 🔲 المرحلة 5 — التكاملات (تصميم جاهز، تنفيذ قادم)
- [ ] Supabase Storage لصور المنتجات
- [ ] Checkout كامل مع إنشاء طلب من المتجر
- [ ] DeliveryAdapter: Hi Express + Boxy + Galina
- [ ] بوابات الدفع: ZainCash + FIB عبر iraqpay

## 🔲 المرحلة 6 — بوت الذكاء الاصطناعي
- [ ] WhatsApp Cloud API webhook
- [ ] GPT-4o mini Function Calling باللهجة العراقية
- [ ] مطابقة منتجات fuzzy (pg_trgm)
- [ ] إنشاء طلب draft تلقائي

## 🔲 المرحلة 7 — الاشتراكات والفواتير
- [ ] صفحة الفواتير + حدود الاستخدام المرئية
- [ ] تتبع تكلفة WhatsApp API

## 🔲 المرحلة 8 — الدعم والحجوزات
- [ ] تذاكر دعم + SLA
- [ ] نظام حجز المواعيد (الجداول جاهزة)
