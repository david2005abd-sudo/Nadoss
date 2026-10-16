import { z } from 'zod';

export const TICKET_CATEGORIES = [
  'general',
  'billing',
  'technical',
  'delivery',
  'order',
  'product',
  'account',
  'feature_request',
] as const;

export const TICKET_CATEGORY_LABELS: Record<string, string> = {
  general: 'عام',
  billing: 'الاشتراك والفواتير',
  technical: 'مشكلة تقنية',
  delivery: 'التوصيل',
  order: 'الطلب',
  product: 'المنتج',
  account: 'الحساب',
  feature_request: 'طلب ميزة',
};

export const TICKET_STATUS_LABELS: Record<string, string> = {
  open: 'مفتوحة',
  in_progress: 'قيد المعالجة',
  waiting: 'بانتظار العميل',
  resolved: 'تم الحل',
  closed: 'مغلقة',
};

export const TICKET_PRIORITY_LABELS: Record<string, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  urgent: 'عاجلة',
};

export const createTicketSchema = z.object({
  subject: z.string().min(5, 'الموضوع قصير جدًا').max(200),
  description: z.string().min(20, 'الوصف قصير جدًا — اشرح المشكلة بتفصيل').max(5000),
  category: z.enum(TICKET_CATEGORIES),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  relatedOrderId: z.string().uuid().optional().or(z.literal('')),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const ticketReplySchema = z.object({
  ticketId: z.string().uuid(),
  content: z.string().min(1, 'الرسالة فارغة').max(5000),
  isInternal: z.coerce.boolean().default(false),
});

export type TicketReplyInput = z.infer<typeof ticketReplySchema>;

export const ticketStatusUpdateSchema = z.object({
  ticketId: z.string().uuid(),
  newStatus: z.enum(['open', 'in_progress', 'waiting', 'resolved', 'closed']),
  note: z.string().max(500).optional(),
});

// SLA targets by priority (in hours)
export const SLA_TARGETS_HOURS: Record<string, number> = {
  urgent: 2,
  high: 8,
  medium: 24,
  low: 72,
};

export function computeSlaDueAt(priority: string, from: Date = new Date()): string {
  const hours = SLA_TARGETS_HOURS[priority] ?? 24;
  return new Date(from.getTime() + hours * 60 * 60 * 1000).toISOString();
}
