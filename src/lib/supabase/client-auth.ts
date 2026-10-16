'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { normalizeIraqiPhone } from '@/lib/utils';

export type AuthState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
  loading: boolean;
};

const initialState: AuthState = { loading: false };

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
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: normalizeIraqiPhone(phone),
        password,
      });

      if (error || !data.user) {
        setState({
          error: error?.message?.includes('Invalid') || error
            ? 'رقم الهاتف أو كلمة المرور غير صحيحة'
            : 'تعذر تسجيل الدخول — حاول مرة أخرى',
          loading: false,
        });
        return false;
      }

      setState({ success: 'تم تسجيل الدخول بنجاح', loading: false });
      // Full navigation so the dashboard layout runs on the live server.
      window.location.assign('/dashboard');
      return true;
    } catch {
      setState({
        error: 'خدمة تسجيل الدخول غير مُهيأة على هذا النشر الثابت',
        loading: false,
      });
      return false;
    }
  }

  async function signUp(input: {
    fullName: string;
    storeName: string;
    phone: string;
    password: string;
  }) {
    setState({ loading: true });
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        phone: normalizeIraqiPhone(input.phone),
        password: input.password,
        options: {
          data: {
            full_name: input.fullName,
            store_name: input.storeName,
            phone: normalizeIraqiPhone(input.phone),
          },
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        setState({
          error: msg.includes('already') || msg.includes('exists')
            ? 'رقم الهاتف مسجل مسبقًا — سجّل الدخول'
            : 'تعذر إنشاء الحساب — حاول مرة أخرى',
          loading: false,
        });
        return false;
      }

      if (data.session) {
        setState({ success: 'تم إنشاء الحساب بنجاح', loading: false });
        window.location.assign('/dashboard');
        return true;
      }

      setState({
        success: 'تم إنشاء الحساب — سجّل الدخول الآن',
        loading: false,
      });
      window.location.assign('/login?registered=1');
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
