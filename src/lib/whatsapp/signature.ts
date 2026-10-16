import crypto from 'crypto';

/**
 * Verify Meta's X-Hub-Signature-256 header.
 * Must run on the RAW request body (never re-serialized JSON).
 */
export function verifyWhatsAppSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader) return false;

  const [algo, sig] = signatureHeader.split('=');
  if (algo !== 'sha256' || !sig) return false;

  const expected = crypto
    .createHmac('sha256', appSecret)
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
