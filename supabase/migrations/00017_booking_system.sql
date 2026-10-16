-- ============================================
-- NADOS — Booking & Appointments (Optional module)
-- ============================================

CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  slug TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price_iqd INTEGER DEFAULT 0,
  color TEXT DEFAULT '#1a56db',
  is_active BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  avatar_url TEXT,
  working_hours JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  booking_number TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  service_id UUID NOT NULL REFERENCES public.service_categories(id),
  staff_id UUID REFERENCES public.staff_members(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  price_iqd INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  source TEXT DEFAULT 'web' CHECK (source IN ('web', 'whatsapp', 'phone', 'walk_in', 'admin')),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, booking_number)
);

CREATE INDEX idx_bookings_tenant_date ON public.bookings(tenant_id, scheduled_at);
CREATE INDEX idx_bookings_tenant_status ON public.bookings(tenant_id, status);
CREATE INDEX idx_bookings_staff_date ON public.bookings(staff_id, scheduled_at);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_categories_own" ON public.service_categories
  FOR ALL USING (tenant_id = (SELECT public.get_tenant_id()));

CREATE POLICY "staff_members_own" ON public.staff_members
  FOR ALL USING (tenant_id = (SELECT public.get_tenant_id()));

CREATE POLICY "bookings_own" ON public.bookings
  FOR ALL USING (tenant_id = (SELECT public.get_tenant_id()));

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Booking availability RPC
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
