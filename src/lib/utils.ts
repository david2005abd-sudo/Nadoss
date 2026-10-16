import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIQD(amount: number): string {
  return `${amount.toLocaleString('en-IQ')} د.ع`;
}

export function formatDateAr(date: string | Date): string {
  return new Date(date).toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function normalizeIraqiPhone(input: string): string {
  const digits = input.replace(/[\s\-()]/g, '');
  if (digits.startsWith('+964')) return digits;
  if (digits.startsWith('964')) return `+${digits}`;
  if (digits.startsWith('0')) return `+964${digits.slice(1)}`;
  if (digits.startsWith('7')) return `+964${digits}`;
  return digits;
}
