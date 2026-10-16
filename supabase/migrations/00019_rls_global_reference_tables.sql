-- ============================================
-- NADOS — RLS for global reference/config tables
-- Keep public catalog reads explicit instead of relying on RLS being disabled.
-- ============================================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iraq_governorates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_pricing_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscription_plans_read_active ON public.subscription_plans;
CREATE POLICY subscription_plans_read_active
  ON public.subscription_plans
  FOR SELECT
  TO anon, authenticated
  USING (is_active IS TRUE);

DROP POLICY IF EXISTS iraq_governorates_read_active ON public.iraq_governorates;
CREATE POLICY iraq_governorates_read_active
  ON public.iraq_governorates
  FOR SELECT
  TO anon, authenticated
  USING (is_active IS TRUE);

DROP POLICY IF EXISTS delivery_companies_read_active ON public.delivery_companies;
CREATE POLICY delivery_companies_read_active
  ON public.delivery_companies
  FOR SELECT
  TO anon, authenticated
  USING (is_active IS TRUE);

DROP POLICY IF EXISTS whatsapp_pricing_rates_authenticated_read ON public.whatsapp_pricing_rates;
CREATE POLICY whatsapp_pricing_rates_authenticated_read
  ON public.whatsapp_pricing_rates
  FOR SELECT
  TO authenticated
  USING (TRUE);

GRANT SELECT ON public.subscription_plans, public.iraq_governorates, public.delivery_companies
  TO anon, authenticated;
GRANT SELECT ON public.whatsapp_pricing_rates TO authenticated;
