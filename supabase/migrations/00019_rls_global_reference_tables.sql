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

-- Public storefront metadata is exposed through a restricted-column view.
-- The underlying tenants table remains private to its members.
CREATE OR REPLACE VIEW public.public_storefronts
WITH (security_barrier = true)
AS
SELECT id, name, slug, logo_url, phone, address, is_active
FROM public.tenants
WHERE is_active IS TRUE;

REVOKE ALL ON public.public_storefronts FROM PUBLIC;
GRANT SELECT ON public.public_storefronts TO anon, authenticated;

-- Public catalog categories for active stores.
DROP POLICY IF EXISTS categories_select_public ON public.categories;
CREATE POLICY categories_select_public
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active IS TRUE
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.public_storefronts t
      WHERE t.id = categories.tenant_id
        AND t.is_active IS TRUE
    )
  );

-- Public booking pages may list active services and staff, but cannot write them.
DROP POLICY IF EXISTS service_categories_public_read ON public.service_categories;
CREATE POLICY service_categories_public_read
  ON public.service_categories
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active IS TRUE
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.public_storefronts t
      WHERE t.id = service_categories.tenant_id
        AND t.is_active IS TRUE
    )
  );

DROP POLICY IF EXISTS staff_members_public_read ON public.staff_members;
CREATE POLICY staff_members_public_read
  ON public.staff_members
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active IS TRUE
    AND EXISTS (
      SELECT 1
      FROM public.public_storefronts t
      WHERE t.id = staff_members.tenant_id
        AND t.is_active IS TRUE
    )
  );

-- Products are public only when their active tenant is visible through the restricted view.
DROP POLICY IF EXISTS products_select_public ON public.products;
CREATE POLICY products_select_public
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active IS TRUE
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.public_storefronts t
      WHERE t.id = products.tenant_id
        AND t.is_active IS TRUE
    )
  );
