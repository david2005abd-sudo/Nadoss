-- NADOS phase 3: atomic order creation.
-- Apply after migrations 00001 and 00002.
create or replace function public.create_order_for_current_user(
 p_customer_name text, p_phone text, p_governorate_id smallint,
 p_city text, p_address text, p_notes text, p_items jsonb
) returns uuid language plpgsql security definer set search_path = public, auth as $$
declare
 v_user_id uuid := auth.uid(); v_tenant_id uuid; v_customer_id uuid; v_order_id uuid;
 v_order_number text; v_item jsonb; v_product_id uuid; v_quantity integer;
 v_product_name text; v_price integer; v_stock integer; v_subtotal bigint := 0; v_delivery_fee integer := 0;
begin
 if v_user_id is null then raise exception 'Authentication required'; end if;
 if p_customer_name is null or char_length(trim(p_customer_name)) < 2 or char_length(trim(p_customer_name)) > 120 then raise exception 'Invalid customer name'; end if;
 if p_phone is null or char_length(regexp_replace(p_phone, '\s', '', 'g')) < 7 or char_length(p_phone) > 30 then raise exception 'Invalid phone'; end if;
 if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 30 then raise exception 'Invalid order items'; end if;
 select m.tenant_id into v_tenant_id from public.memberships m where m.user_id = v_user_id order by m.created_at limit 1;
 if v_tenant_id is null then raise exception 'Store membership required'; end if;
 if not public.has_tenant_role(v_tenant_id, array['owner','admin','staff']) then raise exception 'Insufficient role'; end if;
 if p_governorate_id is not null then
  select g.default_delivery_fee_iqd into v_delivery_fee from public.iraq_governorates g where g.id=p_governorate_id and g.is_active;
  if not found then raise exception 'Invalid governorate'; end if;
 end if;
 insert into public.customers(tenant_id,name,phone,governorate_id,city,address)
 values(v_tenant_id,trim(p_customer_name),trim(p_phone),p_governorate_id,nullif(trim(p_city),''),nullif(trim(p_address),''))
 on conflict(tenant_id,phone) do update set name=excluded.name,governorate_id=excluded.governorate_id,city=excluded.city,address=excluded.address
 returning id into v_customer_id;
 for v_item in select value from jsonb_array_elements(p_items) loop
  begin v_product_id := (v_item->>'product_id')::uuid; v_quantity := (v_item->>'quantity')::integer;
  exception when others then raise exception 'Invalid order item'; end;
  if v_quantity < 1 or v_quantity > 10000 then raise exception 'Invalid quantity'; end if;
  select p.name_ar,p.price_iqd,p.stock into v_product_name,v_price,v_stock from public.products p
   where p.id=v_product_id and p.tenant_id=v_tenant_id and p.deleted_at is null and p.is_active for update;
  if not found then raise exception 'Product unavailable'; end if;
  if v_stock < v_quantity then raise exception 'Insufficient stock for %',v_product_name; end if;
  update public.products set stock=stock-v_quantity,updated_at=now() where id=v_product_id and tenant_id=v_tenant_id;
  v_subtotal := v_subtotal + (v_price::bigint * v_quantity);
 end loop;
 if v_subtotal > 2000000000 then raise exception 'Order total too large'; end if;
 v_order_number := 'ND-' || to_char(now(),'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
 insert into public.orders(tenant_id,customer_id,order_number,status,payment_method,payment_status,subtotal_iqd,delivery_fee_iqd,total_iqd,governorate_id,city,address,notes,source)
 values(v_tenant_id,v_customer_id,v_order_number,'pending','cod','pending',v_subtotal::integer,v_delivery_fee,(v_subtotal+v_delivery_fee)::integer,p_governorate_id,nullif(trim(p_city),''),nullif(trim(p_address),''),nullif(trim(p_notes),''),'manual')
 returning id into v_order_id;
 for v_item in select value from jsonb_array_elements(p_items) loop
  v_product_id := (v_item->>'product_id')::uuid; v_quantity := (v_item->>'quantity')::integer;
  select p.name_ar,p.price_iqd into v_product_name,v_price from public.products p where p.id=v_product_id and p.tenant_id=v_tenant_id;
  insert into public.order_items(tenant_id,order_id,product_id,product_name,quantity,unit_price_iqd)
   values(v_tenant_id,v_order_id,v_product_id,v_product_name,v_quantity,v_price);
 end loop;
 return v_order_id;
end;
$$;
revoke all on function public.create_order_for_current_user(text,text,smallint,text,text,text,jsonb) from public, anon;
grant execute on function public.create_order_for_current_user(text,text,smallint,text,text,text,jsonb) to authenticated;
