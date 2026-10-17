import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client for static exports (GitHub Pages).
 *
 * `@supabase/ssr`'s createBrowserClient is cookie-backed, and a static host
 * has no server to set or read those cookies — the session disappears after
 * the full page navigation that follows login. `@supabase/supabase-js`
 * persists to localStorage instead, which survives page loads, so the
 * dashboard can still resolve the signed-in merchant.
 */
export function createClient() {
 const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if (!url || !key) {
  throw new Error(
   'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
 }

 return createSupabaseClient(url, key, {
  auth: {
   persistSession: true,
   autoRefreshToken: true,
   detectSessionInUrl: false,
   storageKey: 'nados-auth',
  },
 });
}
