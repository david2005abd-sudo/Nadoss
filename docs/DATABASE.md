# DATABASE.md — مخطط قاعدة البيانات

## نظرة عامة
قاعدة PostgreSQL واحدة متعددة المتاجر (multi-tenant). كل بيانات المتجر مرتبطة بـ tenant_id، ويُستخدم Supabase Auth لإصدار JWT يحتوي tenant_id وtenant_role عبر custom access-token hook.

المستودع يحتوي 20 migration متسلسلة:
- 00001–00004: المخطط الأساسي، سياسات RLS الأولية، JWT hook، وبيانات الخطط.
- 00005: إنشاء المتجر والعضوية والاشتراك عند تسجيل مستخدم جديد.
- 00006–00011: RPC للمخزون وإحصاءات العملاء والتخزين والتوصيل والبحث واستخدام AI/WhatsApp.
- 00012–00015: الاشتراكات والاستحقاقات والفوترة والدعم وقاعدة المعرفة.
- 00016–00018: مقاييس SaaS والحجوزات وتتبع تكلفة WhatsApp.
- 00019: RLS لجداول المرجع، view عامة محدودة للمتاجر، وسياسات القراءة العامة للكتالوج والحجوزات.
- 00020: إنشاء طلب متجر ذري، حجز مخزون داخل transaction، إلغاء الطلب غير المدفوع واسترجاع المخزون، وحماية RPC المخزون.

## الجداول حسب المجال

### المتاجر والكتالوج
- tenants, memberships, subscription_plans, subscriptions
- iraq_governorates, categories, products
- customers, orders, order_items
- delivery_companies, tenant_delivery_accounts, shipments, shipment_events

### المحادثات وWhatsApp والذكاء الاصطناعي
- conversations, messages, ai_extractions, whatsapp_numbers, whatsapp_usage, whatsapp_pricing_rates

### الاشتراكات والمراقبة
- invoices, usage_counters, plan_entitlements, billing_events
- audit_log, tenant_health, saas_metrics_daily, churn_events

### الدعم والمعرفة
- support_tickets, ticket_messages, ticket_categories
- knowledge_articles, article_feedback

### الحجوزات
- service_categories, staff_members, bookings

## RLS والعزل
- كل الجداول الأساسية وجداول المجالات الجديدة يجب أن يكون عليها RLS مفعّلًا.
- جداول reference العامة تسمح بالقراءة فقط حسب السياسة: الخطط والمحافظات وشركات التوصيل النشطة لـ anon/authenticated، وأسعار WhatsApp للمستخدمين المسجلين.
- لا تُمنح أدوار العميل صلاحيات كتابة على جداول الإعداد العامة.
- public.public_storefronts هو view يعرض فقط id/name/slug/logo_url/phone/address/is_active للمتاجر النشطة؛ لا يعرّض settings الخاصة بالمتجر.
- المنتجات والتصنيفات والخدمات والموظفون تظهر للعامة فقط إذا كانت نشطة وتنتمي إلى متجر نشط.
- الجداول الحساسة مثل customers/orders/messages/billing_events يجب أن تبقى محصورة بالـ tenant المناسب أو عمليات server-side موثوقة.

## Triggers وRPC
- on_auth_user_created → handle_new_user(): ينشئ tenant + membership(owner) + subscription + usage counters.
- set_updated_at() يحدّث updated_at في الجداول المهيأة.
- custom_access_token_hook يضيف tenant_id وtenant_role إلى app_metadata. يعمل بصلاحيات SECURITY DEFINER وsearch_path ثابت، مع منح schema/function permissions المطلوبة لدور Supabase Auth فقط.
- decrement_stock لا يُتاح لـ anon؛ يتحقق من عضوية tenant ويمنع الخصم إذا كانت الكمية غير كافية.
- create_store_order متاح لدور service_role فقط ويُستدعى من Server Action. يتحقق من المتجر والمنتجات والأسعار والمخزون والمحافظة وبيانات العميل، ثم ينشئ العميل والطلب والعناصر ويخصم المخزون ذريًا.
- cancel_unpaid_store_order متاح لـ service_role فقط ويعيد المخزون عند فشل إنشاء جلسة الدفع لطلب غير مدفوع.

## تشغيل قاعدة البيانات
- محليًا: npm run supabase:start ثم npx supabase status ثم npm run supabase:reset.
- لا تطبق migrations على قاعدة إنتاج قبل staging، ومراجعة نتائج CI، واختبارات RLS السلبية.
- لا تُعدّل migrations القديمة بعد النشر؛ أضف migration تصحيحية جديدة حتى تتلقى البيئات القائمة الإصلاحات.
