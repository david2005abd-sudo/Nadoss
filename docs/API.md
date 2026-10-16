# API — NADOS
تتوزع الواجهات بين Server Actions وRoute Handlers.
- Auth: تسجيل/دخول/OTP/استعادة كلمة المرور في src/app/(auth)/actions.ts.
- Checkout: إنشاء الطلب وتأكيد المخزون في src/app/store/[slug]/checkout/actions.ts.
- Payment callbacks: src/app/api/payments/callback/route.ts وsrc/app/api/billing/callback/route.ts.
- Webhooks: WhatsApp في src/app/api/webhooks/whatsapp/route.ts، والتوصيل في src/app/api/webhooks/delivery/[provider]/route.ts.
- Health: /api/health.
- Cron: تجديد الفوترة، SLA، تنظيف المسودات، حساب metrics.
- RPCs والقيود والـ RLS موثقة في migrations 00001–00018.
كل تكامل خارجي يحتاج إعداد credentials الرسمية، ويجب ألا يُعد فعّالًا حتى يُختبر callback/webhook على staging.
