import { z } from 'zod';
import { phoneSchema } from './auth';

// Order status state machine
export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['pending', 'cancelled'],
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

export const orderStatusSchema = z.object({
  orderId: z.string().uuid(),
  newStatus: z.enum([
    'draft',
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
  ]),
  note: z.string().max(500).optional(),
});

export const manualOrderSchema = z.object({
  customerName: z.string().min(2).max(100),
  customerPhone: phoneSchema,
  governorateId: z.coerce.number().int().positive(),
  city: z.string().min(2).max(100),
  address: z.string().min(5).max(500),
  notes: z.string().max(500).optional().or(z.literal('')),
  paymentMethod: z.enum(['cod', 'zaincash', 'fib', 'qicard', 'nasspay']),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(999),
      })
    )
    .min(1, 'أضف منتجًا واحدًا على الأقل')
    .max(50),
});

export type ManualOrderInput = z.infer<typeof manualOrderSchema>;
