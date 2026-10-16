-- ============================================
-- NADOS — WhatsApp API Cost Tracking
-- Meta charges per-message from Oct 1, 2026
-- Iraq: $0.0079/service message after 1,000 free/month
-- ============================================

-- ============================================
-- 1. Per-tenant WhatsApp cost tracking
-- ============================================
CREATE TABLE IF NOT EXISTS public.whatsapp_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  free_quota_used INTEGER NOT NULL DEFAULT 0,
  billable_messages INTEGER NOT NULL DEFAULT 0,
  total_cost_usd NUMERIC(10,4) NOT NULL DEFAULT 0,
  cost_charged_to_tenant_usd NUMERIC(10,4) NOT NULL DEFAULT 0,
  cost_absorbed_by_platform_usd NUMERIC(10,4) NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, period_start)
);

CREATE INDEX idx_whatsapp_usage_tenant_period
  ON public.whatsapp_usage(tenant_id, period_start DESC);
CREATE INDEX idx_whatsapp_usage_period
  ON public.whatsapp_usage(period_start DESC);

ALTER TABLE public.whatsapp_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "whatsapp_usage_select_own" ON public.whatsapp_usage
  FOR SELECT USING (tenant_id = (SELECT public.get_tenant_id()));

CREATE TRIGGER trg_whatsapp_usage_updated_at
  BEFORE UPDATE ON public.whatsapp_usage
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- 2. Pricing config (per-country rates)
-- ============================================
CREATE TABLE IF NOT EXISTS public.whatsapp_pricing_rates (
  country_code TEXT PRIMARY KEY,
  country_name_ar TEXT NOT NULL,
  service_rate_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
  utility_rate_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
  marketing_rate_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
  free_tier_monthly INTEGER NOT NULL DEFAULT 1000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: Iraq + major markets for diaspora/regional expansion
INSERT INTO public.whatsapp_pricing_rates (country_code, country_name_ar, service_rate_usd, utility_rate_usd, marketing_rate_usd, free_tier_monthly) VALUES
('IQ', 'العراق', 0.0079, 0.0079, 0.0392, 1000),
('EG', 'مصر', 0.0036, 0.0036, 0.0644, 1000),
('SA', 'السعودية', 0.0107, 0.0107, 0.0576, 1000),
('AE', 'الإمارات', 0.0157, 0.0157, 0.0576, 1000),
('JO', 'الأردن', 0.0091, 0.0091, 0.0392, 1000),
('DZ', 'الجزائر', 0.0040, 0.0040, 0.0225, 1000),
('MA', 'المغرب', 0.0230, 0.0230, 0.0414, 1000),
('TR', 'تركيا', 0.0065, 0.0065, 0.0180, 1000)
ON CONFLICT (country_code) DO NOTHING;

-- ============================================
-- 3. RPC: record a WhatsApp message sent
-- ============================================
CREATE OR REPLACE FUNCTION public.record_whatsapp_message(
  p_tenant_id UUID,
  p_message_type TEXT DEFAULT 'service'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period DATE := date_trunc('month', CURRENT_DATE)::DATE;
  v_rate NUMERIC;
  v_free_tier INTEGER := 1000;
  v_row RECORD;
  v_new_billable INTEGER;
  v_message_cost NUMERIC;
  v_absorbed NUMERIC := 0;
  v_charged NUMERIC := 0;
  v_free_used INTEGER;
BEGIN
  -- Get Iraq rate (default) — service and utility have same rate in Iraq
  SELECT service_rate_usd, free_tier_monthly
  INTO v_rate, v_free_tier
  FROM public.whatsapp_pricing_rates
  WHERE country_code = 'IQ';

  v_rate := COALESCE(v_rate, 0.0079);
  v_free_tier := COALESCE(v_free_tier, 1000);

  -- Upsert row
  INSERT INTO public.whatsapp_usage (
    tenant_id, period_start, messages_sent, free_quota_used,
    billable_messages, total_cost_usd, last_message_at
  )
  VALUES (p_tenant_id, v_period, 1, 0, 0, 0, NOW())
  ON CONFLICT (tenant_id, period_start) DO UPDATE SET
    messages_sent = public.whatsapp_usage.messages_sent + 1,
    last_message_at = NOW();

  -- Recalculate
  SELECT * INTO v_row
  FROM public.whatsapp_usage
  WHERE tenant_id = p_tenant_id AND period_start = v_period;

  v_free_used := LEAST(v_row.messages_sent, v_free_tier);
  v_new_billable := GREATEST(0, v_row.messages_sent - v_free_tier);
  v_message_cost := v_rate;

  -- Cost model: absorb first N billable messages based on plan, charge rest
  -- Free plan: absorb all (soft cap enforced in app)
  -- Starter: absorb 500 billable, charge rest at cost + 30% markup
  -- Pro: absorb 2000 billable, charge rest at cost + 20% markup
  -- Enterprise: negotiate
  DECLARE
    v_plan_slug TEXT;
    v_absorb_cap INTEGER := 0;
    v_markup NUMERIC := 0;
  BEGIN
    SELECT sp.slug INTO v_plan_slug
    FROM public.tenants t
    JOIN public.subscription_plans sp ON sp.id = t.plan_id
    WHERE t.id = p_tenant_id;

    v_absorb_cap := CASE v_plan_slug
      WHEN 'free' THEN 100
      WHEN 'starter' THEN 500
      WHEN 'pro' THEN 2000
      ELSE 999999
    END;

    v_markup := CASE v_plan_slug
      WHEN 'starter' THEN 0.30
      WHEN 'pro' THEN 0.20
      ELSE 0
    END;

    IF v_new_billable <= v_absorb_cap THEN
      v_absorbed := v_message_cost;
      v_charged := 0;
    ELSE
      v_absorbed := 0;
      v_charged := v_message_cost * (1 + v_markup);
    END IF;
  END;

  UPDATE public.whatsapp_usage
  SET
    free_quota_used = v_free_used,
    billable_messages = v_new_billable,
    total_cost_usd = v_new_billable * v_rate,
    cost_charged_to_tenant_usd = public.whatsapp_usage.cost_charged_to_tenant_usd + v_charged,
    cost_absorbed_by_platform_usd = public.whatsapp_usage.cost_absorbed_by_platform_usd + v_absorbed
  WHERE tenant_id = p_tenant_id AND period_start = v_period;

  RETURN jsonb_build_object(
    'free_quota_used', v_free_used,
    'free_quota_remaining', GREATEST(0, v_free_tier - v_free_used),
    'billable_messages', v_new_billable,
    'charged_usd', v_charged,
    'absorbed_usd', v_absorbed
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_whatsapp_message(UUID, TEXT) TO authenticated, service_role;

-- ============================================
-- 4. View: monthly WhatsApp cost summary per tenant
-- ============================================
CREATE OR REPLACE VIEW public.v_whatsapp_cost_summary AS
SELECT
  wu.tenant_id,
  t.name AS tenant_name,
  wu.period_start,
  wu.messages_sent,
  wu.free_quota_used,
  wu.billable_messages,
  wu.total_cost_usd,
  wu.cost_charged_to_tenant_usd,
  wu.cost_absorbed_by_platform_usd,
  sp.slug AS plan_slug
FROM public.whatsapp_usage wu
JOIN public.tenants t ON t.id = wu.tenant_id
LEFT JOIN public.subscription_plans sp ON sp.id = t.plan_id;

GRANT SELECT ON public.v_whatsapp_cost_summary TO authenticated;

-- ============================================
-- 5. Update plan limits for WhatsApp (cost-aware)
-- ============================================
UPDATE public.subscription_plans
SET max_ai_messages = 200
WHERE slug = 'free';

UPDATE public.subscription_plans
SET max_ai_messages = 2000
WHERE slug = 'starter';

UPDATE public.subscription_plans
SET max_ai_messages = 3000,
    features = jsonb_set(
      features,
      '{5}',
      '"3000 رسالة AI/شهر (إضافية بمقابل)"'
    )
WHERE slug = 'pro';

-- Enterprise: unlimited, but cost is charged at cost + 10% markup
UPDATE public.subscription_plans
SET max_ai_messages = 999999
WHERE slug = 'enterprise';

-- Update plan_entitlements accordingly
UPDATE public.plan_entitlements pe
SET limit_value = sp.max_ai_messages
FROM public.subscription_plans sp
WHERE pe.plan_id = sp.id AND pe.feature_key = 'ai_messages_per_month';
