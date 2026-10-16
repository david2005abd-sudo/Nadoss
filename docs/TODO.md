# TODO — NADOS
- [ ] التحقق من نجاح CI على آخر commit وإصلاح جميع أخطاء typecheck/lint/build.
- [ ] تشغيل migrations 00001–00018 على مشروع Supabase تجريبي بالترتيب.
- [ ] اختبار عزل البيانات بين متجرين واختبارات RLS السلبية.
- [ ] اختبار إنشاء الحساب، OTP، استعادة كلمة المرور، وتسجيل الدخول.
- [ ] اختبار المنتجات والسلة والcheckout وتزامن خصم المخزون.
- [ ] التحقق من كل مزود دفع قبل تفعيل التحويلات الحقيقية.
- [ ] إعداد بيانات WhatsApp Cloud API واختبار التحقق من التوقيع وwebhook.
- [ ] إدخال بيانات شركات التوصيل الحقيقية في بيئة staging والتحقق من حالات التتبع.
- [ ] تشغيل اختبارات E2E مع إعدادات اختبارية.
- [ ] مراجعة Sentry وcron secrets وسياسة الاحتفاظ بالبيانات.
- [ ] نشر preview ثم مراجعة LAUNCH_CHECKLIST قبل الإنتاج.
- [ ] Re-check full and production-only npm audit after the Sentry and transitive dependency upgrades; resolve or document remaining high findings.
- [ ] Revisit high-severity npm audit findings with compatible dependency upgrades; do not apply overrides until a clean install and CI pass.

- [ ] Verify Sentry 11 and current PostCSS resolve cleanly in CI before keeping the security upgrade.
- [ ] Upgrade Sentry and vulnerable transitive packages only after a reproducible clean npm install succeeds; current known-green Sentry 9 set is retained.
- [x] Baseline main CI previously passed TypeScript, lint and build; rerun all checks for this PR before merge.
- [ ] معالجة نتائج npm audit: 36 مشكلة إجمالًا (11 عالية)، منها 6 عالية في تدقيق production و0 حرجة؛ لا تنشر للإنتاج قبل المعالجة أو قبول المخاطر رسميًا.
- [ ] اختبار ترقية Sentry والترابطيات الضعيفة بعد توفر حل تثبيت متوافق؛ نسخة Sentry 9 الحالية هي النسخة التي اجتازت التثبيت والبناء.