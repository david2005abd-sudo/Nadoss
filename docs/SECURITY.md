# Security baseline — NADOS
- لا ترفع مفاتيح API أو ملفات .env إلى GitHub.
- SUPABASE_SERVICE_ROLE_KEY يُستخدم على الخادم فقط.
- RLS مطلوب لكل بيانات tenant؛ اختبر محاولة مستخدم متجر A الوصول إلى متجر B.
- تحقق من توقيع webhooks ومصادر callbacks قبل تعديل حالة دفع/طلب.
- استخدم idempotency للمدفوعات والطلبات، ولا تثق ببيانات المبلغ القادمة من المتصفح.
- مفاتيح cron يجب أن تكون قوية وسرية.
- لا تسجل access tokens أو بيانات شخصية أو محتوى رسائل حساس في logs.
- راجع سياسات موافقة العملاء والاحتفاظ برسائل WhatsApp والبيانات الشخصية.
- تم تحديث Next.js إلى 15.5.28 وReact إلى 19.3.1 لدعم useActionState وتضمين تحديثات الأمان الحديثة.
- قبل الإنتاج: اختبارات RLS، E2E، backup/restore، redirects، headers، rate limits، ومراجعة كل integration.

- استعادة كلمة المرور للحسابات الهاتفية تتم عبر SMS OTP ثم updateUser؛ لا يُستخدم بريد إلكتروني اصطناعي مبني على رقم الهاتف.

- آخر CI: لا توجد ثغرات حرجة، لكن npm audit سجّل 36 مشكلة إجمالًا (11 عالية) و6 عالية ضمن تدقيق production. لا تعتبر المنصة جاهزة للإنتاج حتى تُعالج هذه النتائج أو يُوثق قبول مخاطرها.

- The latest dependency override experiment caused npm's dependency resolver to fail, so those overrides were reverted. Keep the known-green dependency set and review high-severity dev-tool findings separately before production.

- محاولة Sentry 11 سببت فشل npm dependency resolution؛ تم الرجوع إلى نسخة Sentry 9 التي تثبت وتبني بنجاح. يلزم ترقية متوافقة لاحقًا.


