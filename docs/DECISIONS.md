# القرارات المعمارية — NADOS
- Shared PostgreSQL schema مع tenant_id وRLS لعزل متاجر التجار.
- Supabase Auth والجلسات عبر @supabase/ssr.
- Next.js App Router + TypeScript + Tailwind RTL.
- خصم المخزون وتدفقات الطلبات الحساسة يجب أن تتم في معاملات/RPCs على قاعدة البيانات، لا في الواجهة فقط.
- بوابات الدفع وشركات التوصيل وWhatsApp adapters خلف طبقات موحدة لتجنب ربط منطق التطبيق بمزود واحد.
- بيانات الاعتماد لا تُحفظ في المستودع ولا تُرسل للعميل.
- أي feature خارجي يعتمد على credentials يجب أن يبقى غير مفعّل حتى ينجح اختبار staging.
