# DATABASE — NADOS

## الكيانات المخطط لها
- tenants, memberships
- subscription_plans, subscriptions, usage_counters, invoices
- iraq_governorates, categories, products
- customers, orders, order_items
- delivery_companies, tenant_delivery_accounts, shipments
- conversations, messages, ai_extractions
- support_tickets, audit_log
- service_categories, staff_members, bookings (مرحلة لاحقة)

## متطلبات
- UUID primary keys.
- tenant_id على كل جدول تجاري يخص متجرًا.
- Foreign keys وفهارس على tenant_id.
- RLS وسياسات منفصلة للقراءة والإنشاء والتعديل والحذف.
- Soft delete عند الحاجة مع استبعاد deleted_at في الاستعلامات والسياسات.
- اختبارات سلبية تثبت عدم قدرة متجر على قراءة بيانات متجر آخر.

هذا ملف تخطيط فقط؛ لا توجد migrations مطبقة حتى الآن.
