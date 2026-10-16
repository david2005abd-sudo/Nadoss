# LAUNCH_CHECKLIST.md — قائمة مراجعة الإطلاق

## 🔴 حرج (يجب أن يكتمل 100%)

### قاعدة البيانات
- [ ] **RLS مفعّل على كل جدول** — تحقق بـ:
      `SELECT tablename FROM pg_tables WHERE schemaname='public' AND rowsecurity=false;`
      (يجب أن تُرجع صفر صفوف)
- [ ] `service_role` key غير مكشوف في العميل
- [ ] `SUPABASE_POOLED_URL` مُعيّن ومستخدم في serverless
- [ ] `public_storefronts` لا يعرض إلا الأعمدة العامة، وكل طلب عام محمي بـ public_access_token
- [ ] النسخ الاحتياطي اليومي (PITR) مفعّل على Supabase Pro
- [ ] قيود الشبكة (Network Restrictions) مُعدّة على IP معروفة
- [ ] Custom domain مُعدّ لـ Supabase API

### المصادقة
- [ ] Email/SMS templates مُخصّصة بالعربية + شعار المتجر
- [ ] Rate limiting على `/api/auth/*`
- [ ] Supabase Auth: Confirm phone للإنتاج
- [ ] اختبار SMS OTP لاستعادة كلمة المرور، والتأكد من عدم كشف وجود الحساب
- [ ] RLS على `auth.users` (غير مطلوب — Supabase يتكفل)

### الدفع
- [ ] مفاتيح الإنتاج لـ ZainCash, FIB, QiCard, NassPay
- [ ] Webhook URLs مُسجّلة عند كل بوابة
- [ ] اختبار دفع حقيقي بقيمة صغيرة لكل بوابة
- [ ] Idempotency على `/api/payments/callback`
- [ ] اختبار رفض المبلغ المفقود/غير المطابق، والـ callbacks المتأخرة، والطلبات الملغاة
- [ ] اختبار rollback ذري للمخزون عند فشل إنشاء الطلب، واختبار استرجاع المخزون عند إلغاء طلب غير مدفوع

### الأمان
- [ ] HTTPS إلزامي (Vercel افتراضي)
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] Zod validation على كل Server Action
- [ ] Audit log يعمل
- [ ] Rate limiting على APIs العامة
- [ ] `CREDENTIALS_ENCRYPTION_KEY` قوي (32+ حرف)

### المراقبة
- [ ] Sentry DSN مُعيّن (client + server + edge)
- [ ] Sentry alert rules (rate > 10 errors/min)
- [ ] Health check `/api/health` يعمل
- [ ] UptimeRobot/BetterStack يراقب `/api/health` كل دقيقة
- [ ] Vercel Analytics + Speed Insights مفعّلان

## 🟡 مهم (قبل الإطلاق)

### الأداء
- [ ] Core Web Vitals: LCP < 2.5s، INP < 200ms، CLS < 0.1
- [ ] Lighthouse score > 90 (mobile)
- [ ] Connection pooling مُختبر تحت حمل
- [ ] فهارس على أعمدة RLS (tenant_id, user_id)
- [ ] RLS subqueries مُخزّنة عبر `(SELECT auth.jwt())`

### SEO + Content
- [ ] `generateMetadata` على كل صفحة عامة
- [ ] Sitemap.xml + robots.txt
- [ ] OG images للمتاجر
- [ ] Structured data (Organization, Product)
- [ ] `hreflang` (ar-IQ)

### تجربة المستخدم
- [ ] Empty states على كل صفحة
- [ ] Loading states + skeletons
- [ ] Error boundaries (global + dashboard)
- [ ] 404 / 500 pages مُخصصة
- [ ] RTL كامل على كل الصفحات

## 🟢 مفيد (ما بعد الإطلاق)

- [ ] Sentry Session Replay مفعّل
- [ ] A/B testing framework
- [ ] Onboarding tour تفاعلي
- [ ] In-app notifications (Bell icon)
- [ ] Export CSV للطلبات والعملاء
- [ ] Bulk actions (delete, status update)

## 📋 خطوات النشر

1. [ ] إنشاء مشروع Supabase إنتاجي منفصل
2. [ ] تطبيق migrations 00001–00020: `supabase db push`
3. [ ] تطبيق seed يدويًا للـ demo tenant
4. [ ] إنشاء مشروع Sentry + نسخ DSN
5. [ ] إنشاء مشروع Vercel + ربط GitHub
6. [ ] إضافة كل environment variables في Vercel
7. [ ] تعيين Supabase URLs في Vercel domains
8. [ ] اختبار staging deployment
9. [ ] ربط custom domain (nados.iq)
10. [ ] تغيير DNS
11. [ ] اختبار كل flow يدويًا في الإنتاج
12. [ ] تفعيل cron jobs
13. [ ] مراقبة Sentry لمدة 24 ساعة
