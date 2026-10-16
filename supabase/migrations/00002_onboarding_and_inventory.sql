-- NADOS phase 2: safe onboarding and order items.
-- Apply after 00001_core_schema.sql in Supabase SQL Editor.
alter table public.orders add constraint orders_tenant_id_unique unique (tenant_id, id);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  order_id uuid not null,
  product_id uuid,
  product_name text not null check (char_length(product_name) between 1 and 180),
  quantity integer not null check (quantity between 1 and 10000),
  unit_price_iqd integer not null check (unit_price_iqd >= 0),
  line_total_iqd integer generated always as (quantity * unit_price_iqd) stored,
  created_at timestamptz not null default now(),
  foreign key (tenant_id, order_id) references public.orders(tenant_id, id) on delete cascade,
  foreign key (tenant_id, product_id) references public.products(tenant_id, id) on delete set null (product_id)
);
create index if not exists order_items_tenant_order_idx on public.order_items(tenant_id, order_id);
alter table public.order_items enable row level security;
drop policy if exists order_items_member_read on public.order_items;
create policy order_items_member_read on public.order_items for select to authenticated using (public.is_tenant_member(tenant_id));
drop policy if exists order_items_member_insert on public.order_items;
create policy order_items_member_insert on public.order_items for insert to authenticated with check (public.has_tenant_role(tenant_id, array['owner','admin','staff']));
drop policy if exists order_items_member_update on public.order_items;
create policy order_items_member_update on public.order_items for update to authenticated using (public.has_tenant_role(tenant_id, array['owner','admin','staff'])) with check (public.has_tenant_role(tenant_id, array['owner','admin','staff']));
drop policy if exists order_items_admin_delete on public.order_items;
create policy order_items_admin_delete on public.order_items for delete to authenticated using (public.has_tenant_role(tenant_id, array['owner','admin']));
grant select, insert, update, delete on public.order_items to authenticated;

-- First store and owner membership are created atomically. Client cannot choose tenant ID or role.
create or replace function public.create_store_for_current_user(p_store_name text)
returns uuid language plpgsql security definer set search_path = public, auth as $$
declare v_user_id uuid := auth.uid(); v_store_id uuid; v_slug text;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_store_name is null or char_length(trim(p_store_name)) < 2 or char_length(trim(p_store_name)) > 80 then raise exception 'Invalid store name'; end if;
  if exists (select 1 from public.memberships where user_id = v_user_id) then
    select tenant_id into v_store_id from public.memberships where user_id = v_user_id order by created_at limit 1;
    return v_store_id;
  end if;
  v_slug := trim(both '-' from regexp_replace(lower(trim(p_store_name)), '[^a-z0-9]+', '-', 'g'));
  if v_slug = '' then v_slug := 'store'; end if;
  v_slug := left(v_slug, 45) || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  insert into public.tenants(name, slug) values (trim(p_store_name), v_slug) returning id into v_store_id;
  insert into public.memberships(tenant_id, user_id, role) values (v_store_id, v_user_id, 'owner');
  return v_store_id;
end;
$$;
revoke all on function public.create_store_for_current_user(text) from public, anon;
grant execute on function public.create_store_for_current_user(text) to authenticated;
drop policy if exists memberships_owner_insert on public.memberships;
create policy memberships_owner_insert on public.memberships for insert to authenticated
  with check (public.has_tenant_role(tenant_id, array['owner']) and user_id = (select auth.uid()));
