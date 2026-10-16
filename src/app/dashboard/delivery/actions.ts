'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdapter } from '@/lib/delivery/registry';
import { encryptCredentials, decryptCredentials } from '@/lib/delivery/credentials';
import { deliveryAccountSchema, createShipmentSchema } from '@/lib/validations/delivery';

export interface DeliveryActionState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
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
  return {
    supabase,
    tenantId: membership.tenant_id,
    role: membership.role,
    userId: user.id,
  };
}

function toFieldErrors(errors: Record<string, string[] | undefined>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(errors)) if (v && v.length) out[k] = v;
  return out;
}

// ============================================
// Account management
// ============================================

export async function saveDeliveryAccountAction(
  _prev: DeliveryActionState,
  formData: FormData
): Promise<DeliveryActionState> {
  const { supabase, tenantId, userId, role } = await getCtx();
  if (role !== 'owner' && role !== 'admin') {
    return { error: 'ليس لديك صلاحية لإدارة حسابات التوصيل' };
  }

  const companyId = Number(formData.get('deliveryCompanyId'));
  const slug = String(formData.get('slug') ?? '');

  const adapter = getAdapter(slug);
  if (!adapter) return { error: 'شركة التوصيل غير مدعومة' };

  // Collect credential fields (all keys starting with cred_)
  const credentials: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('cred_') && typeof value === 'string') {
      credentials[key.replace('cred_', '')] = value.trim();
    }
  }

  if (Object.keys(credentials).length === 0) {
    return { error: 'يرجى إدخال بيانات الاعتماد' };
  }

  // Test connection first
  const test = await adapter.testConnection(credentials);
  if (!test.ok) {
    return { error: `فشل الاتصال: ${test.error ?? 'تحقق من البيانات'}` };
  }

  const encrypted = encryptCredentials(credentials);
  const isDefault = formData.get('isDefault') === 'on';

  if (isDefault) {
    await supabase
      .from('tenant_delivery_accounts')
      .update({ is_default: false })
      .eq('tenant_id', tenantId);
  }

  const { error } = await supabase
    .from('tenant_delivery_accounts')
    .upsert(
      {
        tenant_id: tenantId,
        delivery_company_id: companyId,
        credentials_encrypted: encrypted,
        is_default: isDefault,
        is_active: true,
      },
      { onConflict: 'tenant_id,delivery_company_id' }
    );

  if (error) return { error: 'تعذر حفظ الحساب' };

  await supabase.from('audit_log').insert({
    tenant_id: tenantId,
    user_id: userId,
    action: 'delivery.account.saved',
    entity_type: 'delivery_company',
    entity_id: null,
    new_values: { companySlug: slug, isDefault },
  });

  revalidatePath('/dashboard/delivery');
  return { success: 'تم حفظ بيانات الحساب بنجاح' };
}

export async function toggleDeliveryAccountAction(
  accountId: string,
  isActive: boolean
): Promise<{ error?: string }> {
  const { supabase, tenantId } = await getCtx();
  const { error } = await supabase
    .from('tenant_delivery_accounts')
    .update({ is_active: isActive })
    .eq('id', accountId)
    .eq('tenant_id', tenantId);
  if (error) return { error: 'تعذر التحديث' };
  revalidatePath('/dashboard/delivery');
  return {};
}

export async function deleteDeliveryAccountAction(accountId: string): Promise<{ error?: string }> {
  const { supabase, tenantId, role } = await getCtx();
  if (role !== 'owner') return { error: 'فقط المالك يمكنه حذف الحسابات' };

  const { error } = await supabase
    .from('tenant_delivery_accounts')
    .delete()
    .eq('id', accountId)
    .eq('tenant_id', tenantId);

  if (error) return { error: 'تعذر الحذف' };
  revalidatePath('/dashboard/delivery');
  return {};
}

// ============================================
// Shipment creation
// ============================================

export async function createShipmentAction(
  _prev: DeliveryActionState,
  formData: FormData
): Promise<DeliveryActionState> {
  const raw = {
    orderId: formData.get('orderId'),
    deliveryCompanySlug: formData.get('deliveryCompanySlug'),
    isPickup: formData.get('isPickup') === 'on',
    notes: formData.get('notes') ?? '',
  };

  const parsed = createShipmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  }

  const { orderId, deliveryCompanySlug, isPickup, notes } = parsed.data;
  const { supabase, tenantId, userId } = await getCtx();

  // Resolve adapter
  const adapter = getAdapter(deliveryCompanySlug);
  if (!adapter) return { error: 'شركة التوصيل غير مدعومة' };

  // Fetch delivery account with credentials
  const { data: company } = await supabase
    .from('delivery_companies')
    .select('id, name_ar')
    .eq('slug', deliveryCompanySlug)
    .maybeSingle();

  if (!company) return { error: 'شركة التوصيل غير مسجلة' };

  const { data: account } = await supabase
    .from('tenant_delivery_accounts')
    .select('credentials_encrypted, is_active')
    .eq('tenant_id', tenantId)
    .eq('delivery_company_id', company.id)
    .maybeSingle();

  if (!account || !account.is_active) {
    return { error: 'لم تقم بإعداد حساب هذه الشركة بعد' };
  }

  const credentials = decryptCredentials(account.credentials_encrypted);

  // Fetch order + items + customer
  const { data: order } = await supabase
    .from('orders')
    .select(
      `id, order_number, total_iqd, payment_method, payment_status,
       city, address, notes,
       customers(name, phone),
       iraq_governorates(id, name_ar),
       order_items(product_name, quantity, unit_price_iqd)`
    )
    .eq('id', orderId)
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!order) return { error: 'الطلب غير موجود' };

  const customer = order.customers as unknown as { name: string | null; phone: string } | null;
  const gov = order.iraq_governorates as unknown as { id: number; name_ar: string } | null;
  const items = (order.order_items as unknown as {
    product_name: string;
    quantity: number;
    unit_price_iqd: number;
  }[]) ?? [];

  if (!customer || !gov) return { error: 'بيانات الطلب غير مكتملة' };

  try {
    const result = await adapter.createShipment(
      {
        orderId: order.id,
        orderNumber: order.order_number,
        recipient: {
          name: customer.name ?? 'عميل',
          phone: customer.phone,
          governorateId: gov.id,
          governorateName: gov.name_ar,
          city: order.city,
          address: order.address,
        },
        items: items.map((i) => ({
          name: i.product_name,
          quantity: i.quantity,
          unitPriceIqd: i.unit_price_iqd,
        })),
        codAmountIqd: order.payment_method === 'cod' ? order.total_iqd : 0,
        notes: notes || order.notes || '',
        isPickup,
      },
      credentials
    );

    // Save shipment record
    const { data: shipment, error: shErr } = await supabase
      .from('shipments')
      .insert({
        tenant_id: tenantId,
        order_id: order.id,
        delivery_company_id: company.id,
        tracking_number: result.trackingNumber,
        external_id: result.externalId,
        status: result.status,
        cod_amount_iqd: order.payment_method === 'cod' ? order.total_iqd : null,
        recipient_name: customer.name,
        recipient_phone: customer.phone,
        governorate_id: gov.id,
        address: order.address,
        notes: notes || null,
        raw_response: result.rawResponse as never,
      })
      .select('id')
      .single();

    if (shErr || !shipment) {
      return { error: 'تم إنشاء الشحنة لكن فشل حفظها محليًا' };
    }

    // Move order to 'shipped' if currently 'ready' or 'confirmed'
    if (order.payment_status !== 'cancelled') {
      await supabase
        .from('orders')
        .update({ status: 'shipped' })
        .eq('id', order.id)
        .eq('tenant_id', tenantId);
    }

    await supabase.from('audit_log').insert({
      tenant_id: tenantId,
      user_id: userId,
      action: 'shipment.created',
      entity_type: 'shipment',
      entity_id: shipment.id,
      new_values: {
        orderNumber: order.order_number,
        provider: deliveryCompanySlug,
        trackingNumber: result.trackingNumber,
      },
    });

    revalidatePath(`/dashboard/orders/${order.id}`);
    revalidatePath('/dashboard/delivery');
    return { success: `تم إنشاء الشحنة — رقم التتبع: ${result.trackingNumber}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'فشل إنشاء الشحنة';
    return { error: msg };
  }
}

export async function refreshShipmentStatusAction(
  shipmentId: string
): Promise<{ error?: string; success?: string }> {
  const { supabase, tenantId } = await getCtx();

  const { data: shipment } = await supabase
    .from('shipments')
    .select('id, tracking_number, delivery_company_id, order_id')
    .eq('id', shipmentId)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (!shipment) return { error: 'الشحنة غير موجودة' };

  const { data: company } = await supabase
    .from('delivery_companies')
    .select('slug')
    .eq('id', shipment.delivery_company_id!)
    .maybeSingle();

  if (!company) return { error: 'شركة التوصيل غير معروفة' };

  const adapter = getAdapter(company.slug);
  if (!adapter) return { error: 'المحول غير مدعوم' };

  const { data: account } = await supabase
    .from('tenant_delivery_accounts')
    .select('credentials_encrypted')
    .eq('tenant_id', tenantId)
    .eq('delivery_company_id', shipment.delivery_company_id!)
    .maybeSingle();

  if (!account) return { error: 'بيانات الاعتماد غير متوفرة' };

  try {
    const credentials = decryptCredentials(account.credentials_encrypted);
    const tracking = await adapter.trackShipment(shipment.tracking_number!, credentials);

    await supabase
      .from('shipments')
      .update({
        status: tracking.status,
        raw_response: tracking as never,
      })
      .eq('id', shipmentId)
      .eq('tenant_id', tenantId);

    revalidatePath(`/dashboard/orders/${shipment.order_id}`);
    revalidatePath('/dashboard/delivery');
    return { success: `تم التحديث — الحالة: ${tracking.status}` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'فشل التحديث' };
  }
}
