# نادوس (NADOS) 🇮🇶

**N**ew **A**ge **D**igital **O**nline **S**ervice — منصة SaaS عراقية متعددة المستأجرين تمنح التجار متجرًا إلكترونيًا كاملًا + إدارة مخزون + تتبع طلبات + ربط شركات توصيل محلية + بوت ذكاء اصطناعي يحوّل رسائل واتساب إلى طلبات منظمة — بدون خبرة تقنية.

[![CI](https://github.com/david2005abd-sudo/Work10/actions/workflows/ci.yml/badge.svg)](https://github.com/david2005abd-sudo/Work10/actions)

## الميزات

- 🏪 **متجر إلكتروني** — واجهة عربية RTL كاملة، رابط خاص لكل متجر (`/store/[slug]`)
- 📦 **إدارة مخزون** — منتجات، تصنيفات، أسعار بالدينار العراقي، تنبيهات المخزون المنخفض
- 🛒 **إدارة الطلبات** — آلة حالات كاملة: `draft → pending → confirmed → preparing → ready → shipped → delivered`
- 🚚 **ربط شركات التوصيل** — Hi Express، Boxy (15+ شركة)، Galina Express + 4 شركات يدوية
- 💳 **الدفع** — COD افتراضيًا + جاهز لزين كاش وFIB وكي كارد وناس باي وWayl
- 🤖 **بوت واتساب** (قيد التطوير) — يفهم اللهجة العراقية ويحوّل الرسائل إلى طلبات
- 📅 **حجز مواعيد** (قيد التطوير) — خدمات + موظفون + تقويم
- 📊 **تقارير** — إيرادات، أفضل المنتجات، أفضل المحافظات
- 🔐 **أمان** — عزل متعدد المستأجرين عبر Row Level Security على مستوى قاعدة البيانات

## التقنيات

| الطبقة | التقنية |
|---|---|
| الواجهة | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| قاعدة البيانات | PostgreSQL على Supabase + RLS |
| المصادقة | Supabase Auth (رقم هاتف عراقي +964) |
| الاستضافة | Vercel |
| التحقق | Zod |

## التشغيل المحلي

```bash
# 1. تثبيت الحزم
npm install

# 2. إعداد المتغيرات البيئية
cp .env.example .env.local
# ثم املأ قيم Supabase (انظر قسم النشر أدناه)

# 3. التشغيل
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

## النشر على Vercel + Supabase (موقع حقيقي 🚀)

### الخطوة 1: إنشاء مشروع Supabase (مجاني)

1. اذهب إلى [supabase.com](https://supabase.com) وسجّل حسابًا
2. أنشئ **New Project** → اختر اسمًا مثل `nados-prod` → كلمة مرور قوية → المنطقة الأقرب (Frankfurt)
3. بعد إنشاء المشروع، اذهب إلى **Project Settings → API** وانسخ:
   - `Project URL` → هذا هو `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → هذا هو `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → هذا هو `SUPABASE_SERVICE_ROLE_KEY` ⚠️ سري جدًا، لا تشاركه أبدًا

### الخطوة 2: تطبيق قاعدة البيانات

في Supabase، افتح **SQL Editor** ونفّذ الملفات بالترتيب:

1. `supabase/migrations/00001_initial_schema.sql`
2. `supabase/migrations/00002_rls_policies.sql`
3. `supabase/migrations/00003_custom_access_token_hook.sql`
4. `supabase/migrations/00004_seed_data.sql`
5. `supabase/migrations/00005_auto_tenant_on_signup.sql`
6. `supabase/migrations/00006_functions.sql`

> 💡 أو استخدم Supabase CLI: `supabase link && supabase db push`

### الخطوة 3: رفع الموقع إلى Vercel (مجاني)

1. اذهب إلى [vercel.com](https://vercel.com) وسجّل بحساب GitHub
2. **Add New → Project** → اختر مستودع `david2005abd-sudo/Work10`
3. في قسم **Environment Variables** أضف:

| المتغير | القيمة |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | من الخطوة 1 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | من الخطوة 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | من الخطوة 1 |
| `NEXT_PUBLIC_SITE_URL` | رابط موقعك (مثل `https://work10.vercel.app`) |
| `CREDENTIALS_ENCRYPTION_KEY` | أي نص عشوائي 32+ حرفًا |
| `CRON_SECRET` | أي نص عشوائي |

4. اضغط **Deploy** — خلال دقيقتين سيكون موقعك حيًا! 🎉

### الخطوة 4: تفعيل المصادقة بالهاتف (اختياري)

في Supabase: **Authentication → Providers → Phone** → فعّلها وأضف بيانات مزود SMS (Twilio أو MessageBird).

> بدون مزود SMS: يمكن التسجيل عبر البريد الإلكتروني بتغيير `signUp` لإضافة `email` — أو استخدم Supabase Dashboard → Authentication → لتعطيل تأكيد الهاتف مؤقتًا.

## بنية المشروع

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # صفحة الهبوط
│   │   ├── (auth)/               # تسجيل الدخول والتسجيل
│   │   ├── dashboard/            # لوحة تحكم التاجر
│   │   ├── store/[slug]/         # واجهة المتجر العام
│   │   └── api/health/           # فحص الصحة
│   ├── components/               # مكونات UI
│   ├── lib/supabase/             # عملاء Supabase (browser/server/middleware)
│   ├── lib/validations/          # مخططات Zod
│   └── middleware.ts             # حماية المسارات
├── supabase/migrations/          # SQL migrations (6 ملفات)
├── docs/                         # توثيق المشروع الكامل
└── .github/workflows/            # CI
```

## فحص صحة النظام

بعد النشر، تحقق من: `https://your-domain.vercel.app/api/health`

```json
{"status": "healthy", "checks": {"app": "ok", "database": "ok"}}
```

## التوثيق

كل قرارات البناء والبحث موثّقة في مجلد [`docs/`](./docs):

- [`PROJECT_STATE.md`](docs/PROJECT_STATE.md) — الحالة الحالية
- [`ROADMAP.md`](docs/ROADMAP.md) — خطة المراحل
- [`DATABASE.md`](docs/DATABASE.md) — مخطط قاعدة البيانات (22 جدولًا)
- [`DECISIONS.md`](docs/DECISIONS.md) — قرارات معمارية (ADRs)
- [`SECURITY.md`](docs/SECURITY.md) — الأمان والامتثال
- [`DEPLOY.md`](docs/DEPLOY.md) — دليل النشر المفصل

## خارطة الطريق

- [x] المرحلة 0-1: التأسيس + قاعدة البيانات (22 جدولًا + RLS + Seed)
- [x] المرحلة 2: المصادقة + إنشاء متجر تلقائي
- [x] المرحلة 3-4: واجهة المتجر + لوحة التحكم
- [x] المرحلة 5: طبقة التوصيل الموحدة (Adapters)
- [x] المرحلة 6: بوت الذكاء الاصطناعي (التصميم + الهجرة)
- [x] المرحلة 7: الاشتراكات والحدود
- [x] المرحلة 8: الدعم الفني
- [x] المرحلة 9: الاختبار والنشر
- [ ] المرحلة 10: التطوير المستمر (برامج ولاء، SMS، Apple Pay)

## المساهمة

1. Fork المستودع
2. أنشئ فرعًا: `git checkout -b feature/amazing-feature`
3. اعمل التغييرات: `git commit -m "Add amazing feature"`
4. ارفع الفرع: `git push origin feature/amazing-feature`
5. افتح Pull Request

## الترخيص

MIT © 2026 نادوس
