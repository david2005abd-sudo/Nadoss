-- ============================================
-- NADOS — Initial Schema
-- Multi-Tenant SaaS for Iraqi E-Commerce
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. TENANTS (المستأجرون — المتاجر)
-- ============================================
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  plan_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_plan ON public.tenants(plan_id);

-- ============================================
-- 2. MEMBERSHIPS (عضوية المستخدمين في المتاجر)
-- ============================================
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_memberships_tenant ON public.memberships(tenant_id);
CREATE INDEX idx_memberships_user ON public.memberships(user_id);

-- ============================================
-- 3. SUBSCRIPTION PLANS (خطط الاشتراك)
-- ============================================
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_products INTEGER NOT NULL DEFAULT 10,
  max_orders_per_month INTEGER NOT NULL DEFAULT 50,
  max_ai_messages INTEGER NOT NULL DEFAULT 100,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. SUBSCRIPTIONS (اشتراكات المتاجر)
-- ============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_tenant ON public.subscriptions(tenant_id);

-- Add FK for tenants.plan_id
ALTER TABLE public.tenants ADD CONSTRAINT fk_tenants_plan
  FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);

-- ============================================
-- 5. IRAQ GOVERNORATES (المحافظات العراقية)
-- ============================================
CREATE TABLE public.iraq_governorates (
  id SERIAL PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  delivery_fee_iqd INTEGER DEFAULT 5000,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- 6. CATEGORIES (التصنيفات)
-- ============================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT NOT NULL,
  parent_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_categories_tenant ON public.categories(tenant_id);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);

-- ============================================
-- 7. PRODUCTS (المنتجات)
-- ============================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  price_iqd INTEGER NOT NULL DEFAULT 0,
  compare_price_iqd INTEGER,
  cost_price_iqd INTEGER,
  sku TEXT,
  barcode TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  weight_grams INTEGER,
  images JSONB DEFAULT '[]'::jsonb,
  attributes JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_tenant ON public.products(tenant_id);
CREATE INDEX idx_products_tenant_category ON public.products(tenant_id, category_id);
CREATE INDEX idx_products_tenant_active ON public.products(tenant_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_sku ON public.products(tenant_id, sku);

-- ============================================
-- 8. CUSTOMERS (العملاء)
-- ============================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  governorate_id INTEGER REFERENCES public.iraq_governorates(id),
  city TEXT,
  address TEXT,
  notes TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent_iqd BIGINT DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, phone)
);

CREATE INDEX idx_customers_tenant ON public.customers(tenant_id);
CREATE INDEX idx_customers_tenant_phone ON public.customers(tenant_id, phone);

-- ============================================
-- 9. ORDERS (الطلبات)
-- ============================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),  order_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled', 'returned')),
  payment_method TEXT
    CHECK (payment_method IN ('cod', 'zaincash', 'fib', 'qicard', 'nasspay', 'fastpay')),
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  subtotal_iqd INTEGER NOT NULL DEFAULT 0,
  delivery_fee_iqd INTEGER DEFAULT 0,
  discount_iqd INTEGER DEFAULT 0,
  total_iqd INTEGER NOT NULL DEFAULT 0,
  governorate_id INTEGER REFERENCES public.iraq_governorates(id),
  city TEXT,
  address TEXT,
  notes TEXT,
  source TEXT DEFAULT 'manual'
    CHECK (source IN ('manual', 'store', 'whatsapp', 'telegram', 'instagram')),
  ai_extraction_id UUID,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, order_number)
);

CREATE INDEX idx_orders_tenant ON public.orders(tenant_id);
CREATE INDEX idx_orders_tenant_status ON public.orders(tenant_id, status);
CREATE INDEX idx_orders_tenant_created ON public.orders(tenant_id, created_at DESC);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_governorate ON public.orders(governorate_id);

-- ============================================
-- 10. ORDER ITEMS (عناصر الطلب)
-- ============================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_iqd INTEGER NOT NULL DEFAULT 0,
  total_price_iqd INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_tenant ON public.order_items(tenant_id);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);

-- ============================================
-- 11. DELIVERY COMPANIES (شركات التوصيل)
-- ============================================
CREATE TABLE public.delivery_companies (
  id SERIAL PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  api_type TEXT CHECK (api_type IN ('direct', 'aggregator', 'manual')),
  base_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  supports_cod BOOLEAN DEFAULT FALSE,
  coverage_governorates INTEGER[] DEFAULT '{}',
  logo_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. TENANT DELIVERY ACCOUNTS (حسابات التوصيل للمتاجر)
-- ============================================
CREATE TABLE public.tenant_delivery_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  delivery_company_id INTEGER NOT NULL REFERENCES public.delivery_companies(id),
  credentials_encrypted TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, delivery_company_id)
);

CREATE INDEX idx_tda_tenant ON public.tenant_delivery_accounts(tenant_id);

-- ============================================
-- 13. SHIPMENTS (الشحنات)
-- ============================================
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  delivery_company_id INTEGER REFERENCES public.delivery_companies(id),
  tracking_number TEXT,
  external_id TEXT,
  status TEXT DEFAULT 'created'
    CHECK (status IN ('created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned')),
  cod_amount_iqd INTEGER,
  delivery_fee_iqd INTEGER,
  recipient_name TEXT,
  recipient_phone TEXT,
  governorate_id INTEGER REFERENCES public.iraq_governorates(id),
  address TEXT,
  notes TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipments_tenant ON public.shipments(tenant_id);
CREATE INDEX idx_shipments_order ON public.shipments(order_id);
CREATE INDEX idx_shipments_tracking ON public.shipments(tracking_number);

-- ============================================
-- 14. CONVERSATIONS (المحادثات)
-- ============================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  channel TEXT NOT NULL DEFAULT 'whatsapp'
    CHECK (channel IN ('whatsapp', 'telegram', 'instagram', 'web')),
  external_id TEXT,
  phone TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_tenant ON public.conversations(tenant_id);
CREATE INDEX idx_conversations_tenant_status ON public.conversations(tenant_id, status);
CREATE INDEX idx_conversations_external ON public.conversations(tenant_id, external_id);

-- ============================================
-- 15. MESSAGES (الرسائل)
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'bot', 'staff')),
  content TEXT,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'audio', 'document', 'location')),
  media_url TEXT,
  external_message_id TEXT,
  ai_extraction JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_tenant ON public.messages(tenant_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created ON public.messages(conversation_id, created_at);

-- ============================================
-- 16. AI EXTRACTIONS (استخراج الذكاء الاصطناعي)
-- ============================================
CREATE TABLE public.ai_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id),
  conversation_id UUID REFERENCES public.conversations(id),
  raw_input TEXT,
  extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC(3,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'partial', 'failed', 'manual_review')),
  order_id UUID REFERENCES public.orders(id),
  model_used TEXT,
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_extractions_tenant ON public.ai_extractions(tenant_id);
CREATE INDEX idx_ai_extractions_status ON public.ai_extractions(tenant_id, status);

-- ============================================
-- 17. INVOICES (الفواتير)
-- ============================================
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  invoice_number TEXT NOT NULL,
  amount_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, invoice_number)
);

CREATE INDEX idx_invoices_tenant ON public.invoices(tenant_id);

-- ============================================
-- 18. USAGE COUNTERS (عدّادات الاستخدام)
-- ============================================
CREATE TABLE public.usage_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  metric TEXT NOT NULL CHECK (metric IN ('products', 'orders', 'ai_messages', 'storage_bytes')),
  period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  current_value BIGINT DEFAULT 0,
  limit_value BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, metric, period_start)
);

CREATE INDEX idx_usage_counters_tenant ON public.usage_counters(tenant_id);

-- ============================================
-- 19. SUPPORT TICKETS (تذاكر الدعم)
-- ============================================
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_tenant ON public.support_tickets(tenant_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(tenant_id, status);

-- ============================================
-- 20. AUDIT LOG (سجل التدقيق)
-- ============================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_tenant ON public.audit_log(tenant_id);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);

-- ============================================
-- TRIGGERS — updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_shipments_updated_at BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
