import crypto from 'crypto';

const WAYL_API_BASE = 'https://api.thewayl.com/api/v1';
const MIN_AMOUNT_IQD = 1000;

export interface WaylPaymentLinkInput {
  total: number; // IQD, minimum 1000
  referenceId: string; // unique order ID
  lineItems?: Array<{
    label: string;
    amount: number;
  }>;
  webhookUrl?: string;
  webhookSecret?: string;
  redirectionUrl?: string;
  customParameter?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface WaylPaymentLinkResult {
  code: string; // Wayl's payment link code (store for later queries)
  url: string; // Hosted checkout URL
  referenceId: string;
  env: 'live' | 'test';
}

export interface WaylPaymentStatus {
  code: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'expired';
  paidAt?: string;
  amount: number;
  currency: string;
  referenceId: string;
  paymentMethod?: string;
  customerName?: string;
  customerPhone?: string;
}

// ============================================
// API Client
// ============================================

interface WaylConfig {
  apiKey: string;
  environment: 'live' | 'test';
}

function getConfig(credentials?: Record<string, string>): WaylConfig {
  const apiKey = credentials?.apiKey ?? process.env.WAYL_API_KEY;
  if (!apiKey) throw new Error('WAYL_API_KEY is required');

  return {
    apiKey,
    environment:
      (credentials?.environment as 'live' | 'test') ??
      (process.env.NODE_ENV === 'production' ? 'live' : 'test'),
  };
}

async function waylRequest<T>(
  path: string,
  config: WaylConfig,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${WAYL_API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'Accept': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `Wayl ${res.status}: ${(data as { message?: string; error?: string }).message ?? (data as { error?: string }).error ?? 'Request failed'}`
    );
  }
  return data as T;
}

// ============================================
// Public API
// ============================================

/**
 * Create a Wayl payment link.
 * ⚠️ No idempotency key — check `getPaymentLink()` before retrying on timeout.
 * ⚠️ The returned `code` and `webhookSecret` are never returned again — persist immediately.
 */
export async function createWaylPaymentLink(
  input: WaylPaymentLinkInput,
  credentials?: Record<string, string>
): Promise<WaylPaymentLinkResult> {
  if (input.total < MIN_AMOUNT_IQD) {
    throw new Error(`Wayl requires minimum ${MIN_AMOUNT_IQD} IQD`);
  }

  if (input.webhookUrl && !input.webhookSecret) {
    throw new Error('webhook_secret is required when webhook_url is provided');
  }

  const config = getConfig(credentials);

  const body: Record<string, unknown> = {
    env: config.environment,
    total: Math.round(input.total),
    currency: 'IQD',
    reference_id: input.referenceId,
  };

  if (input.lineItems?.length) {
    body.line_items = input.lineItems.map((li) => ({
      label: li.label,
      amount: li.amount,
    }));
  }
  if (input.webhookUrl) body.webhook_url = input.webhookUrl;
  if (input.webhookSecret) body.webhook_secret = input.webhookSecret;
  if (input.redirectionUrl) body.redirection_url = input.redirectionUrl;
  if (input.customParameter) body.custom_parameter = input.customParameter;

  const data = await waylRequest<{
    code: string;
    url: string;
    reference_id?: string;
    env: string;
  }>('/payment-links', config, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return {
    code: data.code,
    url: data.url,
    referenceId: data.reference_id ?? input.referenceId,
    env: config.environment,
  };
}

/**
 * Get status of a payment link.
 */
export async function getWaylPaymentStatus(
  code: string,
  credentials?: Record<string, string>
): Promise<WaylPaymentStatus> {
  const config = getConfig(credentials);

  const data = await waylRequest<{
    code: string;
    status: string;
    paid_at?: string;
    amount: number;
    currency: string;
    reference_id?: string;
    payment_method?: string;
    customer?: { name?: string; phone?: string };
  }>(`/payment-links/${code}`, config);

  return {
    code: data.code,
    status: data.status as WaylPaymentStatus['status'],
    paidAt: data.paid_at,
    amount: data.amount,
    currency: data.currency,
    referenceId: data.reference_id ?? '',
    paymentMethod: data.payment_method,
    customerName: data.customer?.name,
    customerPhone: data.customer?.phone,
  };
}

/**
 * Verify Wayl webhook signature.
 * Wayl signs the raw body with HMAC-SHA256 using the webhook secret you provided.
 */
export function verifyWaylWebhook(
  rawBody: string,
  signatureHeader: string | null,
  webhookSecret: string
): boolean {
  if (!signatureHeader) return false;

  const sig = signatureHeader.replace(/^sha256=/, '');

  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody, 'utf8')
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(sig, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Refund a payment (full refund only per Wayl docs).
 */
export async function refundWaylPayment(
  code: string,
  credentials?: Record<string, string>
): Promise<{ ok: boolean; error?: string }> {
  const config = getConfig(credentials);
  try {
    await waylRequest(`/payment-links/${code}/refund`, config, { method: 'POST' });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Refund failed' };
  }
}
