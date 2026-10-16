# DEPLOY.md — دليل النشر المفصل

## نظرة عامة

نادوس = Next.js (Vercel) + PostgreSQL (Supabase). كل الخدمات الأساسية مجانية للبدء.

```
المستخدم → Vercel (Next.js) → Supabase (PostgreSQL + Auth + Storage)
```

---

## 1. إنشاء قاعدة البيانات (Supabase)

1. [supabase.com](https://supabase.com) → Sign up → **New Project**
2. الاسم: `nados-prod` | كلمة مرور قوية (احفظها!) | المنطقة: `Frankfurt (eu-central-1)`
3. انتظر دقيقتين حتى يجهز المشروع

### تطبيق المخطط

**الطريقة أ — SQL Editor (الأسهل):**
افتح **SQL Editor** في لوحة Supabase، وانسخ ونفّذ كل ملف بالترتيب:
1. `supabase/migrations/00001_initial_schema.sql`
2. `supabase/migrations/00002_rls_policies.sql`
3. `supabase/migrations/00003_custom_access_token_hook.sql`
4. `supabase/migrations/00004_seed_data.sql`
5. `supabase/migrations/00005_auto_tenant_on_signup.sql`
6. `supabase/migrations/00006_functions.sql`

**الطريقة ب — Supabase CLI:**
```bash
npm i -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### جلب المفاتيح
**Project Settings → API:**
- `Project URL` = `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` = `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` = `SUPABASE_SERVICE_ROLE_KEY` ⚠️ سري جدًا

### (اختياري) تفعيل JWT Hook
لتضمين `tenant_id` في التوكن (أداء RLS أفضل):
**Authentication → Hooks → Custom Access Token Hook** → اختر `custom_access_token_hook`

---

## 2. النشر (Vercel)

1. [vercel.com](https://vercel.com) → Sign up with GitHub
2. **Add New → Project** → استورد `david2005abd-sudo/Work10`
3. Framework: Next.js (يُكتشف تلقائيًا) — لا تغيّر إعدادات البناء
4. **Environment Variables** — أضف:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
CREDENTIALS_ENCRYPTION_KEY=<نص عشوائي 32+ حرفًا>
CRON_SECRET=<نص عشوائي>
```

لإنشاء نصوص عشوائية:
```bash
openssl rand -hex 32
```

5. اضغط **Deploy** — بعد ~2 دقيقة موقعك حي على `https://your-app.vercel.app`

### التحقق من النشر

```bash
# فحص الصحة
curl https://your-app.vercel.app/api/health

# المتوقع:
# {"status":"healthy","checks":{"app":{"status":"ok"},"database":{"status":"ok",...}}}
```

إذا ظهر `degraded` مع `database: fail` → راجع متغيرات البيئة.

### دومين مخصص (اختياري)
**Vercel → Settings → Domains** → أضف دومينك → حدّث DNS حسب التعليمات → حدّث `NEXT_PUBLIC_SITE_URL`

---

## 3. المصادقة

### افتراضيًا (بدون SMS)
Supabase Auth يدعم الهاتف لكن يحتاج مزود SMS مدفوعًا. للبدء السريع:

**الخيار أ — بريد إلكتروني:** عدّل `registerAction` في `src/app/(auth)/actions.ts` لاستخدام `email` بدل `phone` في `signUp`.

**الخيار ب — Twilio Verify:**
1. أنشئ حساب [Twilio](https://www.twilio.com) (له تجربة مجانية)
2. Supabase → **Authentication → Providers → Phone** → فعّل وأدخل `Account SID` و`Auth Token` و`Verify Service SID`

### إعدادات مهمة
- **Authentication → URL Configuration:** أضف رابط Vercel في `Site URL` و`Redirect URLs`
- **Authentication → Providers:** فعّل Phone فقط إن كان عندك مزود SMS

---

## 4. ما بعد النشر

### اختبار التسجيل
1. افتح `https://your-app.vercel.app/register`
2. سجّل حسابًا جديدًا
3. تحقق في Supabase → **Table Editor**:
   - `tenants` — صف جديد باسم متجرك ✅
   - `memberships` — صف بدور owner ✅
   - `subscriptions` — اشتراك خطة free ✅

هذا يعني أن Trigger `handle_new_user()` يعمل.

### مراقبة
- `/api/health` — صحّة التطبيق + قاعدة البيانات
- Vercel Analytics — الأداء والزوار
- Supabase Dashboard — الاستعلامات والموارد

### النسخ الاحتياطي
Supabase Free: نسخة احتياطية يومية لمدة 7 أيام. للإنتاج الجدي: خطة Pro مع PITR.

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---|---|
| `Supabase is not configured` | متغيرات البيئة ناقصة في Vercel — أضفها وأعد النشر |
| صفحة تسجيل الدخول لا تعمل | فعّل مزود الهاتف/البريد في Supabase Auth |
| `relation "tenants" does not exist` | لم تُطبق migrations — نفّذها من SQL Editor |
| التسجيل لا ينشئ متجرًا | تحقق من تنفيذ migration 00005 (Trigger) |
| `RLS` يحجب كل شيء | تحقق من تنفيذ migration 00002 + JWT Hook (00003) |
