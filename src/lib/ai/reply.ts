import type { AiExtraction } from './schemas';
import type { MatchResult } from './matcher';

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'الدفع عند الاستلام',
  zaincash: 'زين كاش',
  fib: 'FIB',
  qicard: 'كي كارد',
  nasspay: 'ناس باي',
  unknown: 'غير محدد',
};

export function buildCustomerReply(
  extraction: AiExtraction,
  match: MatchResult,
  opts: { storeName: string; currency?: string }
): string {
  const currency = opts.currency ?? 'د.ع';
  const lines: string[] = [];

  lines.push(`هلا ${extraction.customer_name ?? 'بالغالي'} 🌟`);
  lines.push(`استلمنا طلبك في ${opts.storeName}:`);
  lines.push('');

  for (const item of match.items) {
    if (item.status === 'matched') {
      const price = (item.unitPriceIqd ?? 0) * item.quantity;
      lines.push(
        `• ${item.matchedName} × ${item.quantity} — ${price.toLocaleString('ar-IQ')} ${currency}`
      );
    } else if (item.status === 'not_found') {
      lines.push(`• "${item.originalName}" — ⚠️ غير متوفر حاليًا`);
    } else {      lines.push(`• "${item.originalName}" — ❓ يحتاج تأكيد من الفريق`);
    }
  }

  lines.push('');

  if (match.totalMatched > 0) {
    lines.push(
      `المجموع المبدئي: ${match.subtotalIqd.toLocaleString('ar-IQ')} ${currency} (لا يشمل التوصيل)`
    );
  }

  const missing: string[] = [];
  if (!extraction.governorate) missing.push('المحافظة');
  if (!extraction.address) missing.push('العنوان التفصيلي');
  if (!extraction.customer_name) missing.push('الاسم');

  if (missing.length > 0) {
    lines.push('');
    lines.push(`حتى نكمل طلبك، نحتاج: ${missing.join('، ')}`);
  } else {
    lines.push('');
    lines.push(`طريقة الدفع: ${PAYMENT_LABELS[extraction.payment_method] ?? extraction.payment_method}`);
    lines.push('سيتواصل معك فريقنا لتأكيد الطلب والتوصيل 🚚');
  }

  return lines.join('\n');
}

export function buildMerchantNotification(
  extraction: AiExtraction,
  match: MatchResult,
  opts: { orderId?: string; customerPhone: string; conversationId: string }
): string {
  const lines: string[] = [];
  lines.push('🔔 طلب جديد من واتساب');
  lines.push('');
  lines.push(`العميل: ${extraction.customer_name ?? '—'}`);
  lines.push(`الهاتف: ${extraction.customerPhone ?? opts.customerPhone}`);
  if (extraction.governorate) lines.push(`المحافظة: ${extraction.governorate}`);
  if (extraction.city) lines.push(`المدينة: ${extraction.city}`);
  if (extraction.address) lines.push(`العنوان: ${extraction.address}`);
  lines.push('');
  lines.push(`المنتجات (${match.totalMatched} مطابق / ${match.totalUnmatched} غير مطابق):`);
  for (const item of match.items) {
    if (item.status === 'matched') {
      lines.push(`• ${item.matchedName} × ${item.quantity}`);
    } else {
      lines.push(`• ${item.originalName} (${item.status})`);
    }
  }
  if (extraction.notes) lines.push(`\nملاحظات: ${extraction.notes}`);
  return lines.join('\n');
}
