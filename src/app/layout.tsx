import type { Metadata } from 'next';
import { Almarai, Tajawal } from 'next/font/google';
import './globals.css';
import { NasaqProvider } from '@/lib/nasaq/store';
import { MotionObserver, ScrollRail } from '@/components/nasaq/motion';

const almarai = Almarai({ weight: ['400', '700', '800'], subsets: ['arabic'], display: 'swap' });
const tajawal = Tajawal({ weight: ['400', '500', '700', '800'], subsets: ['arabic'], display: 'swap' });

export const metadata: Metadata = {
  title: 'نَسَق | منصة إنشاء المواقع وإدارة المشاريع بالذكاء الاصطناعي',
  description:
    'أنشئ موقع نشاطك التجاري في دقائق، وأدر المنتجات والطلبات والحجوزات والمشاريع من لوحة واحدة — بأسعار بالدينار العراقي ومساعد ذكي يفهم لهجتك.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.className}>
      <body className="min-h-screen bg-bg text-text-primary font-sans antialiased">
        <NasaqProvider>
          <MotionObserver />
          <ScrollRail />
          {children}
        </NasaqProvider>
      </body>
    </html>
  );
}
