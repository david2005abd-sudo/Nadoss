import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * تنسيق العملة. الافتراضي الدينار العراقي لأن المنصة موجّهة للسوق العراقي،
 * ويمكن تمرير عملة أخرى لإعادة استخدام الدالة.
 */
export function formatIQD(amount: number): string {
  return `${Number(amount ?? 0).toLocaleString('en-US')} د.ع`;
}

export function formatPrice(amount: number, currency: string): string {
  switch (currency) {
    case 'ريال سعودي (ر.س)':
      return `${Number(amount ?? 0).toLocaleString('en-US')} ر.س`;
    case 'درهم إماراتي (د.إ)':
      return `${Number(amount ?? 0).toLocaleString('en-US')} د.إ`;
    case 'دينار كويتي (د.ك)':
      return `${Number(amount ?? 0).toLocaleString('en-US')} د.ك`;
    case 'جنيه مصري (ج.م)':
      return `${Number(amount ?? 0).toLocaleString('en-US')} ج.م`;
    case 'دولار أمريكي (USD)':
      return `$${Number(amount ?? 0).toLocaleString('en-US')}`;
    default:
      return formatIQD(amount);
  }
}

export function formatDateAr(date: string | Date): string {
  return new Date(date).toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** يحوّل أي صيغة رقم عراقي إلى الصيغة الدولية E.164 (+964...). */
export function normalizeIraqiPhone(input: string): string {
  const digits = input.replace(/[\s\-()]/g, '');
  if (digits.startsWith('+964')) return digits;
  if (digits.startsWith('964')) return `+${digits}`;
  if (digits.startsWith('0')) return `+964${digits.slice(1)}`;
  if (digits.startsWith('7')) return `+964${digits}`;
  return digits;
}

/** يتحقق من صحة أرقام الموبايل العراقية (07x xxxx xxxx أو +964 7x ...). */
export function isValidIraqiPhone(input: string): boolean {
  return /^\+9647[3-9]\d{8}$/.test(normalizeIraqiPhone(input));
}
