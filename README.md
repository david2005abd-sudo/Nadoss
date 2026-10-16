# نادوس NADOS

منصة تجارة إلكترونية عربية RTL موجهة للتاجر العراقي، مبنية على Next.js 14 وTypeScript وTailwind وSupabase.

## الوحدات الموجودة في المستودع
- المصادقة عبر الهاتف وOTP، مع استعادة كلمة المرور عبر SMS.
- واجهة متجر عامة، منتجات، سلة، وcheckout يعتمد على RPC ذري للتحقق من الأسعار والمخزون وإنشاء الطلب.
- لوحة تحكم للمنتجات والتصنيفات والطلبات والعملاء والتقارير.
- تكاملات توصيل عبر adapters قابلة للتكوين.
- WhatsApp webhooks ومعالجة الرسائل واستخراج تفاصيل الطلبات بالذكاء الاصطناعي.
- اشتراكات وفوترة وحدود استخدام.
- الدعم الفني وقاعدة المعرفة.
- مؤشرات SaaS، مهام cron، ومراقبة Sentry.
- نظام حجوزات وخدمات وموظفين وتقويم.
- 20 migration في supabase/migrations، مع RLS وسياسات للواجهات العامة واختبارات E2E أولية.

## الإعداد المحلي
1. استخدم Node.js 20.
2. انسخ .env.local.example إلى .env.local، ولا تضع أي أسرار حقيقية في Git.
3. ثبّت الحزم: npm install
4. شغّل Supabase المحلي: npm run supabase:start
5. نفّذ npx supabase status وانسخ API_URL وANON_KEY وSERVICE_ROLE_KEY إلى .env.local.
6. طبّق migrations والـ seed المحلي: npm run supabase:reset
7. شغّل الفحوصات: npm run typecheck ثم npm run lint ثم npm run build.
8. شغّل التطبيق: npm run dev

لإيقاف الخدمات المحلية استخدم npm run supabase:stop.

## فحوصات
- npm run typecheck
- npm run lint
- npm run build
- npm run test:e2e

## مهم قبل الإنتاج
وجود الكود لا يعني أن حسابات الدفع أو WhatsApp أو شركات التوصيل أصبحت متصلة. أضف بيانات الاعتماد الرسمية في إعدادات الاستضافة، وطبّق migrations على staging، واختبر عزل المتاجر (RLS) وتدفقات الدفع والويب هوكس. لا تستخدم مفاتيح الإنتاج محليًا أو داخل CI. راجع docs/LAUNCH_CHECKLIST.md وdocs/TODO.md؛ لم يتم تأكيد نجاح GitHub Actions أو نشر الإنتاج بعد.
