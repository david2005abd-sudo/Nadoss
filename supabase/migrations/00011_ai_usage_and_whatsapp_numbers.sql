-- ============================================
-- WhatsApp numbers mapping (multi-tenant)
-- ============================================
CREATE TABLE IF NOT EXISTS public.whatsapp_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  phone_number_id TEXT NOT NULL UNIQUE,
  display_phone_number TEXT,
  waba_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_numbers_tenant ON public.whatsapp_numbers(tenant_id);
CREATE INDEX idx_whatsapp_numbers_phone_id ON public.whatsapp_numbers(phone_number_id);

ALTER TABLE public.whatsapp_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "whatsapp_numbers_select_own" ON public.whatsapp_numbers
  FOR SELECT USING (tenant_id = (SELECT public.get_tenant_id()));

CREATE POLICY "whatsapp_numbers_insert_own" ON public.whatsapp_numbers
  FOR INSERT WITH CHECK (tenant_id = (SELECT public.get_tenant_id()));

CREATE POLICY "whatsapp_numbers_update_own" ON public.whatsapp_numbers
  FOR UPDATE USING (tenant_id = (SELECT public.get_tenant_id()));

CREATE TRIGGER trg_whatsapp_numbers_updated_at
  BEFORE UPDATE ON public.whatsapp_numbers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- increment_ai_usage RPC
-- ============================================
CREATE OR REPLACE FUNCTION public.increment_ai_usage(p_tenant_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  period DATE;
BEGIN
  period := date_trunc('month', CURRENT_DATE)::DATE;

  INSERT INTO public.usage_counters (
    tenant_id, metric, period_start, current_value, limit_value
  )
  VALUES (p_tenant_id, 'ai_messages', period, 1, 100)
  ON CONFLICT (tenant_id, metric, period_start)
  DO UPDATE SET
    current_value = public.usage_counters.current_value + 1,
    updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_ai_usage(UUID) TO authenticated, service_role;

-- ============================================
-- Fix ai_extractions status constraint to include 'matched'
-- ============================================
ALTER TABLE public.ai_extractions
  DROP CONSTRAINT IF EXISTS ai_extractions_status_check;

ALTER TABLE public.ai_extractions
  ADD CONSTRAINT ai_extractions_status_check
  CHECK (status IN ('pending', 'matched', 'partial', 'failed', 'manual_review'));
