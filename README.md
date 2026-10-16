# نادوس NADOS

منصة عربية RTL لإدارة المتاجر والمنتجات والطلبات والمخزون للتاجر العراقي.

## الحالة الحالية
المرحلة الحالية تتضمن واجهة تعريفية، تسجيل ودخول Supabase Auth، إنشاء متجر للمستخدم، لوحة تحكم تقرأ الأرقام من قاعدة البيانات، وصفحة إضافة المنتجات وأرشفتها. لا تعتبر المنصة جاهزة للإنتاج: يلزم تطبيق SQL migrations واختبار RLS وتشغيل CI، كما أن إدارة الطلبات والعملاء والتوصيل والدفع وWhatsApp ما زالت غير مكتملة.

## التشغيل المحلي
1. ثبّت Node.js 20 أو أحدث.
2. انسخ .env.example إلى .env.local.
3. املأ NEXT_PUBLIC_SUPABASE_URL وNEXT_PUBLIC_SUPABASE_ANON_KEY من إعدادات مشروع Supabase.
4. شغّل migration 00001 ثم 00002 من مجلد supabase/migrations عبر SQL Editor في بيئة تجريبية.
5. نفّذ npm install ثم npm run typecheck وnpm run lint وnpm run build.
6. شغّل npm run dev وافتح http://localhost:3000.

لا تضف مفاتيح حقيقية إلى GitHub ولا تضع SUPABASE_SERVICE_ROLE_KEY في المتصفح. راجع docs/LAUNCH_CHECKLIST.md قبل النشر.
