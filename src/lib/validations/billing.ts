import { z } from 'zod';

export const planChangeSchema = z.object({
  planId: z.string().uuid('اختر خطة صالحة'),
  interval: z.enum(['month', 'year']).default('month'),
  paymentMethod: z
    .enum(['zaincash', 'fib', 'qicard', 'nasspay'])
    .optional(),
});

export type PlanChangeInput = z.infer<typeof planChangeSchema>;

export const cancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional().or(z.literal('')),
  immediate: z.coerce.boolean().default(false),
});

export const FEATURE_KEYS = [
  'products',
  'orders_per_month',
  'ai_messages_per_month',
  'delivery_integrations',
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  products: 'المنتجات',
  orders_per_month: 'الطلبات شهريًا',
  ai_messages_per_month: 'رسائل الذكاء الاصطناعي',
  delivery_integrations: 'شركات التوصيل',
};

export const USAGE_METRIC_TO_FEATURE: Record<string, FeatureKey> = {
  products: 'products',
  orders: 'orders_per_month',
  ai_messages: 'ai_messages_per_month',
};
