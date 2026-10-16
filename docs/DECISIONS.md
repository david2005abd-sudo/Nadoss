# القرارات المعمارية — NADOS
## ADR-001: Shared schema + RLS
- القرار: جداول مشتركة وtenant_id لكل بيانات التاجر مع RLS كطبقة عزل أساسية.
## ADR-002: Supabase Auth + SSR cookies
- القرار: @supabase/ssr على Next.js App Router مع تحديث الجلسة عبر middleware.
## ADR-003: تهيئة المتجر عبر RPC
- القرار: دالة SECURITY DEFINER محدودة تنشئ المتجر وعضوية المالك ذريًا بعد التحقق من auth.uid().
## ADR-004: واجهة عربية أولًا
- القرار: RTL وتنسيق أسعار IQD.
## ADR-005: Membership-based RLS helpers
- القرار: تستخدم سياسات RLS دوال SECURITY DEFINER لتجنب recursion في جدول memberships؛ يجب اختبارها على staging قبل الإنتاج.
## ADR-006: Product soft-delete
- القرار: أرشفة المنتج عبر deleted_at وis_active بدل الحذف النهائي، للمحافظة على مرجعيات الطلبات.
