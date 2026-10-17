'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { navigateTo } from '@/lib/supabase/navigate';
import { IconCheck, IconX } from '@/components/nasaq/icons';

/** Normalises any Iraqi/Gulf phone form to Supabase's E.164. */
export function normalizePhone(input: string): string {
 const digits = input.replace(/[\s\-()]/g, '');
 if (digits.startsWith('+964')) return digits;
 if (digits.startsWith('964')) return `+${digits}`;
 if (digits.startsWith('0')) return `+964${digits.slice(1)}`;
 if (digits.startsWith('7')) return `+964${digits}`;
 return digits;
}

function authErrorMessage(
 error: { message?: string; code?: string | number } | null,
 fallback: string
): string {
 if (!error) return fallback;
 const code = String(error.code ?? '');
 const msg = (error.message ?? '').toLowerCase();

 if (code === 'phone_provider_disabled' || msg.includes('phone signups are disabled')) {
  return 'مصادقة الهاتف معطّلة في Supabase — فعّلها من Authentication ← Providers ← Phone';
 }
 if (msg.includes('invalid api key') || code === '401') {
  return 'مفتاح Supabase غير صالح — تحقّق من NEXT_PUBLIC_SUPABASE_ANON_KEY';
 }
 if (msg.includes('already') || msg.includes('exists') || code === 'user_already_exists') {
  return 'رقم الهاتف مسجل مسبقًا — سجّل الدخول بدلًا من إنشاء حساب';
 }
 if (msg.includes('invalid login credentials')) {
  return 'رقم الهاتف أو كلمة المرور غير صحيحة';
 }
 if (msg.includes('e.164')) {
  return 'رقم الهاتف يجب أن يكون بالصيغة الدولية، مثال: +9647841390776';
 }
 if (msg.includes('password')) {
  return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
 }
 return error.message || fallback;
}

/** Logo + heading wrapper shared by all three auth screens. */
export function AuthShell({ children }: { children: React.ReactNode }) {
 return (
  <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-10">
   <Link href="/" className="brand-logo mb-8">
    <span className="brand-mark">ن</span>
    <span className="text-2xl font-extrabold">نَسَق</span>
   </Link>
   <div className="w-full max-w-md">{children}</div>
   <p className="mt-8 text-xs text-muted">
    © 2026 نَسَق — منصة عربية لإدارة أعمالك
   </p>
  </div>
 );
}

/* ==========================================================================
  Login
  ========================================================================== */

export function LoginForm() {
 const [phone, setPhone] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);

 const registered =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('registered') === '1';

 async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError(null);
  setSuccess(null);

  if (!phone.trim() || !password) {
   setError('أدخل رقم الهاتف وكلمة المرور');
   return;
  }

  setLoading(true);
  try {
   const supabase = createClient();
   const { error: signInError } = await supabase.auth.signInWithPassword({
    phone: normalizePhone(phone),
    password,
   });

   if (signInError) {
    setError(authErrorMessage(signInError, 'تعذر تسجيل الدخول — حاول مرة أخرى'));
    setLoading(false);
    return;
   }

   setSuccess('تم تسجيل الدخول بنجاح');
   navigateTo('/dashboard');
  } catch {
   setError('خدمة تسجيل الدخول غير مُهيأة على هذا النشر');
   setLoading(false);
  }
 }

 return (
  <AuthShell>
   <div className="card">
    <h1 className="text-2xl font-extrabold">تسجيل الدخول</h1>
    <p className="mt-1 text-sm text-muted">أدخل رقم هاتفك وكلمة المرور للمتابعة إلى لوحة مشروعك.</p>

    {registered && (
     <div className="mt-4 flex items-start gap-2 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success">
      <IconCheck size={16} />
      <span>تم إنشاء حسابك بنجاح — سجّل الدخول الآن</span>
     </div>
    )}
    {success && !error && (
     <div className="mt-4 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success">{success}</div>
    )}
    {error && (
     <div className="mt-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
      <IconX size={16} />
      <span>{error}</span>
     </div>
    )}

    <form className="mt-5 space-y-4" onSubmit={onSubmit}>
     <label className="form-group block">
      <span className="form-label">رقم الهاتف</span>
      <input
       name="phone"
       type="tel"
       inputMode="tel"
       className="form-control"
       placeholder="07XXXXXXXXX"
       autoComplete="tel"
       required
       value={phone}
       onChange={(e) => setPhone(e.target.value)}
      />
     </label>
     <label className="form-group block">
      <span className="form-label">كلمة المرور</span>
      <input
       name="password"
       type="password"
       className="form-control"
       placeholder="••••••••"
       autoComplete="current-password"
       required
       value={password}
       onChange={(e) => setPassword(e.target.value)}
      />
     </label>

     <div className="flex justify-end">
      <Link href="/forgot-password" className="text-xs text-primary hover:underline">
       نسيت كلمة المرور؟
      </Link>
     </div>

     <button type="submit" className="btn btn-primary w-full" disabled={loading}>
      {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
     </button>
    </form>

    <p className="mt-6 text-center text-sm text-muted">
     ليس لديك حساب؟{' '}
     <Link href="/register" className="font-bold text-primary hover:underline">
      أنشئ متجرك الآن
     </Link>
    </p>

    <p className="mt-4 text-center text-xs text-muted">
     يمكنك أيضًا{' '}
     <Link href="/dashboard" className="text-primary hover:underline">
      تصفح لوحة التحكم
     </Link>{' '}
     بدون تسجيل دخول.
    </p>
   </div>
  </AuthShell>
 );
}

/* ==========================================================================
  Register
  ========================================================================== */

export function RegisterForm() {
 const [fullName, setFullName] = useState('');
 const [storeName, setStoreName] = useState('');
 const [phone, setPhone] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);

 async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError(null);
  setSuccess(null);

  if (fullName.trim().length < 2) return setError('أدخل اسمك الكامل');
  if (storeName.trim().length < 2) return setError('أدخل اسم المتجر');
  if (!phone.trim()) return setError('أدخل رقم الهاتف');
  if (password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');

  setLoading(true);
  try {
   const supabase = createClient();
   const normalized = normalizePhone(phone);

   const { data, error: signUpError } = await supabase.auth.signUp({
    phone: normalized,
    password,
    options: {
     data: {
      full_name: fullName.trim(),
      store_name: storeName.trim(),
      phone: normalized,
     },
    },
   });

   if (signUpError) {
    setError(authErrorMessage(signUpError, 'تعذر إنشاء الحساب — حاول مرة أخرى'));
    setLoading(false);
    return;
   }

   if (data.session) {
    setSuccess('تم إنشاء الحساب بنجاح');
    navigateTo('/dashboard');
    return;
   }

   setSuccess('تم إنشاء الحساب — سجّل الدخول الآن');
   window.setTimeout(() => navigateTo('/login?registered=1'), 1200);
  } catch {
   setError('خدمة التسجيل غير مُهيأة على هذا النشر');
   setLoading(false);
  }
 }

 return (
  <AuthShell>
   <div className="card">
    <h1 className="text-2xl font-extrabold">أنشئ متجرك</h1>
    <p className="mt-1 text-sm text-muted">مجانًا — بدون بطاقة ائتمان، تبدأ البيع في دقائق.</p>

    {success && !error && (
     <div className="mt-4 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success">{success}</div>
    )}
    {error && (
     <div className="mt-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
      <IconX size={16} />
      <span>{error}</span>
     </div>
    )}

    <form className="mt-5 space-y-4" onSubmit={onSubmit}>
     <label className="form-group block">
      <span className="form-label">الاسم الكامل</span>
      <input name="fullName" className="form-control" placeholder="علي محمد" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
     </label>
     <label className="form-group block">
      <span className="form-label">اسم المتجر</span>
      <input name="storeName" className="form-control" placeholder="متجر النور" required value={storeName} onChange={(e) => setStoreName(e.target.value)} />
      <span className="form-help">يمكنك تغييره لاحقًا من لوحة التحكم</span>
     </label>
     <label className="form-group block">
      <span className="form-label">رقم الهاتف</span>
      <input name="phone" type="tel" inputMode="tel" className="form-control" placeholder="07XXXXXXXXX" autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
      <span className="form-help">سيُستخدم لتسجيل الدخول والتنبيهات</span>
     </label>
     <label className="form-group block">
      <span className="form-label">كلمة المرور</span>
      <input name="password" type="password" className="form-control" placeholder="6 أحرف على الأقل" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
     </label>

     <button type="submit" className="btn btn-primary w-full" disabled={loading}>
      {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
     </button>
    </form>

    <p className="mt-4 text-center text-xs text-muted">
     بإنشائك الحساب، أنت توافق على{' '}
     <Link href="/terms" className="text-primary hover:underline">الشروط</Link>
     {' '}و{' '}
     <Link href="/privacy" className="text-primary hover:underline">الخصوصية</Link>
    </p>

    <p className="mt-6 text-center text-sm text-muted">
     لديك حساب بالفعل؟{' '}
     <Link href="/login" className="font-bold text-primary hover:underline">تسجيل الدخول</Link>
    </p>
   </div>
  </AuthShell>
 );
}

/* ==========================================================================
  Forgot password
  ========================================================================== */

export function ForgotPasswordForm() {
 const [phone, setPhone] = useState('');
 const [sent, setSent] = useState(false);
 const [error, setError] = useState<string | null>(null);

 return (
  <AuthShell>
   <div className="card">
    <h1 className="text-2xl font-extrabold">نسيت كلمة المرور؟</h1>
    <p className="mt-1 text-sm text-muted">أدخل رقم هاتفك وسنساعدك في استعادة حسابك.</p>

    {sent && !error && (
     <div className="mt-4 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success">
      إذا كان الرقم مسجلًا، سيتواصل معك فريق الدعم لإعادة تعيين كلمة المرور.
     </div>
    )}
    {error && (
     <div className="mt-4 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">{error}</div>
    )}

    <form
     className="mt-5 space-y-4"
     onSubmit={(e) => {
      e.preventDefault();
      if (!phone.trim()) {
       setError('أدخل رقم الهاتف');
       return;
      }
      setError(null);
      setSent(true);
     }}
    >
     <label className="form-group block">
      <span className="form-label">رقم الهاتف</span>
      <input name="phone" type="tel" inputMode="tel" className="form-control" placeholder="07XXXXXXXXX" required value={phone} onChange={(e) => setPhone(e.target.value)} />
     </label>
     <button type="submit" className="btn btn-primary w-full">استعادة كلمة المرور</button>
    </form>

    <p className="mt-6 text-center text-sm text-muted">
     <Link href="/login" className="font-bold text-primary hover:underline">العودة لتسجيل الدخول</Link>
    </p>
   </div>
  </AuthShell>
 );
}
