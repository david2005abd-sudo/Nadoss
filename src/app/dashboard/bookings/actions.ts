'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import {
  serviceCategorySchema,
  staffMemberSchema,
  bookingSchema,
  bookingStatusUpdateSchema,
  rescheduleBookingSchema,
  BOOKING_STATUS_TRANSITIONS,
} from '@/lib/validations/booking';
import { sendWhatsAppMessage } from '@/lib/whatsapp/sender';

export interface BookingActionState {
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

// ============================================
// Service Categories
// ============================================

export async function createServiceCategoryAction(
  _prev: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const raw = {
    nameAr: formData.get('nameAr'),
    nameEn: formData.get('nameEn') ?? '',
    slug: formData.get('slug'),
    durationMinutes: formData.get('durationMinutes') ?? 30,
    priceIqd: formData.get('priceIqd') ?? 0,
    color: formData.get('color') ?? '#1a56db',
    isActive: formData.get('isActive') === 'on',
  };

  const parsed = serviceCategorySchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };

  const { supabase, tenantId } = await getCtx();
  const d = parsed.data;

  const { error } = await supabase.from('service_categories').insert({
    tenant_id: tenantId,
    name_ar: d.nameAr,
    name_en: d.nameEn || null,
    slug: d.slug,
    duration_minutes: d.durationMinutes,
    price_iqd: d.priceIqd,
    color: d.color,
    is_active: d.isActive,
  });

  if (error) {
    if (error.code === '23505') return { error: 'يوجد تصنيف بنفس الرابط' };
    return { error: 'تعذر إنشاء التصنيف' };
  }

  revalidatePath('/dashboard/bookings/services');
  return { success: 'تم إنشاء التصنيف' };
}

export async function deleteServiceCategoryAction(id: string): Promise<BookingActionState> {
  const { supabase, tenantId } = await getCtx();
  const { error } = await supabase
    .from('service_categories')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id)
    .eq('tenant_id', tenantId);
  if (error) return { error: 'تعذر الحذف' };
  revalidatePath('/dashboard/bookings/services');
  return { success: 'تم الحذف' };
}

// ============================================
// Staff Members
// ============================================

export async function createStaffAction(
  _prev: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const raw = {
    name: formData.get('name'),
    phone: formData.get('phone') ?? '',
    role: formData.get('role') ?? '',
    isActive: formData.get('isActive') !== 'off',
  };

  const parsed = staffMemberSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };

  const { supabase, tenantId } = await getCtx();
  const d = parsed.data;

  const { error } = await supabase.from('staff_members').insert({
    tenant_id: tenantId,
    name: d.name,
    phone: d.phone || null,
    role: d.role || null,
    is_active: d.isActive,
  });

  if (error) return { error: 'تعذر إضافة الموظف' };
  revalidatePath('/dashboard/bookings/staff');
  return { success: 'تم إضافة الموظف' };
}

export async function deleteStaffAction(id: string): Promise<BookingActionState> {
  const { supabase, tenantId } = await getCtx();
  const { error } = await supabase
    .from('staff_members')
    .update({ is_active: false })
    .eq('id', id)
    .eq('tenant_id', tenantId);
  if (error) return { error: 'تعذر الحذف' };
  revalidatePath('/dashboard/bookings/staff');
  return { success: 'تم التعطيل' };
}

// ============================================
// Bookings
// ============================================

export async function createBookingAction(
  _prev: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const raw = {
    customerName: formData.get('customerName'),
    customerPhone: formData.get('customerPhone'),
    serviceId: formData.get('serviceId'),
    staffId: formData.get('staffId') ?? '',
    scheduledAt: formData.get('scheduledAt'),
    durationMinutes: formData.get('durationMinutes') || undefined,
    notes: formData.get('notes') ?? '',
    source: formData.get('source') ?? 'admin',
  };

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };

  const { supabase, tenantId, userId } = await getCtx();
  const d = parsed.data;

  // Fetch service to inherit duration if not provided
  const { data: service } = await supabase
    .from('service_categories')
    .select('id, duration_minutes, price_iqd, name_ar')
    .eq('id', d.serviceId)
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle();

  if (!service) return { error: 'الخدمة غير متاحة' };

  const duration = d.durationMinutes ?? service.duration_minutes;

  // Check availability
  if (d.staffId) {
    const { data: available } = await supabase.rpc('check_booking_availability', {
      p_tenant_id: tenantId,
      p_staff_id: d.staffId,
      p_scheduled_at: d.scheduledAt,
      p_duration_minutes: duration,
    });
    if (available === false) {
      return { error: 'الفترة الزمنية غير متاحة — الموظف مشغول' };
    }
  }

  // Upsert customer
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('phone', d.customerPhone)
    .is('deleted_at', null)
    .maybeSingle();

  let customerId: string;
  if (existingCustomer) {
    customerId = existingCustomer.id;
    await supabase
      .from('customers')
      .update({ name: d.customerName })
      .eq('id', customerId);
  } else {
    const { data: c } = await supabase
      .from('customers')
      .insert({
        tenant_id: tenantId,
        name: d.customerName,
        phone: d.customerPhone,
      })
      .select('id')
      .single();
    if (!c) return { error: 'تعذر إنشاء العميل' };
    customerId = c.id;
  }

  const bookingNumber = `BK-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      tenant_id: tenantId,
      booking_number: bookingNumber,
      customer_id: customerId,
      service_id: service.id,
      staff_id: d.staffId || null,
      customer_name: d.customerName,
      customer_phone: d.customerPhone,
      scheduled_at: d.scheduledAt,
      duration_minutes: duration,
      status: 'confirmed',
      notes: d.notes || null,
      price_iqd: service.price_iqd,
      source: d.source,
    })
    .select('id')
    .single();

  if (error || !booking) return { error: 'تعذر إنشاء الحجز' };

  await supabase.from('audit_log').insert({
    tenant_id: tenantId,
    user_id: userId,
    action: 'booking.created',
    entity_type: 'booking',
    entity_id: booking.id,
    new_values: {
      booking_number: bookingNumber,
      service: service.name_ar,
      scheduled_at: d.scheduledAt,
    },
  });

  revalidatePath('/dashboard/bookings');
  redirect(`/dashboard/bookings/${booking.id}`);
}

export async function updateBookingStatusAction(
  _prev: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const raw = {
    bookingId: formData.get('bookingId'),
    newStatus: formData.get('newStatus'),
    note: formData.get('note') ?? '',
  };

  const parsed = bookingStatusUpdateSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };

  const { supabase, tenantId, userId } = await getCtx();

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, booking_number, customer_name, customer_phone, scheduled_at')
    .eq('id', parsed.data.bookingId)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (!booking) return { error: 'الحجز غير موجود' };

  const allowed = BOOKING_STATUS_TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(parsed.data.newStatus)) {
    return { error: `لا يمكن الانتقال من "${booking.status}" إلى "${parsed.data.newStatus}"` };
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: parsed.data.newStatus })
    .eq('id', booking.id)
    .eq('tenant_id', tenantId);

  if (error) return { error: 'تعذر التحديث' };

  await supabase.from('audit_log').insert({
    tenant_id: tenantId,
    user_id: userId,
    action: `booking.status.${parsed.data.newStatus}`,
    entity_type: 'booking',
    entity_id: booking.id,
    old_values: { status: booking.status },
    new_values: { status: parsed.data.newStatus, note: parsed.data.note || null },
  });

  revalidatePath('/dashboard/bookings');
  revalidatePath(`/dashboard/bookings/${booking.id}`);
  return { success: 'تم تحديث الحالة' };
}

export async function rescheduleBookingAction(
  _prev: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const raw = {
    bookingId: formData.get('bookingId'),
    scheduledAt: formData.get('scheduledAt'),
    durationMinutes: formData.get('durationMinutes') || undefined,
  };

  const parsed = rescheduleBookingSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };

  const { supabase, tenantId } = await getCtx();

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, staff_id, duration_minutes')
    .eq('id', parsed.data.bookingId)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (!booking) return { error: 'الحجز غير موجود' };

  const duration = parsed.data.durationMinutes ?? booking.duration_minutes;

  if (booking.staff_id) {
    const { data: available } = await supabase.rpc('check_booking_availability', {
      p_tenant_id: tenantId,
      p_staff_id: booking.staff_id,
      p_scheduled_at: parsed.data.scheduledAt,
      p_duration_minutes: duration,
    });
    if (available === false) {
      return { error: 'الفترة الجديدة غير متاحة' };
    }
  }

  const { error } = await supabase
    .from('bookings')
    .update({
      scheduled_at: parsed.data.scheduledAt,
      duration_minutes: duration,
    })
    .eq('id', booking.id)
    .eq('tenant_id', tenantId);

  if (error) return { error: 'تعذر إعادة الجدولة' };

  revalidatePath(`/dashboard/bookings/${booking.id}`);
  return { success: 'تم إعادة الجدولة' };
}

export async function deleteBookingAction(id: string): Promise<BookingActionState> {
  const { supabase, tenantId, role } = await getCtx();
  if (role !== 'owner' && role !== 'admin') return { error: 'صلاحيات غير كافية' };

  const { error } = await supabase
    .from('bookings')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) return { error: 'تعذر الحذف' };
  revalidatePath('/dashboard/bookings');
  return { success: 'تم الحذف' };
}

// ============================================
// Public booking action (no auth)
// ============================================
export async function createPublicBookingAction(
  _prev: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const tenantSlug = String(formData.get('tenantSlug') ?? '');
  const raw = {
    customerName: formData.get('customerName'),
    customerPhone: formData.get('customerPhone'),
    serviceId: formData.get('serviceId'),
    staffId: formData.get('staffId') ?? '',
    scheduledAt: formData.get('scheduledAt'),
    notes: formData.get('notes') ?? '',
    source: 'web' as const,
  };

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  const d = parsed.data;

  const supabase = createAdminClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, slug, phone')
    .eq('slug', tenantSlug)
    .eq('is_active', true)
    .maybeSingle();

  if (!tenant) return { error: 'المتجر غير موجود' };

  const { data: service } = await supabase
    .from('service_categories')
    .select('id, duration_minutes, price_iqd, name_ar')
    .eq('id', d.serviceId)
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle();

  if (!service) return { error: 'الخدمة غير متاحة' };

  // If a staff member was selected, ensure it belongs to this active tenant.
  if (d.staffId) {
    const { data: selectedStaff } = await supabase
      .from('staff_members')
      .select('id')
      .eq('id', d.staffId)
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!selectedStaff) return { error: 'الموظف المحدد غير متاح' };

    const { data: available } = await supabase.rpc('check_booking_availability', {
      p_tenant_id: tenant.id,
      p_staff_id: d.staffId,
      p_scheduled_at: d.scheduledAt,
      p_duration_minutes: service.duration_minutes,
    });
    if (available === false) return { error: 'الفترة المختارة غير متاحة' };
  }

  // Upsert customer
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('tenant_id', tenant.id)
    .eq('phone', d.customerPhone)
    .is('deleted_at', null)
    .maybeSingle();

  let customerId: string;
  if (existingCustomer) {
    customerId = existingCustomer.id;
    await supabase.from('customers').update({ name: d.customerName }).eq('id', customerId);
  } else {
    const { data: c } = await supabase
      .from('customers')
      .insert({
        tenant_id: tenant.id,
        name: d.customerName,
        phone: d.customerPhone,
      })
      .select('id')
      .single();
    if (!c) return { error: 'تعذر تسجيل بياناتك' };
    customerId = c.id;
  }

  const bookingNumber = `BK-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      tenant_id: tenant.id,
      booking_number: bookingNumber,
      customer_id: customerId,
      service_id: service.id,
      staff_id: d.staffId || null,
      customer_name: d.customerName,
      customer_phone: d.customerPhone,
      scheduled_at: d.scheduledAt,
      duration_minutes: service.duration_minutes,
      status: 'pending',
      notes: d.notes || null,
      price_iqd: service.price_iqd,
      source: 'web',
    })
    .select('id, booking_number')
    .single();

  if (error || !booking) return { error: 'تعذر إنشاء الحجز' };

  // Notify merchant via WhatsApp if phone is set
  if (tenant.phone) {
    await sendWhatsAppMessage({
      to: tenant.phone,
      body:
        `🔔 حجز جديد عبر الويب\n\n` +
        `الرقم: ${booking.booking_number}\n` +
        `العميل: ${d.customerName} (${d.customerPhone})\n` +
        `الخدمة: ${service.name_ar}\n` +
        `الموعد: ${new Date(d.scheduledAt).toLocaleString('ar-IQ')}`,
    }).catch(() => {});
  }

  revalidatePath(`/store/${tenantSlug}/book`);
  redirect(`/store/${tenantSlug}/book/success?number=${booking.booking_number}`);
}
