import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'الاسم قصير جدًا').max(200),
  nameAr: z.string().min(2, 'الاسم العربي قصير جدًا').max(200),
  description: z.string().max(5000).optional().or(z.literal('')),
  descriptionAr: z.string().max(5000).optional().or(z.literal('')),
  categoryId: z.string().uuid().optional().or(z.literal('')),
  priceIqd: z.coerce.number().int().min(0, 'السعر لا يمكن أن يكون سالبًا').max(100_000_000),
  comparePriceIqd: z.coerce.number().int().min(0).optional().or(z.literal('')),
  costPriceIqd: z.coerce.number().int().min(0).optional().or(z.literal('')),
  stock: z.coerce.number().int().min(0).max(1_000_000),
  lowStockThreshold: z.coerce.number().int().min(0).max(10_000).default(5),
  sku: z.string().max(100).optional().or(z.literal('')),
  barcode: z.string().max(100).optional().or(z.literal('')),
  weightGrams: z.coerce.number().int().min(0).max(1_000_000).optional().or(z.literal('')),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, 'الاسم قصير جدًا').max(100),
  nameAr: z.string().min(2, 'الاسم العربي قصير جدًا').max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'استخدم أحرف إنجليزية وأرقام و- فقط'),
  parentId: z.string().uuid().optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;
