'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  otpSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth';

export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

function flattenZodErrors(errors: Record<string, string[] | undefined>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(errors)) {
    if (value && value.length > 0) out[key] = value;
  }
  return out;
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    phone: String(formData.get('phone') ?? ''),
    password: String(formData.get('password') ?? ''),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: flattenZodErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const supabase = await createClient();

  // Sign in with phone (Supabase stores phone as +9647...)
  const { data, error } = await supabase.auth.signInWithPassword({
    phone: parsed.data.phone,
    password: parsed.data.password,
  });

  if (error) {
    return { error: 'رقم الهاتف أو كلمة المرور غير صحيحة' };
  }

  if (!data.user) {
    return { error: 'تعذر تسجيل الدخول، حاول مرة أخرى' };
  }

  redirect('/dashboard');
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    fullName: String(formData.get('fullName') ?? ''),
    storeName: String(formData.get('storeName') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    password: String(formData.get('password') ?? ''),
    confirmPassword: String(formData.get('confirmPassword') ?? ''),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: flattenZodErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const supabase = await createClient();

  // Use phone as email-like identifier + store phone in metadata
  const { data, error } = await supabase.auth.signUp({
    phone: parsed.data.phone,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        store_name: parsed.data.storeName,
        phone: parsed.data.phone,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      return { error: 'رقم الهاتف مسجل مسبقًا' };
    }
    return { error: 'تعذر إنشاء الحساب، حاول مرة أخرى' };
  }

  if (!data.user) {
    return { error: 'تعذر إنشاء الحساب' };
  }

  // If session exists (phone confirmation disabled), redirect to dashboard
  if (data.session) {
    redirect('/dashboard');
  }

  // Otherwise go to OTP verification
  redirect(`/verify-otp?phone=${encodeURIComponent(parsed.data.phone)}`);
}

export async function verifyOtpAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    phone: String(formData.get('phone') ?? ''),
    token: String(formData.get('token') ?? ''),
    mode: String(formData.get('mode') ?? 'login'),
  };

  const parsed = otpSchema.safeParse({ phone: raw.phone, token: raw.token });
  if (!parsed.success) {
    return {
      fieldErrors: flattenZodErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    phone: parsed.data.phone,
    token: parsed.data.token,
    type: 'sms',
  });

  if (error || !data.user) {
    return { error: 'رمز التحقق غير صحيح أو منتهي الصلاحية' };
  }

  if (raw.mode === 'recovery') redirect('/reset-password');
  redirect('/dashboard');
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    phone: String(formData.get('phone') ?? ''),
  };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: flattenZodErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const supabase = await createClient();

  // Phone accounts recover via an SMS OTP; never send email to a fabricated phone-derived address.
  await supabase.auth.signInWithOtp({
    phone: parsed.data.phone,
    options: { shouldCreateUser: false },
  });

  // Redirect even when the phone is unknown/rate-limited to avoid account enumeration.
  redirect(`/verify-otp?phone=${encodeURIComponent(parsed.data.phone)}&mode=recovery`);
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: String(formData.get('password') ?? ''),
    confirmPassword: String(formData.get('confirmPassword') ?? ''),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error.flatten().fieldErrors) };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect('/login');

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: 'تعذر تحديث كلمة المرور. أعد طلب رمز التحقق وحاول مجددًا' };

  await supabase.auth.signOut();
  redirect('/login?passwordReset=success');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
