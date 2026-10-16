import { z } from 'zod';

export const deliveryAccountSchema = z.object({
  deliveryCompanyId: z.coerce.number().int().positive(),
  credentials: z.record(z.string(), z.string()),
  isDefault: z.coerce.boolean().default(false),
});

export const createShipmentSchema = z.object({
  orderId: z.string().uuid(),
  deliveryCompanySlug: z.string().min(1),
  isPickup: z.coerce.boolean().default(false),
  notes: z.string().max(500).optional().or(z.literal('')),
});
