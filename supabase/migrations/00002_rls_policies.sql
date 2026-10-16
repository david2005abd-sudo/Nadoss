-- ============================================
-- NADOS — Row Level Security Policies
-- Multi-Tenant Isolation
-- ============================================

-- Helper function: Get current user's tenant_id from JWT
-- The tenant_id is injected into JWT via Custom Access Token Hook
CREATE OR REPLACE FUNCTION public.get_tenant_id()
RETURNS UUID AS $$
  SELECT NULLIF(
    (SELECT auth.jwt() -> 'app_metadata' ->> 'tenant_id'),
    ''
  )::UUID;
$$ LANGUAGE sql STABLE;

-- Helper function: Get current user's role from JWT
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT auth.jwt() -> 'app_metadata' ->> 'tenant_role'),
    'staff'
  );
$$ LANGUAGE sql STABLE;

-- ============================================
-- Enable RLS on all tenant-scoped tables
-- ============================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_delivery_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TENANTS — Users can see only their own tenant
-- ============================================
CREATE POLICY "tenants_select_own" ON public.tenants
  FOR SELECT USING (
    id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "tenants_update_own" ON public.tenants
  FOR UPDATE USING (
    id = (SELECT public.get_tenant_id())
    AND (SELECT public.get_user_role()) IN ('owner', 'admin')
  );

-- No INSERT/DELETE for regular users (handled by service_role)

-- ============================================
-- MEMBERSHIPS — Users can see memberships of their tenant
-- ============================================
CREATE POLICY "memberships_select_own_tenant" ON public.memberships
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "memberships_insert_own_tenant" ON public.memberships
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT public.get_tenant_id())
    AND (SELECT public.get_user_role()) IN ('owner', 'admin')
  );

CREATE POLICY "memberships_update_own_tenant" ON public.memberships
  FOR UPDATE USING (
    tenant_id = (SELECT public.get_tenant_id())
    AND (SELECT public.get_user_role()) IN ('owner', 'admin')
  );

CREATE POLICY "memberships_delete_own_tenant" ON public.memberships
  FOR DELETE USING (
    tenant_id = (SELECT public.get_tenant_id())
    AND (SELECT public.get_user_role()) = 'owner'
  );

-- ============================================
-- CATEGORIES
-- ============================================
CREATE POLICY "categories_select_own" ON public.categories
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
    AND deleted_at IS NULL
  );

CREATE POLICY "categories_insert_own" ON public.categories
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "categories_update_own" ON public.categories
  FOR UPDATE USING (
    tenant_id = (SELECT public.get_tenant_id())
    AND deleted_at IS NULL
  );

CREATE POLICY "categories_delete_own" ON public.categories
  FOR DELETE USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

-- ============================================
-- PRODUCTS
-- ============================================
CREATE POLICY "products_select_own" ON public.products
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
    AND deleted_at IS NULL
  );

CREATE POLICY "products_insert_own" ON public.products
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "products_update_own" ON public.products
  FOR UPDATE USING (
    tenant_id = (SELECT public.get_tenant_id())
    AND deleted_at IS NULL
  );

CREATE POLICY "products_delete_own" ON public.products
  FOR DELETE USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

-- Public store products (anon access) — no RLS bypass, but storefront needs read
CREATE POLICY "products_select_public" ON public.products
  FOR SELECT USING (
    is_active = TRUE
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = products.tenant_id
      AND t.is_active = TRUE
    )
  );

-- ============================================
-- CUSTOMERS
-- ============================================
CREATE POLICY "customers_select_own" ON public.customers
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
    AND deleted_at IS NULL
  );

CREATE POLICY "customers_insert_own" ON public.customers
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "customers_update_own" ON public.customers
  FOR UPDATE USING (
    tenant_id = (SELECT public.get_tenant_id())
    AND deleted_at IS NULL
  );

CREATE POLICY "customers_delete_own" ON public.customers
  FOR DELETE USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

-- ============================================
-- ORDERS
-- ============================================
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
    AND deleted_at IS NULL
  );

CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "orders_update_own" ON public.orders
  FOR UPDATE USING (
    tenant_id = (SELECT public.get_tenant_id())
    AND deleted_at IS NULL
  );

CREATE POLICY "orders_delete_own" ON public.orders
  FOR DELETE USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "order_items_update_own" ON public.order_items
  FOR UPDATE USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "order_items_delete_own" ON public.order_items
  FOR DELETE USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

-- ============================================
-- SHIPMENTS
-- ============================================
CREATE POLICY "shipments_select_own" ON public.shipments
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "shipments_insert_own" ON public.shipments
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "shipments_update_own" ON public.shipments
  FOR UPDATE USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "shipments_delete_own" ON public.shipments
  FOR DELETE USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

-- ============================================
-- CONVERSATIONS
-- ============================================
CREATE POLICY "conversations_select_own" ON public.conversations
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "conversations_insert_own" ON public.conversations
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "conversations_update_own" ON public.conversations
  FOR UPDATE USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

-- ============================================
-- MESSAGES
-- ============================================
CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "messages_insert_own" ON public.messages
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT public.get_tenant_id())
  );

-- ============================================
-- AI EXTRACTIONS
-- ============================================
CREATE POLICY "ai_extractions_select_own" ON public.ai_extractions
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "ai_extractions_insert_own" ON public.ai_extractions
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "ai_extractions_update_own" ON public.ai_extractions
  FOR UPDATE USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

-- ============================================
-- INVOICES
-- ============================================
CREATE POLICY "invoices_select_own" ON public.invoices
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

-- ============================================
-- USAGE COUNTERS
-- ============================================
CREATE POLICY "usage_counters_select_own" ON public.usage_counters
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "usage_counters_update_own" ON public.usage_counters
  FOR UPDATE USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

-- ============================================
-- TENANT DELIVERY ACCOUNTS
-- ============================================
CREATE POLICY "tda_select_own" ON public.tenant_delivery_accounts
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "tda_insert_own" ON public.tenant_delivery_accounts
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT public.get_tenant_id())
    AND (SELECT public.get_user_role()) IN ('owner', 'admin')
  );

CREATE POLICY "tda_update_own" ON public.tenant_delivery_accounts
  FOR UPDATE USING (
    tenant_id = (SELECT public.get_tenant_id())
    AND (SELECT public.get_user_role()) IN ('owner', 'admin')
  );

CREATE POLICY "tda_delete_own" ON public.tenant_delivery_accounts
  FOR DELETE USING (
    tenant_id = (SELECT public.get_tenant_id())
    AND (SELECT public.get_user_role()) = 'owner'
  );

-- ============================================
-- SUPPORT TICKETS
-- ============================================
CREATE POLICY "support_tickets_select_own" ON public.support_tickets
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "support_tickets_insert_own" ON public.support_tickets
  FOR INSERT WITH CHECK (
    tenant_id = (SELECT public.get_tenant_id())
  );

CREATE POLICY "support_tickets_update_own" ON public.support_tickets
  FOR UPDATE USING (
    tenant_id = (SELECT public.get_tenant_id())
  );

-- ============================================
-- AUDIT LOG — Read-only for tenant admins
-- ============================================
CREATE POLICY "audit_log_select_own" ON public.audit_log
  FOR SELECT USING (
    tenant_id = (SELECT public.get_tenant_id())
    AND (SELECT public.get_user_role()) IN ('owner', 'admin')
  );

-- Audit log insertion is handled by triggers/service_role only

-- ============================================
-- GRANTS — Allow authenticated users
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.iraq_governorates, public.delivery_companies, public.subscription_plans TO anon, authenticated;
