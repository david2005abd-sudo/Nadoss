-- ============================================
-- Custom Access Token Hook
-- Injects tenant_id and tenant_role into JWT
-- ============================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $
DECLARE
  claims JSONB;
  user_tenant_id UUID;
  user_role TEXT;
BEGIN
  -- Find the user's primary tenant and role
  SELECT m.tenant_id, m.role
  INTO user_tenant_id, user_role
  FROM public.memberships m
  WHERE m.user_id = (event->>'user_id')::UUID
  ORDER BY
    CASE m.role WHEN 'owner' THEN 1 WHEN 'admin' THEN 2 ELSE 3 END,
    m.created_at ASC
  LIMIT 1;

  claims := event->'claims';

  IF user_tenant_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_metadata,tenant_id}', to_jsonb(user_tenant_id::TEXT));
    claims := jsonb_set(claims, '{app_metadata,tenant_role}', to_jsonb(user_role));
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Grant execute to supabase_auth_admin
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
