import { z } from 'zod';
import { phoneSchema } from './auth';

export const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
] as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'بانتظار التأكيد',
  confirmed: 'مؤكد',
  in_progress: 'جارٍ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  no_show: 'لم يحضر',
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-indigo-50 text-indigo-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  no_show: 'bg-gray-100 text-gray-600',
};

export const BOOKING_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled', 'no_show'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  no_show: ['confirmed'], // rebook if customer shows up
};

// ============================================
// Service Categories
// ============================================
export const serviceCategorySchema = z.object({
  nameAr: z.string().min(2, 'الاسم قصير جدًا').max(100),
  nameEn: z.string().max(100).optional().or(z.literal('')),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'استخدم أحرف إنجليزية صغيرة وأرقام و- فقط'),
  durationMinutes: z.coerce.number().int().min(5, 'المدة 5 دقائق على الأقل').max(480),
  priceIqd: z.coerce.number().int().min(0).max(10_000_000),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'لون غير صالح').default('#1a56db'),
  isActive: z.coerce.boolean().default(true),
});

export type ServiceCategoryInput = z.infer<typeof serviceCategorySchema>;

// ============================================
// Staff Members
// ============================================
export const staffMemberSchema = z.object({
  name: z.string().min(2, 'الاسم قصير جدًا').max(100),
  phone: phoneSchema.optional().or(z.literal('')),
  role: z.string().max(100).optional().or(z.literal('')),
  isActive: z.coerce.boolean().default(true),
});

export type StaffMemberInput = z.infer<typeof staffMemberSchema>;

// ============================================
// Bookings
// ============================================
export const bookingSchema = z.object({
  customerName: z.string().min(2, 'الاسم قصير جدًا').max(100),
  customerPhone: phoneSchema,
  serviceId: z.string().uuid('اختر خدمة'),
  staffId: z.string().uuid().optional().or(z.literal('')),
  scheduledAt: z
    .string()
    .datetime({ message: 'تاريخ ووقت غير صالح' })
    .refine((v) => new Date(v).getTime() > Date.now() - 60_000, {
      message: 'لا يمكن حجز موعد في الماضي',
    }),
  durationMinutes: z.coerce.number().int().min(5).max(480).optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
  source: z.enum(['web', 'whatsapp', 'phone', 'walk_in', 'admin']).default('admin'),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const publicBookingSchema = bookingSchema.extend({
  source: z.literal('web').default('web'),
});

export const bookingStatusUpdateSchema = z.object({
  bookingId: z.string().uuid(),
  newStatus: z.enum(BOOKING_STATUSES),
  note: z.string().max(500).optional().or(z.literal('')),
});

export const rescheduleBookingSchema = z.object({
  bookingId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.coerce.number().int().min(5).max(480).optional(),
});

// ============================================
// Availability query
// ============================================
export const availabilityQuerySchema = z.object({
  tenantSlug: z.string().min(2),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ غير صالح'),
});
