import { z } from 'zod';

export const KNOWLEDGE_CATEGORIES = [
  'getting_started',
  'products',
  'orders',
  'delivery',
  'payments',
  'ai_bot',
  'billing',
  'account',
  'troubleshooting',
] as const;

export const KNOWLEDGE_CATEGORY_LABELS: Record<string, string> = {
  getting_started: 'البداية السريعة',
  products: 'المنتجات والمخزون',
  orders: 'الطلبات',
  delivery: 'التوصيل',
  payments: 'المدفوعات',
  ai_bot: 'بوت الذكاء الاصطناعي',
  billing: 'الاشتراك والفواتير',
  account: 'الحساب والإعدادات',
  troubleshooting: 'حل المشكلات',
};

export const articleSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'استخدم أحرف إنجليزية صغيرة وأرقام و- فقط'),
  title: z.string().min(5, 'العنوان قصير جدًا').max(200),
  titleEn: z.string().max(200).optional().or(z.literal('')),
  summary: z.string().max(500).optional().or(z.literal('')),
  content: z.string().min(50, 'المحتوى قصير جدًا').max(50000),
  category: z.enum(KNOWLEDGE_CATEGORIES),
  tags: z.string().max(500).optional().or(z.literal('')), // comma-separated
  isPublished: z.coerce.boolean().default(false),
  isPlatform: z.coerce.boolean().default(false),
});

export type ArticleInput = z.infer<typeof articleSchema>;

export const articleFeedbackSchema = z.object({
  articleId: z.string().uuid(),
  isHelpful: z.coerce.boolean(),
  comment: z.string().max(500).optional().or(z.literal('')),
});
