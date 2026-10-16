'use server';

import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
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

interface CreatedOrder {
  id: string;
  order_number: string;
  total_iqd: number;
  tenant_id: string;
  tenant_slug: string;
}

export async function placeOrderAction(
  _prev: CheckoutState,
  { slug, formData, cartItems }: ActionInput
): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse({
    customerName: String(formData.get('customerName') ?? ''),
    customerPhone: String(formData.get('customerPhone') ?? ''),
    governorateId: formData.get('governorateId'),
    city: String(formData.get('city') ?? ''),
    address: String(formData.get('address') ?? ''),
    notes: String(formData.get('notes') ?? ''),
    paymentMethod: String(formData.get('paymentMethod') ?? 'cod'),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(flat)) {
      if (value?.length) fieldErrors[key] = value;
    }
    return { fieldErrors };
  }

  const cartParsed = cartPayloadSchema.safeParse(cartItems);
  if (!cartParsed.success) {
    return { error: 'السلة فارغة أو غير صالحة' };
  }

  // This database function validates the store, authoritative prices, governorate,
  // stock and customer data, then creates the customer/order/items and reserves
  // inventory atomically. Client-provided prices are never accepted.
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('create_store_order', {
    p_slug: slug,
    p_customer_name: parsed.data.customerName,
    p_customer_phone: parsed.data.customerPhone,
    p_governorate_id: parsed.data.governorateId,
    p_city: parsed.data.city,
    p_address: parsed.data.address,
    p_notes: parsed.data.notes || null,
    p_payment_method: parsed.data.paymentMethod,
    p_items: cartParsed.data,
  });

  if (error || !data) {
    const message = error?.message ?? '';
    if (message.includes('INSUFFICIENT_STOCK')) {
      return { error: 'إحدى المنتجات لم تعد متوفرة بالكمية المطلوبة. حدّث السلة وحاول مجددًا.' };
    }
    if (message.includes('PRODUCT_NOT_FOUND')) {
      return { error: 'أحد المنتجات لم يعد متاحًا في هذا المتجر.' };
    }
    if (message.includes('INVALID_GOVERNORATE')) {
      return { error: 'المحافظة غير صالحة أو غير متاحة للتوصيل.' };
    }
    if (message.includes('STORE_NOT_FOUND')) {
      return { error: 'المتجر غير موجود أو غير نشط.' };
    }
    if (message.includes('INVALID_CUSTOMER_DETAILS')) {
      return { error: 'تحقق من بيانات العميل والعنوان ورقم الهاتف.' };
    }
    return { error: 'تعذر إنشاء الطلب. تحقق من البيانات وحاول مرة أخرى.' };
  }

  const order = data as unknown as CreatedOrder;
  if (!order.id || !order.order_number || !Number.isFinite(Number(order.total_iqd))) {
    return { error: 'تعذر تأكيد الطلب. حاول مرة أخرى.' };
  }

  if (parsed.data.paymentMethod === 'cod') {
    redirect(`/store/${slug}/order/${order.id}?new=1`);
  }

  // Do not put redirect() inside the try/catch: Next.js implements redirect by throwing.
  let payment;
  try {
    payment = await createPayment({
      gateway: parsed.data.paymentMethod,
      amount: Number(order.total_iqd),
      orderId: order.id,
      description: `طلب ${order.order_number} من ${order.tenant_slug}`,
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/payments/callback`,
    });
  } catch {
    // The order remains pending for reconciliation; no client-supplied status is trusted.
    return { error: 'تعذر بدء عملية الدفع. لم يتم تأكيد الدفع؛ اختر طريقة أخرى أو تواصل مع المتجر.' };
  }

  // Audit is server-only and must not block a valid payment redirect.
  try {
    await createAdminClient().from('audit_log').insert({
      tenant_id: order.tenant_id,
      action: 'payment.initiated',
      entity_type: 'order',
      entity_id: order.id,
      new_values: {
        gateway: parsed.data.paymentMethod,
        paymentId: payment.id,
        amount: Number(order.total_iqd),
      },
    });
  } catch {
    // Payment creation succeeded; audit availability is monitored separately.
  }

  if (payment.redirectUrl) {
    redirect(payment.redirectUrl);
  }

  // FIB: no redirect, show QR page.
  redirect(`/store/${slug}/order/${order.id}/pay?paymentId=${encodeURIComponent(payment.id)}`);
}
