'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema, forgotPasswordSchema } from '@/lib/validations/auth';

export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

function toFieldErrors(errors: Record<string, string[] | undefined>): Record<string, string[]> {
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
    return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: 'النظام غير مُهيأ بعد — راجع ملف .env.local' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    phone: parsed.data.phone,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { error: 'رقم الهاتف أو كلمة المرور غير صحيحة' };
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
    return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: 'النظام غير مُهيأ بعد — راجع ملف .env.local' };
  }

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
    return { error: 'تعذر إنشاء الحساب — حاول مرة أخرى' };
  }

  if (!data.user) {
    return { error: 'تعذر إنشاء الحساب' };
  }

  if (data.session) {
    redirect('/dashboard');
  }

  redirect('/login?registered=1');
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = { phone: String(formData.get('phone') ?? '') };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error.flatten().fieldErrors) };
  }

  return {
    success: 'إذا كان الرقم مسجلًا، سيتواصل معك فريق الدعم لإعادة تعيين كلمة المرور',
  };
}

export async function logoutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  redirect('/login');
}
