# API — NADOS

## الحالة
لم تُنفذ واجهات API تجارية بعد. صفحات المعاينة تستخدم بيانات ثابتة فقط.

## مخطط مقترح
- `POST /api/auth/register` — تسجيل تاجر وإنشاء متجر.
- `GET/POST /api/dashboard/products` — المنتجات.
- `GET/POST /api/dashboard/orders` — الطلبات.
- `POST /api/webhooks/whatsapp` — استقبال رسائل WhatsApp بعد التحقق من التوقيع.
- `POST /api/delivery/shipments` — إنشاء شحنة عبر محول رسمي.
- `GET /api/health` — فحص الصحة.

كل endpoint محمي يجب أن يتحقق من الهوية والعضوية، وتُفرض حدود المستأجرين في RLS.
