import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({ subsets: ['arabic'], display: 'swap' });

export const metadata: Metadata = {
  title: 'نادوس — منصة التجارة الإلكترونية العراقية',
  description: 'متجرك الإلكتروني + إدارة المخزون + توصيل + ذكاء اصطناعي — بدون خبرة تقنية',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}
