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
