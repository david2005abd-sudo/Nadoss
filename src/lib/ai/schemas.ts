import { z } from 'zod';

export const aiExtractionSchema = z.object({
  customer_name: z.string().nullable().describe('اسم العميل كما ذكره، أو null'),
  phone: z.string().nullable().describe('رقم الهاتف إن ذُكر صراحة، أو null'),
  governorate: z.string().nullable().describe('اسم المحافظة العراقية، أو null'),
  city: z.string().nullable().describe('المدينة أو القضاء، أو null'),
  address: z.string().nullable().describe('العنوان التفصيلي، أو null'),
  items: z
    .array(
      z.object({
        product_name: z.string().describe('اسم المنتج كما ذكره العميل'),
        quantity: z.number().int().min(1).describe('الكمية'),
        notes: z.string().nullable().describe('ملاحظات على المنتج'),
        flag: z
          .enum(['متوفر', 'غير_متوفر', 'غير_واضح'])
          .nullable()
          .describe('حالة المنتج: غير_واضح إن لم يتأكد النظام'),
      })
    )
    .describe('المنتجات المطلوبة'),
  payment_method: z
    .enum(['cod', 'zaincash', 'fib', 'qicard', 'nasspay', 'unknown'])
    .describe('طريقة الدفع إن ذُكرت، وإلا unknown'),
  notes: z.string().nullable().describe('أي ملاحظات إضافية'),
  language: z
    .enum(['iraqi', 'msa', 'mixed', 'other'])
    .describe('اللهجة المكتشفة: iraqi (عراقية)، msa (فصحى)، mixed، other'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('ثقة الاستخراج من 0 إلى 1'),
  missing_fields: z
    .array(z.string())
    .describe('الحقول الناقصة التي تحتاج للاستفسار عنها'),
});

export type AiExtraction = z.infer<typeof aiExtractionSchema>;
