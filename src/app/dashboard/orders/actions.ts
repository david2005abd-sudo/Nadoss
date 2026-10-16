'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { orderStatusSchema, ORDER_STATUS_TRANSITIONS, manualOrderSchema } from '@/lib/validations/order';

export interface OrderActionState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
}

function toFieldErrors(errors: Record<string, string[] | undefined>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(errors)) if (v && v.length) out[k] = v;
  return out;
}

async function getCtx() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!membership) redirect('/login');
  return { supabase, tenantId: membership.tenant_id, role: membership.role, userId: user.id };
}

export async function updateOrderStatusAction(
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const raw = {
    orderId: formData.get('orderId'),
    newStatus: formData.get('newStatus'),
    note: formData.get('note') ?? '',
  };

  const parsed = orderStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  }

  const { orderId, newStatus, note } = parsed.data;
  const { supabase, tenantId, userId } = await getCtx();

  // Fetch current order
  const { data: order } = await supabase
    .from('orders')
    .select('id, status, payment_status, payment_method')
    .eq('id', orderId)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (!order) return { error: 'الطلب غير موجود' };

  // Validate transition
  const allowed = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return { error: `لا يمكن الانتقال من "${order.status}" إلى "${newStatus}"` };
  }

  // Prepare update
  const update: Record<string, unknown> = { status: newStatus };

  // Business rules
  if (newStatus === 'delivered' && order.payment_method === 'cod') {
    update.payment_status = 'paid';
  }
  if (newStatus === 'cancelled' && order.payment_status === 'paid') {
    update.payment_status = 'refunded';
  }

  const { error } = await supabase
    .from('orders')
    .update(update)
    .eq('id', orderId)
    .eq('tenant_id', tenantId);

  if (error) return { error: 'تعذر تحديث حالة الطلب' };

  await supabase.from('audit_log').insert({
    tenant_id: tenantId,
    user_id: userId,
    action: `order.status.${newStatus}`,
    entity_type: 'order',
    entity_id: orderId,
    old_values: { status: order.status, payment_status: order.payment_status },
    new_values: { status: newStatus, payment_status: update.payment_status ?? order.payment_status, note: note || null },
  });

  revalidatePath('/dashboard/orders');
  revalidatePath(`/dashboard/orders/${orderId}`);
  return { success: 'تم تحديث حالة الطلب' };
}

export async function createManualOrderAction(
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const itemsJson = formData.get('items');
  let items: unknown = [];
  try {
    items = JSON.parse(String(itemsJson ?? '[]'));
  } catch {
    return { error: 'بيانات العناصر غير صالحة' };
  }

  const raw = {
    customerName: formData.get('customerName'),
    customerPhone: formData.get('customerPhone'),
    governorateId: formData.get('governorateId'),
    city: formData.get('city'),
    address: formData.get('address'),
    notes: formData.get('notes') ?? '',
    paymentMethod: formData.get('paymentMethod'),
    items,
  };

  const parsed = manualOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  }

  const data = parsed.data;
  const { supabase, tenantId, userId } = await getCtx();

  // Fetch product prices
  const productIds = data.items.map((i) => i.productId);
  const { data: products } = await supabase
    .from('products')
    .select('id, name_ar, name, price_iqd, stock, is_active, deleted_at')
    .in('id', productIds)
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .is('deleted_at', null);

  if (!products || products.length === 0) return { error: 'لم يتم العثور على منتجات صالحة' };

  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = data.items.map((line) => {
    const p = byId.get(line.productId);
    if (!p) throw new Error('PRODUCT_NOT_FOUND');
    return {
      product: p,
      quantity: line.quantity,
      unitPrice: p.price_iqd,
      total: p.price_iqd * line.quantity,
    };
  });

  const { data: gov } = await supabase
    .from('iraq_governorates')
    .select('id, delivery_fee_iqd')
    .eq('id', data.governorateId)
    .maybeSingle();

  if (!gov) return { error: 'المحافظة غير صالحة' };

  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const deliveryFee = gov.delivery_fee_iqd ?? 0;
  const total = subtotal + deliveryFee;

  // Upsert customer
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('phone', data.customerPhone)
    .is('deleted_at', null)
    .maybeSingle();

  let customerId: string;
  if (existing) {
    customerId = existing.id;
    await supabase
      .from('customers')
      .update({
        name: data.customerName,
        governorate_id: data.governorateId,
        city: data.city,
        address: data.address,
      })
      .eq('id', customerId);
  } else {
    const { data: c } = await supabase
      .from('customers')
      .insert({
        tenant_id: tenantId,
        name: data.customerName,
        phone: data.customerPhone,
        governorate_id: data.governorateId,
        city: data.city,
        address: data.address,
      })
      .select('id')
      .single();
    if (!c) return { error: 'تعذر إنشاء العميل' };
    customerId = c.id;
  }

  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      tenant_id: tenantId,
      customer_id: customerId,
      order_number: orderNumber,
      status: 'confirmed',
      payment_method: data.paymentMethod,
      payment_status: 'pending',
      subtotal_iqd: subtotal,
      delivery_fee_iqd: deliveryFee,
      total_iqd: total,
      governorate_id: data.governorateId,
      city: data.city,
      address: data.address,
      notes: data.notes || null,
      source: 'manual',
    })
    .select('id')
    .single();

  if (error || !order) return { error: 'تعذر إنشاء الطلب' };

  await supabase.from('order_items').insert(
    lines.map((l) => ({
      tenant_id: tenantId,
      order_id: order.id,
      product_id: l.product.id,
      product_name: l.product.name_ar ?? l.product.name,
      quantity: l.quantity,
      unit_price_iqd: l.unitPrice,
      total_price_iqd: l.total,
    }))
  );

  // Decrement stock
  for (const l of lines) {
    await supabase.rpc('decrement_stock', {
      p_tenant_id: tenantId,
      p_product_id: l.product.id,
      p_quantity: l.quantity,
    });
  }

  await supabase.from('audit_log').insert({
    tenant_id: tenantId,
    user_id: userId,
    action: 'order.created.manual',
    entity_type: 'order',
    entity_id: order.id,
    new_values: { order_number: orderNumber, total },
  });

  revalidatePath('/dashboard/orders');
  redirect(`/dashboard/orders/${order.id}`);
}
