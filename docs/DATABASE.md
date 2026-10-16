# DATABASE.md — مخطط قاعدة البيانات

## نظرة عامة

PostgreSQL على Supabase — Shared Schema + Row Level Security لتعدد المستأجرين.
**22 جدولًا** · RLS على كل جدول يحتوي `tenant_id` · فهارس مركبة `(tenant_id, ...)`.

## الجداول الأساسية

### tenants (المتاجر)
| العمود | النوع | ملاحظات |
|---|---|---|
| id | uuid PK | |
| name | text | اسم المتجر |
| slug | text UNIQUE | رابط المتجر `/store/[slug]` |
| phone | text | رقم التواصل |
| plan_id | uuid FK | الخطة الحالية |
| is_active | boolean | تعطيل المتجر يخفيه من المتجر العام |

### memberships (العضويات)
- `tenant_id + user_id + role (owner/admin/staff)` — UNIQUE(tenant_id, user_id)

### products (المنتجات)
- الأسعار بالدينار العراقي: `price_iqd`, `compare_price_iqd`, `cost_price_iqd`
- `stock` + `low_stock_threshold` لتنبيه المخزون
- `images` JSONB (حتى 5 صور)
- `deleted_at` — soft delete يحافظ على سلامة الطلبات التاريخية

### orders (الطلبات)
- آلة حالات: `draft → pending → confirmed → preparing → ready → shipped → delivered` (+ cancelled, returned)
- `source`: manual / store / whatsapp / telegram / instagram
- `payment_method`: cod / zaincash / fib / qicard / nasspay / wayl
- UNIQUE(tenant_id, order_number)

### الجداول المدعومة
| الجدول | الغرض |
|---|---|
| order_items | عناصر الطلب مع سعر لحظة الشراء |
| categories | تصنيفات لكل متجر (UNIQUE tenant+slug) |
| customers | العملاء (UNIQUE tenant+phone) |
| delivery_companies | شركات التوصيل (Seed عام) |
| tenant_delivery_accounts | بيانات اعتماد مشفرة AES-256 |
| shipments | الشحنات والتتبع |
| conversations / messages | محادثات واتساب |
| ai_extractions | نتائج استخراج البوت |
| subscription_plans / subscriptions / invoices | الفوترة |
| usage_counters | عدّادات الاستخدام الشهرية (UNIQUE tenant+metric+period) |
| support_tickets | تذاكر الدعم + SLA |
| audit_log | سجل تدقيق العمليات الحساسة |
| whatsapp_numbers | ربط أرقام واتساب بالمتاجر |
| service_categories / staff_members / bookings | نظام الحجوزات |
| iraq_governorates | 18 محافظة مع رسوم توصيل |

## قواعد RLS

```sql
-- قراءة tenant_id من JWT (يُحقن عبر Custom Access Token Hook)
tenant_id = (SELECT public.get_tenant_id())
```

- سياسة SELECT/INSERT/UPDATE/DELETE منفصلة لكل جدول
- `AND deleted_at IS NULL` في سياسات القراءة للجداول بـ soft delete
- سياسات `TO anon` منفصلة للمتجر العام (قراءة المنتجات النشطة + إنشاء الطلبات)
- `(SELECT ...)` حول استدعاءات JWT للتخزين المؤقت وتحسين الأداء

## Triggers

| Trigger | الوظيفة |
|---|---|
| `on_auth_user_created` | إنشاء tenant + membership(owner) + اشتراك مجاني + عدّادات تلقائيًا عند التسجيل |
| `set_updated_at` | تحديث updated_at على 11 جدولًا |

## RPCs

| الدالة | الوظيفة |
|---|---|
| `decrement_stock` | خصم مخزون ذري (آمن من race conditions) |
| `increment_customer_stats` | تحديث إحصائيات العميل |
| `increment_usage_counter` | عدّاد استخدام شهري ذري |
| `check_booking_availability` | فحص تعارض المواعيد |
| `generate_slug` | توليد رابط فريد من اسم المتجر |
