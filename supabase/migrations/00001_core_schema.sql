-- NADOS core schema. Apply in Supabase before connecting real customer data.
create extension if not exists pgcrypto;

create table public.tenants (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 2 and 120),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 phone text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.memberships (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null default 'staff' check (role in ('owner','admin','staff')),
 created_at timestamptz not null default now(),
 unique (tenant_id,user_id), unique (tenant_id,id)
);
create index memberships_user_idx on public.memberships(user_id);
create index memberships_tenant_idx on public.memberships(tenant_id);

-- SECURITY DEFINER helpers avoid recursive RLS evaluation on memberships.
create or replace function public.is_tenant_member(target_tenant uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.memberships m where m.tenant_id=target_tenant and m.user_id=(select auth.uid())) $$;
create or replace function public.has_tenant_role(target_tenant uuid, allowed_roles text[])
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.memberships m where m.tenant_id=target_tenant and m.user_id=(select auth.uid()) and m.role=any(allowed_roles)) $$;
revoke all on function public.is_tenant_member(uuid) from public;
revoke all on function public.has_tenant_role(uuid,text[]) from public;
grant execute on function public.is_tenant_member(uuid) to authenticated;
grant execute on function public.has_tenant_role(uuid,text[]) to authenticated;

create table public.iraq_governorates (
 id smallint generated always as identity primary key, name_ar text not null unique,
 name_en text not null unique, code text not null unique,
 default_delivery_fee_iqd integer not null default 5000 check(default_delivery_fee_iqd>=0),
 is_active boolean not null default true
);
create table public.categories (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 name_ar text not null check(char_length(name_ar) between 1 and 120), slug text not null,
 created_at timestamptz not null default now(), deleted_at timestamptz,
 unique(tenant_id,slug), unique(tenant_id,id)
);
create index categories_tenant_idx on public.categories(tenant_id,id);
create table public.products (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 category_id uuid, name_ar text not null check(char_length(name_ar) between 1 and 180),
 description_ar text, price_iqd integer not null check(price_iqd>=0),
 stock integer not null default 0 check(stock>=0), sku text,
 image_urls jsonb not null default '[]'::jsonb check(jsonb_typeof(image_urls)='array'),
 is_active boolean not null default true, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), deleted_at timestamptz,
 foreign key(tenant_id,category_id) references public.categories(tenant_id,id) on delete set null (category_id),
 unique(tenant_id,sku), unique(tenant_id,id)
);
create index products_tenant_active_idx on public.products(tenant_id,is_active) where deleted_at is null;

create table public.customers (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 name text, phone text not null, governorate_id smallint references public.iraq_governorates(id),
 city text, address text, created_at timestamptz not null default now(), deleted_at timestamptz,
 unique(tenant_id,phone), unique(tenant_id,id)
);
create index customers_tenant_idx on public.customers(tenant_id,id);
create table public.orders (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 customer_id uuid, order_number text not null,
 status text not null default 'draft' check(status in ('draft','pending','confirmed','preparing','ready','shipped','delivered','cancelled','returned')),
 payment_method text not null default 'cod' check(payment_method in ('cod','zaincash','fib','qicard','nasspay','fastpay')),
 payment_status text not null default 'pending' check(payment_status in ('pending','paid','failed','refunded')),
 subtotal_iqd integer not null default 0 check(subtotal_iqd>=0),
 delivery_fee_iqd integer not null default 0 check(delivery_fee_iqd>=0),
 total_iqd integer not null default 0 check(total_iqd>=0),
 governorate_id smallint references public.iraq_governorates(id), city text, address text, notes text,
 source text not null default 'manual' check(source in ('manual','store','whatsapp','telegram','instagram')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 unique(tenant_id,order_number),
 foreign key(tenant_id,customer_id) references public.customers(tenant_id,id)
);
create index orders_tenant_status_idx on public.orders(tenant_id,status);
create index orders_tenant_created_idx on public.orders(tenant_id,created_at desc);

alter table public.iraq_governorates enable row level security;
alter table public.tenants enable row level security;
alter table public.memberships enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;

create policy governorates_public_read on public.iraq_governorates for select to anon,authenticated using(is_active);
create policy tenants_member_read on public.tenants for select to authenticated using(public.is_tenant_member(id));
create policy tenants_admin_update on public.tenants for update to authenticated using(public.has_tenant_role(id,array['owner','admin'])) with check(public.has_tenant_role(id,array['owner','admin']));
create policy memberships_member_read on public.memberships for select to authenticated using(public.is_tenant_member(tenant_id));
create policy memberships_owner_insert on public.memberships for insert to authenticated with check(public.has_tenant_role(tenant_id,array['owner']));
create policy memberships_owner_update on public.memberships for update to authenticated using(public.has_tenant_role(tenant_id,array['owner'])) with check(public.has_tenant_role(tenant_id,array['owner']));
create policy memberships_owner_delete on public.memberships for delete to authenticated using(public.has_tenant_role(tenant_id,array['owner']));

create policy categories_member_read on public.categories for select to authenticated using(deleted_at is null and public.is_tenant_member(tenant_id));
create policy categories_member_insert on public.categories for insert to authenticated with check(public.has_tenant_role(tenant_id,array['owner','admin','staff']));
create policy categories_admin_update on public.categories for update to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin','staff'])) with check(public.has_tenant_role(tenant_id,array['owner','admin','staff']));
create policy categories_admin_delete on public.categories for delete to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin']));

create policy products_member_read on public.products for select to authenticated using(deleted_at is null and public.is_tenant_member(tenant_id));
create policy products_member_insert on public.products for insert to authenticated with check(public.has_tenant_role(tenant_id,array['owner','admin','staff']));
create policy products_member_update on public.products for update to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin','staff'])) with check(public.has_tenant_role(tenant_id,array['owner','admin','staff']));
create policy products_admin_delete on public.products for delete to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin']));

create policy customers_member_read on public.customers for select to authenticated using(deleted_at is null and public.is_tenant_member(tenant_id));
create policy customers_member_insert on public.customers for insert to authenticated with check(public.has_tenant_role(tenant_id,array['owner','admin','staff']));
create policy customers_member_update on public.customers for update to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin','staff'])) with check(public.has_tenant_role(tenant_id,array['owner','admin','staff']));
create policy customers_admin_delete on public.customers for delete to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin']));

create policy orders_member_read on public.orders for select to authenticated using(deleted_at is null and public.is_tenant_member(tenant_id));
create policy orders_member_insert on public.orders for insert to authenticated with check(public.has_tenant_role(tenant_id,array['owner','admin','staff']));
create policy orders_member_update on public.orders for update to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin','staff'])) with check(public.has_tenant_role(tenant_id,array['owner','admin','staff']));
create policy orders_admin_delete on public.orders for delete to authenticated using(public.has_tenant_role(tenant_id,array['owner','admin']));

insert into public.iraq_governorates(name_ar,name_en,code,default_delivery_fee_iqd) values
('بغداد','Baghdad','BGW',5000),('البصرة','Basra','BSR',7500),('النجف','Najaf','NJF',6500),
('كربلاء','Karbala','KBL',6500),('أربيل','Erbil','ERB',8000),('السليمانية','Sulaymaniyah','SLM',8000),
('دهوك','Duhok','DHK',8500),('كركوك','Kirkuk','KRK',7500),('ديالى','Diyala','DYL',7000),
('الأنبار','Anbar','ANB',8000),('بابل','Babil','BBL',6500),('القادسية','Qadisiyyah','QAD',6500),
('ميسان','Maysan','MYN',8000),('المثنى','Muthanna','MTH',8500),('واسط','Wasit','WST',7000),
('ذي قار','Dhi Qar','DQR',7500),('صلاح الدين','Saladin','SLD',7500),('نينوى','Nineveh','NNV',7500)
on conflict(code) do nothing;
