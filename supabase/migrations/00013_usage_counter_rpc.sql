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
  INSERT INTO public.usage_counters (
    tenant_id, metric, period_start, current_value
  )
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
