import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const rawPhone = process.env.E2E_OWNER_PHONE ?? '07701234567';
const password = process.env.E2E_OWNER_PASSWORD ?? 'Test123456';

if (!url || !serviceRoleKey) {
  throw new Error('Local Supabase URL and service-role key must be exported before seeding E2E.');
}

function normalizeIraqiPhone(value) {
  const digits = value.replace(/[\\s\\-()]/g, '');
  if (digits.startsWith('+964')) return digits;
  if (digits.startsWith('964')) return `+${digits}`;
  if (digits.startsWith('0')) return `+964${digits.slice(1)}`;
  if (digits.startsWith('7')) return `+964${digits}`;
  throw new Error('E2E_OWNER_PHONE must be an Iraqi mobile number.');
}

const phone = normalizeIraqiPhone(rawPhone);
const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  phone,
  password,
  phone_confirm: true,
  user_metadata: {
    full_name: 'CI Owner',
    store_name: 'CI Store',
  },
});

if (error) {
  throw new Error(`Unable to create E2E owner: ${error.message}`);
}

const { data: memberships, error: membershipError } = await supabase
  .from('memberships')
  .select('id, tenant_id, role')
  .eq('user_id', data.user.id)
  .limit(1);

if (membershipError) {
  throw new Error(`Unable to verify E2E owner membership: ${membershipError.message}`);
}
if (!memberships?.length) {
  throw new Error('The signup trigger did not create an owner membership.');
}

console.log('E2E owner created and tenant membership verified.');
