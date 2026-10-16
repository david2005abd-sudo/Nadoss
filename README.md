# نادوس NADOS
منصة تجارة إلكترونية عربية RTL موجهة للتاجر العراقي، مبنية على Next.js 15.5.28 وTypeScript وTailwind وSupabase.

## الوحدات الموجودة في المستودع
- المصادقة وإعداد حساب/متجر التاجر.
- واجهة متجر عامة ومنتجات وسلة وcheckout.
- لوحة تحكم للمنتجات والتصنيفات والطلبات والعملاء والتقارير.
- تكاملات توصيل عبر adapters قابلة للتكوين.
- WhatsApp webhooks ومعالجة الرسائل واستخراج تفاصيل الطلبات بالذكاء الاصطناعي.
- اشتراكات وفوترة وحدود استخدام.
- الدعم الفني وقاعدة المعرفة.
- مؤشرات SaaS، مهام cron، ومراقبة Sentry.
- نظام حجوزات وخدمات وموظفين وتقويم.
- 18 migration أساسية في supabase/migrations وملفات E2E أولية.

## إعداد محلي
1. استخدم Node.js 20 or newer.
2. انسخ .env.local.example إلى .env.local وأكمل مفاتيحك محليًا.
3. لا ترفع أي مفاتيح أو ملف .env إلى GitHub.
4. ثبّت الحزم عبر npm install.
5. نفّذ npx supabase login ثم npx supabase link --project-ref YOUR_PROJECT_REF، وبعدها npx supabase db push لتطبيق migrations بالترتيب.
6. نفّذ npm run typecheck ثم npm run lint ثم npm run build.
7. شغّل npm run dev.

## مهم قبل الإنتاج
الكود المرفوع لا يعني أن حسابات الدفع أو WhatsApp أو شركات التوصيل أصبحت متصلة. أضف بيانات الاعتماد الرسمية في إعدادات الاستضافة، وطبّق migrations على staging، واختبر عزل المتاجر (RLS) وتدفقات الدفع والويب هوكس. راجع docs/LAUNCH_CHECKLIST.md.

## فحوصات
- npm run typecheck
- npm run lint
- npm run build
- npm run test:e2e
