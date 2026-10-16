'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkoutSchema, cartPayloadSchema } from '@/lib/validations/checkout';
import { createPayment } from '@/lib/payments/iraqpay';

export interface CheckoutState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

interface ActionInput {
  slug: string;
  formData: FormData;
  cartItems: { productId: string; quantity: number }[];
}

export async function placeOrderAction(
  _prev: CheckoutState,
  { slug, formData, cartItems }: ActionInput
): Promise<CheckoutState> {
  // 1. Validate checkout fields
  const raw = {
    customerName: String(formData.get('customerName') ?? ''),
    customerPhone: String(formData.get('customerPhone') ?? ''),
    governorateId: formData.get('governorateId'),
    city: String(formData.get('city') ?? ''),
    address: String(formData.get('address') ?? ''),
    notes: String(formData.get('notes') ?? ''),
    paymentMethod: String(formData.get('paymentMethod') ?? 'cod'),
  };

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const out: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(flat)) if (v && v.length) out[k] = v;
    return { fieldErrors: out };
  }
  const input = parsed.data;

  // 2. Validate cart
  const cartParsed = cartPayloadSchema.safeParse(cartItems);
  if (!cartParsed.success) {
    return { error: 'السلة فارغة أو غير صالحة' };
  }

  const supabase = await createClient();

  // 3. Resolve tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, slug')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!tenant) return { error: 'المتجر غير موجود' };

  // 4. Fetch authoritative product prices from DB (never trust client)
  const productIds = cartParsed.data.map((i) => i.productId);
  const { data: products, error: productsErr } = await supabase
    .from('products')
    .select('id, name_ar, name, price_iqd, stock, is_active, deleted_at, tenant_id')
    .in('id', productIds)
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .is('deleted_at', null);

  if (productsErr || !products || products.length === 0) {
    return { error: 'تعذر التحقق من المنتجات' };
  }

  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = cartParsed.data.map((line) => {
    const p = byId.get(line.productId);
    if (!p) throw new Error('PRODUCT_NOT_FOUND');
    if (p.stock < line.quantity) throw new Error(`INSUFFICIENT_STOCK:${p.name_ar ?? p.name}`);
    return {
      product: p,
      quantity: line.quantity,
      unitPrice: p.price_iqd,
      total: p.price_iqd * line.quantity,
    };
  });

  // 5. Governorate → delivery fee
  const { data: gov } = await supabase
    .from('iraq_governorates')
    .select('id, name_ar, delivery_fee_iqd')
    .eq('id', input.governorateId)
    .maybeSingle();

  if (!gov) return { error: 'المحافظة غير صالحة' };

  const deliveryFee = gov.delivery_fee_iqd ?? 0;
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const total = subtotal + deliveryFee;

  // 6. Upsert customer
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id, total_orders, total_spent_iqd')
    .eq('tenant_id', tenant.id)
    .eq('phone', input.customerPhone)
    .is('deleted_at', null)
    .maybeSingle();

  let customerId: string;
  if (existingCustomer) {
    customerId = existingCustomer.id;
    await supabase
      .from('customers')
      .update({
        name: input.customerName,
        governorate_id: input.governorateId,
        city: input.city,
        address: input.address,
      })
      .eq('id', customerId);
  } else {
    const { data: newCustomer, error: custErr } = await supabase
      .from('customers')
      .insert({
        tenant_id: tenant.id,
        name: input.customerName,
        phone: input.customerPhone,
        governorate_id: input.governorateId,
        city: input.city,
        address: input.address,
      })
      .select('id')
      .single();

    if (custErr || !newCustomer) return { error: 'تعذر إنشاء حساب العميل' };
    customerId = newCustomer.id;
  }

  // 7. Create order
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
  const initialStatus = input.paymentMethod === 'cod' ? 'confirmed' : 'pending';

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      tenant_id: tenant.id,
      customer_id: customerId,
      order_number: orderNumber,
      status: initialStatus,
      payment_method: input.paymentMethod,
      payment_status: 'pending',
      subtotal_iqd: subtotal,
      delivery_fee_iqd: deliveryFee,
      total_iqd: total,
      governorate_id: input.governorateId,
      city: input.city,
      address: input.address,
      notes: input.notes || null,
      source: 'store',
    })
    .select('id, order_number, total_iqd')
    .single();

  if (orderErr || !order) return { error: 'تعذر إنشاء الطلب' };

  // 8. Create order items
  const { error: itemsErr } = await supabase.from('order_items').insert(
    lines.map((l) => ({
      tenant_id: tenant.id,
      order_id: order.id,
      product_id: l.product.id,
      product_name: l.product.name_ar ?? l.product.name,
      quantity: l.quantity,
      unit_price_iqd: l.unitPrice,
      total_price_iqd: l.total,
    }))
  );

  if (itemsErr) return { error: 'تعذر إضافة عناصر الطلب' };

  // 9. Decrement stock (best-effort, race-safe via RPC in production)
  for (const l of lines) {
    await supabase.rpc('decrement_stock', {
      p_tenant_id: tenant.id,
      p_product_id: l.product.id,
      p_quantity: l.quantity,
    });
  }

  // 10. Payment flow
  if (input.paymentMethod === 'cod') {
    redirect(`/store/${slug}/order/${order.id}?new=1`);
  }

  // Electronic payment: create gateway session
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  try {
    const payment = await createPayment({
      gateway: input.paymentMethod,
      amount: total,
      orderId: order.id,
      description: `طلب ${order.order_number} من ${tenant.slug}`,
      callbackUrl: `${origin}/api/payments/callback`,
    });

    // Store payment intent info
    await supabase.from('audit_log').insert({
      tenant_id: tenant.id,
      action: 'payment.initiated',
      entity_type: 'order',
      entity_id: order.id,
      new_values: {
        gateway: input.paymentMethod,
        paymentId: payment.id,
        amount: total,
      },
    });

    if (payment.redirectUrl) {
      redirect(payment.redirectUrl);
    }

    // FIB: no redirect, show QR page
    redirect(`/store/${slug}/order/${order.id}/pay?paymentId=${payment.id}`);
  } catch (err) {
    // Order remains pending — merchant can collect manually
    await supabase
      .from('orders')
      .update({ status: 'pending' })
      .eq('id', order.id);

    return { error: 'تعذر بدء عملية الدفع، حاول مرة أخرى أو اختر الدفع عند الاستلام' };
  }
}
