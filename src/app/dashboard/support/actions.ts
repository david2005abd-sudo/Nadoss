'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  createTicketSchema,
  ticketReplySchema,
  ticketStatusUpdateSchema,
  computeSlaDueAt,
} from '@/lib/validations/support';

export interface TicketActionState {
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
  return {
    supabase,
    tenantId: membership.tenant_id,
    role: membership.role,
    userId: user.id,
  };
}

// ============================================
// Create ticket
// ============================================

export async function createTicketAction(
  _prev: TicketActionState,
  formData: FormData
): Promise<TicketActionState> {
  const raw = {
    subject: formData.get('subject'),
    description: formData.get('description'),
    category: formData.get('category'),
    priority: formData.get('priority') ?? 'medium',
    relatedOrderId: formData.get('relatedOrderId') ?? '',
  };

  const parsed = createTicketSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  }
  const data = parsed.data;

  const { supabase, tenantId, userId } = await getCtx();

  const slaDueAt = computeSlaDueAt(data.priority);

  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      subject: data.subject,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: 'open',
      sla_due_at: slaDueAt,
      related_order_id: data.relatedOrderId || null,
      last_activity_at: new Date().toISOString(),
    })
    .select('id, ticket_number')
    .single();

  if (error || !ticket) {
    return { error: 'تعذر إنشاء التذكرة' };
  }

  // Add first message (the description)
  await supabase.from('ticket_messages').insert({
    tenant_id: tenantId,
    ticket_id: ticket.id,
    sender_id: userId,
    sender_type: 'staff',
    content: data.description,
    content_type: 'text',
  });

  await supabase.from('audit_log').insert({
    tenant_id: tenantId,
    user_id: userId,
    action: 'ticket.created',
    entity_type: 'support_ticket',
    entity_id: ticket.id,
    new_values: {
      subject: data.subject,
      category: data.category,
      priority: data.priority,
    },
  });

  revalidatePath('/dashboard/support');
  redirect(`/dashboard/support/${ticket.id}`);
}

// ============================================
// Reply to ticket
// ============================================

export async function replyTicketAction(
  _prev: TicketActionState,
  formData: FormData
): Promise<TicketActionState> {
  const raw = {
    ticketId: formData.get('ticketId'),
    content: formData.get('content'),
    isInternal: formData.get('isInternal') === 'on',
  };

  const parsed = ticketReplySchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  }

  const { supabase, tenantId, userId, role } = await getCtx();
  const isStaff = ['owner', 'admin', 'staff'].includes(role);

  // Internal notes only for staff
  const isInternal = isStaff && parsed.data.isInternal;

  const { error } = await supabase.from('ticket_messages').insert({
    tenant_id: tenantId,
    ticket_id: parsed.data.ticketId,
    sender_id: userId,
    sender_type: isStaff ? 'staff' : 'customer',
    content: parsed.data.content,
    content_type: 'text',
    is_internal: isInternal,
  });

  if (error) return { error: 'تعذر إرسال الرد' };

  revalidatePath(`/dashboard/support/${parsed.data.ticketId}`);
  return { success: 'تم إرسال الرد' };
}

// ============================================
// Update ticket status
// ============================================

export async function updateTicketStatusAction(
  _prev: TicketActionState,
  formData: FormData
): Promise<TicketActionState> {
  const raw = {
    ticketId: formData.get('ticketId'),
    newStatus: formData.get('newStatus'),
    note: formData.get('note') ?? '',
  };

  const parsed = ticketStatusUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  }

  const { supabase, tenantId, userId } = await getCtx();

  const update: Record<string, unknown> = {
    status: parsed.data.newStatus,
  };
  if (parsed.data.newStatus === 'resolved') {
    update.resolved_at = new Date().toISOString();
  }
  if (parsed.data.newStatus === 'closed') {
    update.closed_by = userId;
  }

  const { error } = await supabase
    .from('support_tickets')
    .update(update)
    .eq('id', parsed.data.ticketId)
    .eq('tenant_id', tenantId);

  if (error) return { error: 'تعذر تحديث حالة التذكرة' };

  // System message in thread
  if (parsed.data.note) {
    await supabase.from('ticket_messages').insert({
      tenant_id: tenantId,
      ticket_id: parsed.data.ticketId,
      sender_type: 'system',
      content: parsed.data.note,
      content_type: 'system_event',
    });
  }

  revalidatePath('/dashboard/support');
  revalidatePath(`/dashboard/support/${parsed.data.ticketId}`);
  return { success: 'تم تحديث الحالة' };
}

// ============================================
// Assign ticket
// ============================================

export async function assignTicketAction(
  ticketId: string,
  assigneeId: string | null
): Promise<TicketActionState> {
  const { supabase, tenantId } = await getCtx();

  const { error } = await supabase
    .from('support_tickets')
    .update({ assigned_to: assigneeId })
    .eq('id', ticketId)
    .eq('tenant_id', tenantId);

  if (error) return { error: 'تعذر تعيين التذكرة' };
  revalidatePath(`/dashboard/support/${ticketId}`);
  return { success: 'تم تعيين التذكرة' };
}

// ============================================
// Delete ticket (soft — set status closed + archived)
// ============================================

export async function deleteTicketAction(ticketId: string): Promise<TicketActionState> {
  const { supabase, tenantId, role } = await getCtx();
  if (role !== 'owner') return { error: 'صلاحيات غير كافية' };

  const { error } = await supabase
    .from('support_tickets')
    .update({ status: 'closed', closed_by: (await supabase.auth.getUser()).data.user?.id })
    .eq('id', ticketId)
    .eq('tenant_id', tenantId);

  if (error) return { error: 'تعذر حذف التذكرة' };
  revalidatePath('/dashboard/support');
  return { success: 'تم إغلاق التذكرة' };
}
