-- ============================================
-- NADOS - Auto-create tenant + membership on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.generate_slug(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(trim(base_name));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\u0600-\u06FF]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  IF base_slug IS NULL OR base_slug = '' THEN
    base_slug := 'store';
  END IF;

  final_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM public.tenants WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
  free_plan_id UUID;
  store_name TEXT;
  store_slug TEXT;
BEGIN
  store_name := COALESCE(
    NEW.raw_user_meta_data->>'store_name',
    split_part(COALESCE(NEW.email, NEW.phone, 'متجر جديد'), '@', 1)
  );

  store_slug := public.generate_slug(store_name);

  SELECT id INTO free_plan_id
  FROM public.subscription_plans
  WHERE slug = 'free'
  LIMIT 1;

  INSERT INTO public.tenants (name, slug, phone, plan_id, is_active)
  VALUES (store_name, store_slug, NEW.phone, free_plan_id, TRUE)
  RETURNING id INTO new_tenant_id;

  INSERT INTO public.memberships (tenant_id, user_id, role)
  VALUES (new_tenant_id, NEW.id, 'owner');

  IF free_plan_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (
      tenant_id, plan_id, status,
      current_period_start, current_period_end
    )
    VALUES (
      new_tenant_id, free_plan_id, 'active',
      NOW(), NOW() + INTERVAL '100 years'
    );
  END IF;

  INSERT INTO public.usage_counters (tenant_id, metric, period_start, current_value, limit_value)
  VALUES
    (new_tenant_id, 'products', date_trunc('month', CURRENT_DATE)::DATE, 0, 10),
    (new_tenant_id, 'orders', date_trunc('month', CURRENT_DATE)::DATE, 0, 50),
    (new_tenant_id, 'ai_messages', date_trunc('month', CURRENT_DATE)::DATE, 0, 200)
  ON CONFLICT (tenant_id, metric, period_start) DO NOTHING;

  INSERT INTO public.audit_log (tenant_id, user_id, action, entity_type, entity_id, new_values)
  VALUES (
    new_tenant_id, NEW.id, 'tenant.created', 'tenant', new_tenant_id,
    jsonb_build_object('name', store_name, 'slug', store_slug, 'source', 'signup')
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
