-- ============================================
-- NADOS - Utility RPCs
-- ============================================

-- Atomic stock decrement (race-safe)
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

-- Customer stats increment
CREATE OR REPLACE FUNCTION public.increment_customer_stats(
  p_customer_id UUID,
  p_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.customers
  SET total_orders = total_orders + 1,
      total_spent_iqd = total_spent_iqd + p_amount,
      updated_at = NOW()
  WHERE id = p_customer_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_customer_stats(UUID, INTEGER) TO authenticated, service_role;

-- Usage counter atomic increment
CREATE OR REPLACE FUNCTION public.increment_usage_counter(
  p_tenant_id UUID,
  p_metric TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  period DATE := date_trunc('month', CURRENT_DATE)::DATE;
BEGIN
  INSERT INTO public.usage_counters (tenant_id, metric, period_start, current_value)
  VALUES (p_tenant_id, p_metric, period, 0)
  ON CONFLICT (tenant_id, metric, period_start) DO NOTHING;

  UPDATE public.usage_counters
  SET current_value = current_value + 1,
      updated_at = NOW()
  WHERE tenant_id = p_tenant_id
    AND metric = p_metric
    AND period_start = period;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_usage_counter(UUID, TEXT) TO authenticated, service_role;

-- Booking availability check
CREATE OR REPLACE FUNCTION public.check_booking_availability(
  p_tenant_id UUID,
  p_staff_id UUID,
  p_scheduled_at TIMESTAMPTZ,
  p_duration_minutes INTEGER DEFAULT 30
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE tenant_id = p_tenant_id
      AND staff_id = p_staff_id
      AND status NOT IN ('cancelled', 'no_show')
      AND deleted_at IS NULL
      AND (
        scheduled_at < p_scheduled_at + (p_duration_minutes || ' minutes')::INTERVAL
        AND scheduled_at + (duration_minutes || ' minutes')::INTERVAL > p_scheduled_at
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.check_booking_availability(UUID, UUID, TIMESTAMPTZ, INTEGER)
  TO authenticated, anon, service_role;
