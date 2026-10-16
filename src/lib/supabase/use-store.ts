'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type StoreData = {
  tenantId: string | null;
  storeName: string | null;
  role: string | null;
  phone: string | null;
  loading: boolean;
  error: string | null;
};

/**
 * Reads the signed-in merchant's store from Supabase in the browser.
 * Works on static exports because it runs after hydration.
 */
export function useStore(): StoreData {
  const [state, setState] = useState<StoreData>({
    tenantId: null,
    storeName: null,
    role: null,
    phone: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!cancelled) {
            setState({ ...state, loading: false });
          }
          return;
        }

        const { data: membership } = await supabase
          .from('memberships')
          .select('tenant_id, role, tenants(name, phone)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        const tenants = membership?.tenants as unknown as
          | { name: string; phone: string | null }
          | null;

        setState({
          tenantId: membership?.tenant_id ?? null,
          storeName: tenants?.name ?? null,
          role: membership?.role ?? null,
          phone: tenants?.phone ?? user.phone ?? null,
          loading: false,
          error: null,
        });
      } catch {
        if (!cancelled) {
          setState({ ...state, loading: false, error: 'تعذر تحميل بيانات المتجر' });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
