-- ============================================
-- Atomic stock decrement (race-safe)
-- ============================================
CREATE OR REPLACE FUNCTION public.decrement_stock(
  p_tenant_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock = GREATEST(0, stock - p_quantity),
      updated_at = NOW()
  WHERE id = p_product_id
    AND tenant_id = p_tenant_id
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_stock(UUID, UUID, INTEGER) TO authenticated, anon;
