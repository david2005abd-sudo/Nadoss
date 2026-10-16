-- ============================================
-- NADOS — Billing & Entitlements
-- ============================================

-- Add interval + Stripe-like external IDs to subscription_plans
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS interval TEXT NOT NULL DEFAULT 'month'
    CHECK (interval IN ('month', 'year')),
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
  ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add billing period + external refs to subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'month'
    CHECK (billing_interval IN ('month', 'year')),
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS external_provider TEXT,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS proration_credit_usd NUMERIC(10,2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_subscriptions_external
  ON public.subscriptions(external_provider, external_id);

-- Add invoice ↔ payment linkage
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS external_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS external_invoice_id TEXT,
  ADD COLUMN IF NOT EXISTS period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subtotal_usd NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_usd NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hosted_invoice_url TEXT,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- ============================================
-- Entitlements — plan ↔ feature mapping
-- ============================================
CREATE TABLE IF NOT EXISTS public.plan_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  limit_value BIGINT,             -- NULL = unlimited
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, feature_key)
);

CREATE INDEX idx_plan_entitlements_plan ON public.plan_entitlements(plan_id);

-- Seed default entitlements for existing plans
INSERT INTO public.plan_entitlements (plan_id, feature_key, limit_value, is_enabled)
SELECT id, 'products', max_products, TRUE FROM public.subscription_plans
ON CONFLICT (plan_id, feature_key) DO NOTHING;

INSERT INTO public.plan_entitlements (plan_id, feature_key, limit_value, is_enabled)
SELECT id, 'orders_per_month', max_orders_per_month, TRUE FROM public.subscription_plans
ON CONFLICT (plan_id, feature_key) DO NOTHING;

INSERT INTO public.plan_entitlements (plan_id, feature_key, limit_value, is_enabled)
SELECT id, 'ai_messages_per_month', max_ai_messages, TRUE FROM public.subscription_plans
ON CONFLICT (plan_id, feature_key) DO NOTHING;

INSERT INTO public.plan_entitlements (plan_id, feature_key, limit_value, is_enabled)
SELECT id, 'delivery_integrations', 1, TRUE FROM public.subscription_plans
WHERE slug = 'free' OR slug = 'starter'
ON CONFLICT (plan_id, feature_key) DO NOTHING;

INSERT INTO public.plan_entitlements (plan_id, feature_key, limit_value, is_enabled)
SELECT id, 'delivery_integrations', 3, TRUE FROM public.subscription_plans
WHERE slug = 'pro'
ON CONFLICT (plan_id, feature_key) DO NOTHING;

INSERT INTO public.plan_entitlements (plan_id, feature_key, limit_value, is_enabled)
SELECT id, 'delivery_integrations', NULL, TRUE FROM public.subscription_plans
WHERE slug = 'enterprise'
ON CONFLICT (plan_id, feature_key) DO NOTHING;

-- ============================================
-- Billing events — audit trail for subscription lifecycle
-- ============================================
CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id),
  invoice_id UUID REFERENCES public.invoices(id),
  from_plan_id UUID REFERENCES public.subscription_plans(id),
  to_plan_id UUID REFERENCES public.subscription_plans(id),
  amount_usd NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_billing_events_tenant ON public.billing_events(tenant_id);
CREATE INDEX idx_billing_events_type ON public.billing_events(tenant_id, event_type);

ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_entitlements ENABLE ROW LEVEL SECURITY;

-- Anyone can read plan entitlements (public pricing page)
CREATE POLICY "plan_entitlements_public_read" ON public.plan_entitlements
  FOR SELECT USING (TRUE);

CREATE POLICY "billing_events_select_own" ON public.billing_events
  FOR SELECT USING (tenant_id = (SELECT public.get_tenant_id()));

-- ============================================
-- Auto-provision usage counters when plan changes
-- ============================================
CREATE OR REPLACE FUNCTION public.provision_usage_counters(
  p_tenant_id UUID,
  p_plan_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  period DATE := date_trunc('month', CURRENT_DATE)::DATE;
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT feature_key, limit_value
    FROM public.plan_entitlements
    WHERE plan_id = p_plan_id
      AND is_enabled = TRUE
      AND feature_key IN ('products', 'orders_per_month', 'ai_messages_per_month')
  LOOP
    INSERT INTO public.usage_counters (
      tenant_id, metric, period_start, current_value, limit_value
    )
    VALUES (
      p_tenant_id,
      CASE
        WHEN rec.feature_key = 'orders_per_month' THEN 'orders'
        WHEN rec.feature_key = 'ai_messages_per_month' THEN 'ai_messages'
        ELSE rec.feature_key
      END,
      period,
      0,
      rec.limit_value
    )
    ON CONFLICT (tenant_id, metric, period_start)
    DO UPDATE SET
      limit_value = EXCLUDED.limit_value,
      updated_at = NOW();
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.provision_usage_counters(UUID, UUID) TO authenticated, service_role;

-- ============================================
-- Helper: get current plan's limit for a feature
-- ============================================
CREATE OR REPLACE FUNCTION public.get_tenant_limit(
  p_tenant_id UUID,
  p_feature_key TEXT
)
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pe.limit_value
  FROM public.tenants t
  JOIN public.plan_entitlements pe ON pe.plan_id = t.plan_id
  WHERE t.id = p_tenant_id
    AND pe.feature_key = p_feature_key
    AND pe.is_enabled = TRUE
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_tenant_limit(UUID, TEXT) TO authenticated, service_role;
