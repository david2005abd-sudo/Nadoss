import { z } from 'zod';

// Iraqi phone: +9647XXXXXXXXX (10 digits after country code)
// Accepts: 07XXXXXXXXX, +9647XXXXXXXXX, 9647XXXXXXXXX, 7XXXXXXXXX
const iraqiPhoneRegex = /^(?:\+?964|0)?7[5789]\d{8}$/;

export function normalizeIraqiPhone(input: string): string {
  const digits = input.replace(/[\s\-()]/g, '');
  if (digits.startsWith('+964')) return digits;
  if (digits.startsWith('964')) return `+${digits}`;
  if (digits.startsWith('0')) return `+964${digits.slice(1)}`;
  if (digits.startsWith('7')) return `+964${digits}`;
  return digits;
}

export const phoneSchema = z
  .string()
  .min(10, 'رقم الهاتف قصير جدًا')
  .max(14, 'رقم الهاتف طويل جدًا')
  .refine((val) => iraqiPhoneRegex.test(val.replace(/[\s\-()]/g, '')), {
    message: 'رقم هاتف عراقي غير صالح (مثال: 07701234567)',
  })
  .transform((val) => normalizeIraqiPhone(val));

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'الاسم قصير جدًا').max(100),
    storeName: z.string().min(2, 'اسم المتجر قصير جدًا').max(100),
    phone: phoneSchema,
    password: z
      .string()
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .regex(/[a-zA-Z]/, 'يجب أن تحتوي على حرف واحد على الأقل')
      .regex(/[0-9]/, 'يجب أن تحتوي على رقم واحد على الأقل'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  phone: phoneSchema,
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .regex(/[a-zA-Z]/, 'يجب أن تحتوي على حرف واحد على الأقل')
      .regex(/[0-9]/, 'يجب أن تحتوي على رقم واحد على الأقل'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });

export const otpSchema = z.object({
  phone: phoneSchema,
  token: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
