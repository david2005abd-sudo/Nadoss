-- ============================================
-- NADOS — Atomic public checkout and stock safety
-- ============================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS public_access_token TEXT,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_public_access_token
  ON public.orders(public_access_token)
  WHERE public_access_token IS NOT NULL;

-- Do not allow anonymous callers to decrement arbitrary inventory.
CREATE OR REPLACE FUNCTION public.decrement_stock(
  p_tenant_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_quantity IS NULL OR p_quantity < 1 THEN
    RAISE EXCEPTION 'INVALID_QUANTITY';
  END IF;

  IF auth.role() <> 'service_role'
     AND NOT EXISTS (
       SELECT 1
       FROM public.memberships m
       WHERE m.user_id = auth.uid()
         AND m.tenant_id = p_tenant_id
     ) THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  UPDATE public.products
  SET stock = stock - p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id
    AND tenant_id = p_tenant_id
    AND deleted_at IS NULL
    AND stock >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND_OR_INSUFFICIENT_STOCK';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.decrement_stock(UUID, UUID, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.decrement_stock(UUID, UUID, INTEGER) TO authenticated, service_role;

-- Public checkout is a single transaction: customer, order, order items and stock
-- changes either all commit or all roll back.
CREATE OR REPLACE FUNCTION public.create_store_order(
  p_slug TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_governorate_id INTEGER,
  p_city TEXT,
  p_address TEXT,
  p_notes TEXT,
  p_payment_method TEXT,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant public.tenants%ROWTYPE;
  v_governorate public.iraq_governorates%ROWTYPE;
  v_product public.products%ROWTYPE;
  v_item JSONB;
  v_product_id UUID;
  v_quantity INTEGER;
  v_line_total BIGINT;
  v_subtotal BIGINT := 0;
  v_delivery_fee INTEGER;
  v_total BIGINT;
  v_customer_id UUID;
  v_order_id UUID;
  v_order_number TEXT;
  v_public_access_token TEXT;
  v_lines JSONB := '[]'::JSONB;
  v_item_count INTEGER;
  v_distinct_count INTEGER;
BEGIN
  IF p_payment_method IS NULL OR p_payment_method NOT IN ('cod', 'zaincash', 'fib', 'qicard', 'nasspay') THEN
    RAISE EXCEPTION 'INVALID_PAYMENT_METHOD';
  END IF;

  IF length(trim(COALESCE(p_customer_name, ''))) < 2
     OR length(trim(p_customer_name)) > 100
     OR COALESCE(p_customer_phone, '') !~ '^\+9647[5789][0-9]{8}$'
     OR length(trim(COALESCE(p_city, ''))) < 2
     OR length(trim(p_city)) > 100
     OR length(trim(COALESCE(p_address, ''))) < 5
     OR length(trim(p_address)) > 500
     OR length(COALESCE(p_notes, '')) > 500 THEN
    RAISE EXCEPTION 'INVALID_CUSTOMER_DETAILS';
  END IF;

  SELECT * INTO v_tenant
  FROM public.tenants
  WHERE slug = p_slug AND is_active IS TRUE
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'STORE_NOT_FOUND';
  END IF;

  SELECT * INTO v_governorate
  FROM public.iraq_governorates
  WHERE id = p_governorate_id AND is_active IS TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_GOVERNORATE';
  END IF;
  v_delivery_fee := GREATEST(0, COALESCE(v_governorate.delivery_fee_iqd, 0));

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'INVALID_CART';
  END IF;

  v_item_count := jsonb_array_length(p_items);
  IF v_item_count < 1 OR v_item_count > 50 THEN
    RAISE EXCEPTION 'INVALID_CART';
  END IF;

  SELECT COUNT(DISTINCT (value->>'productId')::UUID)
  INTO v_distinct_count
  FROM jsonb_array_elements(p_items) AS items(value);

  IF v_distinct_count <> v_item_count THEN
    RAISE EXCEPTION 'DUPLICATE_PRODUCT';
  END IF;

  -- Lock products in a deterministic order to reduce deadlocks under concurrency.
  FOR v_item IN
    SELECT value
    FROM jsonb_array_elements(p_items) AS items(value)
    ORDER BY value->>'productId'
  LOOP
    IF COALESCE(v_item->>'productId', '') !~* '^[0-9a-f-]{36}$'
       OR COALESCE(v_item->>'quantity', '') !~ '^[0-9]+$' THEN
      RAISE EXCEPTION 'INVALID_CART_ITEM';
    END IF;

    v_product_id := (v_item->>'productId')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;
    IF v_quantity < 1 OR v_quantity > 999 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY';
    END IF;

    SELECT * INTO v_product
    FROM public.products
    WHERE id = v_product_id
      AND tenant_id = v_tenant.id
      AND is_active IS TRUE
      AND deleted_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND';
    END IF;
    IF v_product.price_iqd < 0 THEN
      RAISE EXCEPTION 'INVALID_PRODUCT_PRICE';
    END IF;
    IF v_product.stock < v_quantity THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK';
    END IF;

    UPDATE public.products
    SET stock = stock - v_quantity,
        updated_at = NOW()
    WHERE id = v_product.id
      AND tenant_id = v_tenant.id
      AND stock >= v_quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK';
    END IF;

    v_line_total := v_product.price_iqd::BIGINT * v_quantity;
    v_subtotal := v_subtotal + v_line_total;

    v_lines := v_lines || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id,
      'product_name', COALESCE(NULLIF(v_product.name_ar, ''), v_product.name),
      'quantity', v_quantity,
      'unit_price_iqd', v_product.price_iqd,
      'total_price_iqd', v_line_total
    ));
  END LOOP;

  v_total := v_subtotal + v_delivery_fee;
  IF v_total > 2147483647 THEN
    RAISE EXCEPTION 'ORDER_TOTAL_TOO_LARGE';
  END IF;

  INSERT INTO public.customers (
    tenant_id, name, phone, governorate_id, city, address, deleted_at, updated_at
  )
  VALUES (
    v_tenant.id, trim(p_customer_name), p_customer_phone,
    p_governorate_id, trim(p_city), trim(p_address), NULL, NOW()
  )
  ON CONFLICT (tenant_id, phone)
  DO UPDATE SET
    name = EXCLUDED.name,
    governorate_id = EXCLUDED.governorate_id,
    city = EXCLUDED.city,
    address = EXCLUDED.address,
    deleted_at = NULL,
    updated_at = NOW()
  RETURNING id INTO v_customer_id;

  v_order_number := 'ORD-' || upper(substr(replace(gen_random_uuid()::TEXT, '-', ''), 1, 16));
  v_public_access_token := replace(gen_random_uuid()::TEXT, '-', '') || replace(gen_random_uuid()::TEXT, '-', '');

  INSERT INTO public.orders (
    tenant_id, customer_id, order_number, public_access_token, status, payment_method, payment_status,
    subtotal_iqd, delivery_fee_iqd, total_iqd, governorate_id, city, address, notes, source
  )
  VALUES (
    v_tenant.id, v_customer_id, v_order_number, v_public_access_token,
    CASE WHEN p_payment_method = 'cod' THEN 'confirmed' ELSE 'pending' END,
    p_payment_method, 'pending', v_subtotal::INTEGER, v_delivery_fee, v_total::INTEGER,
    p_governorate_id, trim(p_city), trim(p_address), NULLIF(trim(COALESCE(p_notes, '')), ''), 'store'
  )
  RETURNING id INTO v_order_id;

  INSERT INTO public.order_items (
    tenant_id, order_id, product_id, product_name, quantity, unit_price_iqd, total_price_iqd
  )
  SELECT
    v_tenant.id,
    v_order_id,
    (line->>'product_id')::UUID,
    line->>'product_name',
    (line->>'quantity')::INTEGER,
    (line->>'unit_price_iqd')::INTEGER,
    (line->>'total_price_iqd')::INTEGER
  FROM jsonb_array_elements(v_lines) AS lines(line);

  INSERT INTO public.audit_log (tenant_id, action, entity_type, entity_id, new_values)
  VALUES (
    v_tenant.id,
    'order.created.storefront',
    'order',
    v_order_id,
    jsonb_build_object('order_number', v_order_number, 'total_iqd', v_total, 'source', 'store')
  );

  RETURN jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'public_access_token', v_public_access_token,
    'total_iqd', v_total,
    'subtotal_iqd', v_subtotal,
    'delivery_fee_iqd', v_delivery_fee,
    'tenant_id', v_tenant.id,
    'tenant_slug', v_tenant.slug
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_store_order(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_store_order(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;

-- Release stock if the payment provider cannot create a payment session.
CREATE OR REPLACE FUNCTION public.cancel_unpaid_store_order(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_item RECORD;
BEGIN
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND OR v_order.payment_status NOT IN ('pending', 'failed') OR v_order.status <> 'pending' THEN
    RETURN FALSE;
  END IF;

  FOR v_item IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_id = v_order.id
      AND tenant_id = v_order.tenant_id
      AND product_id IS NOT NULL
  LOOP
    UPDATE public.products
    SET stock = stock + v_item.quantity,
        updated_at = NOW()
    WHERE id = v_item.product_id
      AND tenant_id = v_order.tenant_id;
  END LOOP;

  UPDATE public.orders
  SET status = 'cancelled',
      payment_status = 'failed',
      updated_at = NOW()
  WHERE id = v_order.id
    AND payment_status = 'pending'
    AND status = 'pending';

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_unpaid_store_order(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_unpaid_store_order(UUID) TO service_role;
