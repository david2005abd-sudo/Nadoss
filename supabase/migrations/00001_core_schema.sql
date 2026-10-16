-- NADOS core schema. Apply in a Supabase project before enabling real data.
create extension if not exists pgcrypto;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('owner','admin','staff')),
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);
create index if not exists memberships_user_id_idx on public.memberships(user_id);
create index if not exists memberships_tenant_id_idx on public.memberships(tenant_id);

create table if not exists public.iraq_governorates (
  id smallint generated always as identity primary key,
  name_ar text not null unique,
  name_en text not null unique,
  code text not null unique,
  default_delivery_fee_iqd integer not null default 5000 check (default_delivery_fee_iqd >= 0),
  is_active boolean not null default true
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name_ar text not null check (char_length(name_ar) between 1 and 120),
  slug text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tenant_id, slug)
);
create index if not exists categories_tenant_id_idx on public.categories(tenant_id, id);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  category_id uuid,
  name_ar text not null check (char_length(name_ar) between 1 and 180),
  description_ar text,
  price_iqd integer not null check (price_iqd >= 0),
  stock integer not null default 0 check (stock >= 0),
  sku text,
  image_urls jsonb not null default '[]'::jsonb check (jsonb_typeof(image_urls) = 'array'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint products_category_same_tenant_fk
    foreign key (tenant_id, category_id) references public.categories(tenant_id, id)
    on delete set null (category_id),
  unique (tenant_id, sku)
);
create index if not exists products_tenant_active_idx on public.products(tenant_id, is_active) where deleted_at is null;
create index if not exists products_tenant_id_idx on public.products(tenant_id, id);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text,
  phone text not null,
  governorate_id smallint references public.iraq_governorates(id),
  city text,
  address text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tenant_id, phone)
);
create index if not exists customers_tenant_id_idx on public.customers(tenant_id, id);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid,
  order_number text not null,
  status text not null default 'draft' check (status in ('draft','pending','confirmed','preparing','ready','shipped','delivered','cancelled','returned')),
  payment_method text not null default 'cod' check (payment_method in ('cod','zaincash','fib','qicard','nasspay','fastpay')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  subtotal_iqd integer not null default 0 check (subtotal_iqd >= 0),
  delivery_fee_iqd integer not null default 0 check (delivery_fee_iqd >= 0),
  total_iqd integer not null default 0 check (total_iqd >= 0),
  governorate_id smallint references public.iraq_governorates(id),
  city text,
  address text,
  notes text,
  source text not null default 'manual' check (source in ('manual','store','whatsapp','telegram','instagram')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (tenant_id, order_number),
  foreign key (tenant_id, customer_id) references public.customers(tenant_id, id)
);
create index if not exists orders_tenant_status_idx on public.orders(tenant_id, status);
create index if not exists orders_tenant_created_idx on public.orders(tenant_id, created_at desc);

-- Public directory data: readable by everyone, writable only by trusted database admins.
alter table public.iraq_governorates enable row level security;
create policy "governorates_public_read" on public.iraq_governorates
  for select to anon, authenticated using (is_active = true);

-- Tenant-owned tables: membership is checked against auth.uid(); client-supplied tenant IDs alone grant no access.
alter table public.tenants enable row level security;
alter table public.memberships enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;

create policy "tenants_member_select" on public.tenants for select to authenticated
  using (exists (select 1 from public.memberships m where m.tenant_id = tenants.id and m.user_id = (select auth.uid())));
create policy "tenants_admin_update" on public.tenants for update to authenticated
  using (exists (select 1 from public.memberships m where m.tenant_id = tenants.id and m.user_id = (select auth.uid()) and m.role in ('owner','admin')))
  with check (exists (select 1 from public.memberships m where m.tenant_id = tenants.id and m.user_id = (select auth.uid()) and m.role in ('owner','admin')));

create policy "memberships_member_select" on public.memberships for select to authenticated
  using (exists (select 1 from public.memberships mine where mine.tenant_id = memberships.tenant_id and mine.user_id = (select auth.uid())));
create policy "memberships_owner_manage" on public.memberships for all to authenticated
  using (exists (select 1 from public.memberships mine where mine.tenant_id = memberships.tenant_id and mine.user_id = (select auth.uid()) and mine.role = 'owner'))
  with check (exists (select 1 from public.memberships mine where mine.tenant_id = memberships.tenant_id and mine.user_id = (select auth.uid()) and mine.role = 'owner'));

create policy "categories_member_read" on public.categories for select to authenticated
  using (deleted_at is null and exists (select 1 from public.memberships m where m.tenant_id = categories.tenant_id and m.user_id = (select auth.uid())));
create policy "categories_staff_write" on public.categories for all to authenticated
  using (exists (select 1 from public.memberships m where m.tenant_id = categories.tenant_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','staff')))
  with check (exists (select 1 from public.memberships m where m.tenant_id = categories.tenant_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','staff')));

create policy "products_member_read" on public.products for select to authenticated
  using (deleted_at is null and exists (select 1 from public.memberships m where m.tenant_id = products.tenant_id and m.user_id = (select auth.uid())));
create policy "products_staff_write" on public.products for all to authenticated
  using (exists (select 1 from public.memberships m where m.tenant_id = products.tenant_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','staff')))
  with check (exists (select 1 from public.memberships m where m.tenant_id = products.tenant_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','staff')));

create policy "customers_member_read" on public.customers for select to authenticated
  using (deleted_at is null and exists (select 1 from public.memberships m where m.tenant_id = customers.tenant_id and m.user_id = (select auth.uid())));
create policy "customers_staff_write" on public.customers for all to authenticated
  using (exists (select 1 from public.memberships m where m.tenant_id = customers.tenant_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','staff')))
  with check (exists (select 1 from public.memberships m where m.tenant_id = customers.tenant_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','staff')));

create policy "orders_member_read" on public.orders for select to authenticated
  using (deleted_at is null and exists (select 1 from public.memberships m where m.tenant_id = orders.tenant_id and m.user_id = (select auth.uid())));
create policy "orders_staff_write" on public.orders for all to authenticated
  using (exists (select 1 from public.memberships m where m.tenant_id = orders.tenant_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','staff')))
  with check (exists (select 1 from public.memberships m where m.tenant_id = orders.tenant_id and m.user_id = (select auth.uid()) and m.role in ('owner','admin','staff')));

-- Seed the 18 governorates. Fees are starting examples and should be verified with each delivery provider.
insert into public.iraq_governorates (name_ar, name_en, code, default_delivery_fee_iqd) values
('بغداد','Baghdad','BGW',5000), ('البصرة','Basra','BSR',7500),
('النجف','Najaf','NJF',6500), ('كربلاء','Karbala','KBL',6500),
('أربيل','Erbil','ERB',8000), ('السليمانية','Sulaymaniyah','SLM',8000),
('دهوك','Duhok','DHK',8500), ('كركوك','Kirkuk','KRK',7500),
('ديالى','Diyala','DYL',7000), ('الأنبار','Anbar','ANB',8000),
('بابل','Babil','BBL',6500), ('القادسية','Qadisiyyah','QAD',6500),
('ميسان','Maysan','MYN',8000), ('المثنى','Muthanna','MTH',8500),
('واسط','Wasit','WST',7000), ('ذي قار','Dhi Qar','DQR',7500),
('صلاح الدين','Saladin','SLD',7500), ('نينوى','Nineveh','NNV',7500)
on conflict (code) do nothing;
