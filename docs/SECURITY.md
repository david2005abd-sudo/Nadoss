# Security baseline — NADOS

- لا ترفع مفاتيح API أو ملفات .env إلى GitHub.
- SUPABASE_SERVICE_ROLE_KEY يُستخدم على الخادم فقط، ويُستخدم في CI مع Supabase محلي مؤقت فقط.
- RLS مطلوب لكل بيانات tenant؛ اختبر محاولة مستخدم متجر A الوصول إلى متجر B.
- تحقق من توقيع webhooks ومصادر callbacks قبل تعديل حالة دفع/طلب.
- استخدم idempotency للمدفوعات والطلبات، ولا تثق ببيانات المبلغ القادمة من المتصفح.
- مفاتيح cron يجب أن تكون قوية وسرية.
- لا تسجل access tokens أو بيانات شخصية أو محتوى رسائل حساس في logs.
- راجع سياسات موافقة العملاء والاحتفاظ برسائل WhatsApp والبيانات الشخصية.
- تم ضبط Next.js على 14.2.35 بعد أن أظهر CI أن 14.2.28 يحمل تحذيرًا أمنيًا.
- Custom access-token hook يعمل كـ SECURITY DEFINER مع search_path ثابت، وتُمنح صلاحية schema المطلوبة لدور Supabase Auth فقط؛ لا يُمنح دور العميل صلاحية تنفيذ hook.
- حساب E2E والمفاتيح الوهمية مخصصة لبيئة CI المحلية فقط ولا يجوز إعادة استخدامها في الإنتاج.
- قبل الإنتاج: اختبارات RLS، E2E، backup/restore، redirects، headers، rate limits، ومراجعة كل integration.
