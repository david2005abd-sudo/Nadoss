import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({ subsets: ['arabic'], display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'نادوس — منصة التجارة الإلكترونية العراقية',
    template: '%s — نادوس',
  },
  description:
    'متجرك الإلكتروني + إدارة المخزون + تتبع الطلبات + ربط شركات التوصيل العراقية + بوت ذكاء اصطناعي يحوّل رسائل واتساب إلى طلبات — بدون خبرة تقنية.',
  keywords: ['متجر إلكتروني', 'العراق', 'تجارة إلكترونية', 'SaaS', 'نادوس', 'NADOS'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
