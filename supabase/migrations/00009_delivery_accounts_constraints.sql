-- ============================================
-- Add indexes + constraints for delivery accounts
-- ============================================

-- Only one default account per tenant
CREATE UNIQUE INDEX IF NOT EXISTS uniq_default_delivery_account_per_tenant
  ON public.tenant_delivery_accounts (tenant_id)
  WHERE is_default = TRUE;

-- Fast lookup for shipment resolution
CREATE INDEX IF NOT EXISTS idx_shipments_tenant_tracking
  ON public.shipments (tenant_id, tracking_number);

-- Webhook lookup (external_id may be used too)
CREATE INDEX IF NOT EXISTS idx_shipments_external_id
  ON public.shipments (external_id)
  WHERE external_id IS NOT NULL;

-- Track last sync time for shipments (new column)
ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- Track shipment events (normalized history)
CREATE TABLE IF NOT EXISTS public.shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  description TEXT,
  location TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL DEFAULT 'api'
    CHECK (source IN ('api', 'webhook', 'manual')),
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipment_events_shipment ON public.shipment_events(shipment_id);
CREATE INDEX idx_shipment_events_tenant ON public.shipment_events(tenant_id);

ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shipment_events_select_own" ON public.shipment_events
  FOR SELECT USING (tenant_id = (SELECT public.get_tenant_id()));

CREATE POLICY "shipment_events_insert_own" ON public.shipment_events
  FOR INSERT WITH CHECK (tenant_id = (SELECT public.get_tenant_id()));
