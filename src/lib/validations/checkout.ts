import { z } from 'zod';
import { phoneSchema } from './auth';

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'الاسم قصير جدًا').max(100),
  customerPhone: phoneSchema,
  governorateId: z.coerce.number().int().positive('اختر المحافظة'),
  city: z.string().min(2, 'المدينة قصيرة جدًا').max(100),
  address: z.string().min(5, 'العنوان قصير جدًا').max(500),
  notes: z.string().max(500).optional().or(z.literal('')),
  paymentMethod: z.enum(['cod', 'zaincash', 'fib', 'qicard', 'nasspay']),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export interface CartLinePayload {
  productId: string;
  quantity: number;
}

export const cartLineSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(999),
});

export const cartPayloadSchema = z.array(cartLineSchema).min(1, 'السلة فارغة').max(50);
