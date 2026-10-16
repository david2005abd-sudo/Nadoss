-- ============================================
-- NADOS — SaaS Metrics & Retention
-- ============================================

-- ============================================
-- 1. Tenant health scores (updated via cron)
-- ============================================
CREATE TABLE IF NOT EXISTS public.tenant_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  health_score INTEGER NOT NULL DEFAULT 50 CHECK (health_score BETWEEN 0 AND 100),
  risk_level TEXT NOT NULL DEFAULT 'medium'
    CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  last_order_at TIMESTAMPTZ,
  days_since_last_order INTEGER,
  orders_last_30d INTEGER DEFAULT 0,
  revenue_last_30d BIGINT DEFAULT 0,
  login_count_last_7d INTEGER DEFAULT 0,
  features_used JSONB DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id)
);

CREATE INDEX idx_tenant_health_risk ON public.tenant_health(risk_level, health_score);
CREATE INDEX idx_tenant_health_tenant ON public.tenant_health(tenant_id);

-- ============================================
-- 2. Daily metrics snapshots (for trends)
-- ============================================
CREATE TABLE IF NOT EXISTS public.saas_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL UNIQUE,
  mrr_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  arr_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  active_tenants INTEGER NOT NULL DEFAULT 0,
  paying_tenants INTEGER NOT NULL DEFAULT 0,
  new_tenants INTEGER NOT NULL DEFAULT 0,
  churned_tenants INTEGER NOT NULL DEFAULT 0,
  trial_tenants INTEGER NOT NULL DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_gmv_iqd BIGINT DEFAULT 0,
  total_ai_messages INTEGER DEFAULT 0,
  new_mrr_usd NUMERIC(12,2) DEFAULT 0,
  expansion_mrr_usd NUMERIC(12,2) DEFAULT 0,
  contraction_mrr_usd NUMERIC(12,2) DEFAULT 0,
  churned_mrr_usd NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saas_metrics_date ON public.saas_metrics_daily(metric_date DESC);

-- ============================================
-- 3. Churn events (for analysis)
-- ============================================
CREATE TABLE IF NOT EXISTS public.churn_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('canceled', 'downgraded', 'expired', 'reactivated', 'upgraded')),
  from_plan_id UUID REFERENCES public.subscription_plans(id),
  to_plan_id UUID REFERENCES public.subscription_plans(id),
  mrr_change_usd NUMERIC(10,2),
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_churn_events_tenant ON public.churn_events(tenant_id);
CREATE INDEX idx_churn_events_type_date ON public.churn_events(event_type, created_at DESC);

-- ============================================
-- 4. RLS
-- ============================================
ALTER TABLE public.tenant_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churn_events ENABLE ROW LEVEL SECURITY;

-- Tenant health: tenant can see own
CREATE POLICY "tenant_health_select_own" ON public.tenant_health
  FOR SELECT USING (tenant_id = (SELECT public.get_tenant_id()));

-- SaaS metrics: platform-level only (owner sees aggregate), no tenant access
CREATE POLICY "saas_metrics_no_tenant" ON public.saas_metrics_daily
  FOR SELECT USING (FALSE);

-- Churn events: tenant sees own only
CREATE POLICY "churn_events_select_own" ON public.churn_events
  FOR SELECT USING (tenant_id = (SELECT public.get_tenant_id()));

-- ============================================
-- 5. RPC: compute SaaS snapshot for a date
-- ============================================
CREATE OR REPLACE FUNCTION public.compute_saas_metrics_snapshot(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mrr NUMERIC;
  v_arr NUMERIC;
  v_active INT;
  v_paying INT;
  v_new INT;
  v_churned INT;
  v_trial INT;
  v_orders INT;
  v_gmv BIGINT;
  v_ai INT;
BEGIN
  -- MRR from paid active subscriptions
  SELECT COALESCE(SUM(
    CASE
      WHEN sp.interval = 'year' THEN sp.price_usd / 12
      ELSE sp.price_usd
    END
  ), 0)
  INTO v_mrr
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON sp.id = s.plan_id
  WHERE s.status = 'active'
    AND sp.price_usd > 0;

  v_arr := v_mrr * 12;

  SELECT COUNT(*) INTO v_active FROM public.tenants WHERE is_active = TRUE;

  SELECT COUNT(DISTINCT s.tenant_id) INTO v_paying
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON sp.id = s.plan_id
  WHERE s.status = 'active' AND sp.price_usd > 0;

  SELECT COUNT(*) INTO v_new  FROM public.tenants
  WHERE created_at::DATE = p_date;

  SELECT COUNT(*) INTO v_churned
  FROM public.subscriptions
  WHERE status = 'canceled'
    AND canceled_at::DATE = p_date;

  SELECT COUNT(*) INTO v_trial
  FROM public.subscriptions
  WHERE status = 'trialing';

  SELECT COUNT(*) INTO v_orders
  FROM public.orders
  WHERE created_at::DATE = p_date AND deleted_at IS NULL;

  SELECT COALESCE(SUM(total_iqd), 0) INTO v_gmv
  FROM public.orders
  WHERE status = 'delivered'
    AND created_at::DATE = p_date
    AND deleted_at IS NULL;

  SELECT COALESCE(SUM(current_value), 0) INTO v_ai
  FROM public.usage_counters
  WHERE metric = 'ai_messages'
    AND period_start = date_trunc('month', p_date)::DATE;

  INSERT INTO public.saas_metrics_daily (
    metric_date, mrr_usd, arr_usd, active_tenants, paying_tenants,
    new_tenants, churned_tenants, trial_tenants, total_orders,
    total_gmv_iqd, total_ai_messages
  )
  VALUES (
    p_date, v_mrr, v_arr, v_active, v_paying,
    v_new, v_churned, v_trial, v_orders, v_gmv, v_ai
  )
  ON CONFLICT (metric_date) DO UPDATE SET
    mrr_usd = EXCLUDED.mrr_usd,
    arr_usd = EXCLUDED.arr_usd,
    active_tenants = EXCLUDED.active_tenants,
    paying_tenants = EXCLUDED.paying_tenants,
    new_tenants = EXCLUDED.new_tenants,
    churned_tenants = EXCLUDED.churned_tenants,
    trial_tenants = EXCLUDED.trial_tenants,
    total_orders = EXCLUDED.total_orders,
    total_gmv_iqd = EXCLUDED.total_gmv_iqd,
    total_ai_messages = EXCLUDED.total_ai_messages;
END;
$$;

GRANT EXECUTE ON FUNCTION public.compute_saas_metrics_snapshot(DATE) TO service_role;

-- ============================================
-- 6. RPC: recompute tenant health scores
-- ============================================
CREATE OR REPLACE FUNCTION public.recompute_tenant_health()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER := 0;
  rec RECORD;
  v_score INTEGER;
  v_risk TEXT;
  v_days_since INTEGER;
BEGIN
  FOR rec IN
    SELECT
      t.id AS tenant_id,
      MAX(o.created_at) AS last_order_at,
      COUNT(o.id) FILTER (WHERE o.created_at > NOW() - INTERVAL '30 days') AS orders_30d,
      COALESCE(SUM(o.total_iqd) FILTER (WHERE o.created_at > NOW() - INTERVAL '30 days' AND o.status = 'delivered'), 0) AS revenue_30d
    FROM public.tenants t
    LEFT JOIN public.orders o ON o.tenant_id = t.id AND o.deleted_at IS NULL
    WHERE t.is_active = TRUE
    GROUP BY t.id
  LOOP
    v_days_since := CASE
      WHEN rec.last_order_at IS NULL THEN 999
      ELSE EXTRACT(DAY FROM NOW() - rec.last_order_at)::INTEGER
    END;

    -- Health score algorithm (0-100)
    v_score := 50;
    -- Recency bonus
    IF v_days_since <= 1 THEN v_score := v_score + 25;
    ELSIF v_days_since <= 3 THEN v_score := v_score + 20;
    ELSIF v_days_since <= 7 THEN v_score := v_score + 15;
    ELSIF v_days_since <= 14 THEN v_score := v_score + 5;
    ELSIF v_days_since <= 30 THEN v_score := v_score - 5;
    ELSE v_score := v_score - 25;
    END IF;

    -- Volume bonus
    IF rec.orders_30d >= 100 THEN v_score := v_score + 25;
    ELSIF rec.orders_30d >= 50 THEN v_score := v_score + 20;
    ELSIF rec.orders_30d >= 20 THEN v_score := v_score + 15;
    ELSIF rec.orders_30d >= 5 THEN v_score := v_score + 10;
    ELSIF rec.orders_30d >= 1 THEN v_score := v_score + 5;
    END IF;

    v_score := GREATEST(0, LEAST(100, v_score));

    v_risk := CASE
      WHEN v_score >= 70 THEN 'low'
      WHEN v_score >= 45 THEN 'medium'
      WHEN v_score >= 25 THEN 'high'
      ELSE 'critical'
    END;

    INSERT INTO public.tenant_health (
      tenant_id, health_score, risk_level, last_order_at,
      days_since_last_order, orders_last_30d, revenue_last_30d, computed_at
    )
    VALUES (
      rec.tenant_id, v_score, v_risk, rec.last_order_at,
      v_days_since, rec.orders_30d, rec.revenue_30d, NOW()
    )
    ON CONFLICT (tenant_id) DO UPDATE SET
      health_score = EXCLUDED.health_score,
      risk_level = EXCLUDED.risk_level,
      last_order_at = EXCLUDED.last_order_at,
      days_since_last_order = EXCLUDED.days_since_last_order,
      orders_last_30d = EXCLUDED.orders_last_30d,
      revenue_last_30d = EXCLUDED.revenue_last_30d,
      computed_at = NOW();

    updated_count := updated_count + 1;
  END LOOP;

  RETURN updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.recompute_tenant_health() TO service_role;

-- ============================================
-- 7. Trigger: record churn events automatically
-- ============================================
CREATE OR REPLACE FUNCTION public.track_subscription_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_type TEXT;
  v_from_mrr NUMERIC := 0;
  v_to_mrr NUMERIC := 0;
  v_from_price NUMERIC;
  v_to_price NUMERIC;
BEGIN
  -- Determine event type
  IF OLD.status = 'active' AND NEW.status = 'canceled' THEN
    v_event_type := 'canceled';
  ELSIF OLD.plan_id IS DISTINCT FROM NEW.plan_id THEN
    SELECT price_usd INTO v_from_price FROM public.subscription_plans WHERE id = OLD.plan_id;
    SELECT price_usd INTO v_to_price FROM public.subscription_plans WHERE id = NEW.plan_id;

    v_from_mrr := COALESCE(v_from_price, 0);
    v_to_mrr := COALESCE(v_to_price, 0);

    IF v_to_mrr > v_from_mrr THEN
      v_event_type := 'upgraded';
    ELSIF v_to_mrr < v_from_mrr THEN
      v_event_type := 'downgraded';
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.churn_events (
    tenant_id, event_type, from_plan_id, to_plan_id, mrr_change_usd
  )
  VALUES (
    NEW.tenant_id, v_event_type, OLD.plan_id, NEW.plan_id, (v_to_mrr - v_from_mrr)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_subscription_change ON public.subscriptions;
CREATE TRIGGER trg_track_subscription_change
  AFTER UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.track_subscription_change();
