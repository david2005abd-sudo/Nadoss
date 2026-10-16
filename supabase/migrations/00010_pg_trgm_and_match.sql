-- ============================================
-- pg_trgm + fuzzy product matching
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_products_name_ar_trgm
  ON public.products USING gin (name_ar gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON public.products USING gin (name gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.match_products_fuzzy(
  p_tenant_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  name_ar TEXT,
  name TEXT,
  price_iqd INTEGER,
  stock INTEGER,
  similarity REAL
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.name_ar,
    p.name,
    p.price_iqd,
    p.stock,
    GREATEST(
      similarity(COALESCE(p.name_ar, ''), p_query),
      similarity(COALESCE(p.name, ''), p_query)
    ) AS similarity
  FROM public.products p
  WHERE p.tenant_id = p_tenant_id
    AND p.is_active = TRUE
    AND p.deleted_at IS NULL
    AND (
      COALESCE(p.name_ar, '') % p_query
      OR COALESCE(p.name, '') % p_query
    )
  ORDER BY similarity DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.match_products_fuzzy(UUID, TEXT, INTEGER)
  TO authenticated, anon, service_role;
