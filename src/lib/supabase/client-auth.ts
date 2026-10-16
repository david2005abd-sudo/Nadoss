'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { navigateTo } from '@/lib/supabase/navigate';
import { normalizeIraqiPhone } from '@/lib/utils';

export type AuthState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
  loading: boolean;
};

const initialState: AuthState = { loading: false };

/**
 * Map Supabase error codes / messages to Arabic text a merchant can act on.
 * Falls back to the raw Supabase message so the cause is always visible
 * instead of a generic "try again".
 */
function authErrorMessage(error: { message?: string; code?: string | number; status?: number } | null): string {
  if (!error) return 'تعذر إكمال العملية — حاول مرة أخرى';

  const code = String(error.code ?? '');
  const msg = (error.message ?? '').toLowerCase();

  if (code === 'phone_provider_disabled' || msg.includes('phone signups are disabled')) {
    return 'مصادقة الهاتف معطّلة في Supabase — فعّلها من Authentication ← Providers ← Phone';
  }
  if (code === 'sms_send_failed' || msg.includes('sms')) {
    return 'تعذر إرسال رمز التحقق — لم يُعد مزوّد SMS في Supabase';
  }
  if (msg.includes('invalid api key') || code === '401' || msg.includes('unauthorized')) {
    return 'مفتاح Supabase غير صالح — حدّث NEXT_PUBLIC_SUPABASE_ANON_KEY';
  }
  if (msg.includes('already') || msg.includes('exists') || msg.includes('duplicate') || code === 'user_already_exists') {
    return 'رقم الهاتف مسجل مسبقًا — سجّل الدخول بدلًا من إنشاء حساب';
  }
  if (msg.includes('invalid login credentials')) {
    return 'رقم الهاتف أو كلمة المرور غير صحيحة';
  }
  if (msg.includes('password')) {
    return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
  }
  if (msg.includes('rate') || code === '429') {
    return 'محاولات كثيرة — انتظر قليلاً ثم أعد المحاولة';
  }
  // Show the underlying reason so it is diagnosable from the UI.
  return error.message || 'تعذر إكمال العملية — حاول مرة أخرى';
}

/**
 * Client-side Supabase auth.
 *
 * Works on static exports (GitHub Pages) because `createBrowserClient` only
 * needs the public URL + anon key, which are inlined at build time via
 * NEXT_PUBLIC_* environment variables. No server / server action required.
 */
export function useClientAuth() {
  const [state, setState] = useState<AuthState>(initialState);

  async function signIn(phone: string, password: string) {
    setState({ loading: true });
    try {
      const supabase = createClient();
      let result = await supabase.auth.signInWithPassword({
        phone: normalizeIraqiPhone(phone),
        password,
      });

      // If the project has no phone auth, try the mirrored email identity.
      if (result.error && String(result.error.status) === '400') {
        const emailLike = normalizeIraqiPhone(phone).replace('+', '');
        const retry = await supabase.auth.signInWithPassword({
          email: `${emailLike}@nados.store`,
          password,
        });
        if (!retry.error) result = retry;
      }

      const { data, error } = result;

      if (error || !data.user) {
        setState({ error: authErrorMessage(error), loading: false });
        return false;
      }

      setState({ success: 'تم تسجيل الدخول بنجاح', loading: false });
      // Full page load so the dashboard runs with a fresh session; basePath
      // aware, otherwise GitHub Pages serves a 404 for /dashboard.
      navigateTo('/dashboard');
      return true;
    } catch {
      setState({
        error: 'خدمة تسجيل الدخول غير مُهيأة على هذا النشر الثابت',
        loading: false,
      });
      return false;
    }
  }

  /**
   * Registers with phone + password. Falls back to email automatically when
   * the project has phone auth disabled (common on fresh Supabase projects),
   * so merchants can still create an account on a static preview.
   */
  async function signUp(input: {
    fullName: string;
    storeName: string;
    phone: string;
    password: string;
    email?: string;
  }) {
    setState({ loading: true });
    try {
      const supabase = createClient();
      const meta = {
        full_name: input.fullName,
        store_name: input.storeName,
        phone: normalizeIraqiPhone(input.phone),
      };

      let result = await supabase.auth.signUp({
        phone: normalizeIraqiPhone(input.phone),
        password: input.password,
        options: { data: meta },
      });

      // Phone provider disabled? Retry with email so signup still succeeds.
      const phoneDisabled =
        result.error &&
        (String(result.error.code) === 'phone_provider_disabled' ||
          result.error.message?.toLowerCase().includes('phone signups are disabled'));

      if (phoneDisabled) {
        const fallbackEmail =
          input.email || `${normalizeIraqiPhone(input.phone).replace('+', '')}@nados.store`;
        result = await supabase.auth.signUp({
          email: fallbackEmail,
          password: input.password,
          options: { data: meta },
        });
      }

      const { data, error } = result;

      if (error) {
        setState({ error: authErrorMessage(error), loading: false });
        return false;
      }

      if (data.session) {
        setState({ success: 'تم إنشاء الحساب بنجاح', loading: false });
        navigateTo('/dashboard');
        return true;
      }

      setState({
        success: 'تم إنشاء الحساب — سجّل الدخول الآن',
        loading: false,
      });
      navigateTo('/login?registered=1');
      return true;
    } catch {
      setState({
        error: 'خدمة التسجيل غير مُهيأة على هذا النشر الثابت',
        loading: false,
      });
      return false;
    }
  }

  function reset() {
    setState(initialState);
  }

  return { state, signIn, signUp, reset };
}
