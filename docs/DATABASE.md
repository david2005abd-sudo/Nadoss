# DATABASE.md — مخطط قاعدة البيانات

## الجداول (20 جدولًا)
[نفس المحتوى السابق]

## Triggers
- `on_auth_user_created` → `handle_new_user()`: ينشئ tenant + membership(owner) + subscription(free) + usage_counters
- `set_updated_at()` على: tenants, categories, products, customers, orders, shipments, conversations, subscriptions, support_tickets

## RLS
[نفس المحتوى السابق]

## Custom Access Token Hook
- `custom_access_token_hook` يحقن `tenant_id` و `tenant_role` في `app_metadata` عند إصدار JWT
- يقرأ من `memberships` — أول membership حسب الأولوية: owner > admin > staff
