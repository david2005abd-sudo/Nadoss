import type { Metadata } from 'next';
import { Almarai, Tajawal } from 'next/font/google';
import './globals.css';
import { NasaqProvider } from '@/lib/nasaq/store';

const almarai = Almarai({ weight: ['400', '700', '800'], subsets: ['arabic'], display: 'swap' });
const tajawal = Tajawal({ weight: ['400', '500', '700', '800'], subsets: ['arabic'], display: 'swap' });

export const metadata: Metadata = {
 title: 'نَسَق | منصة إنشاء المواقع وإدارة المشاريع بالذكاء الاصطناعي',
 description:
  'أنشئ موقع نشاطك التجاري في دقائق، وأدر المنتجات والطلبات والحجوزات والمشاريع من لوحة واحدة — مع مساعد ذكي يفهم لهجتك.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
  <html lang="ar" dir="rtl" className={tajawal.className} data-font-almarai={almarai.className}>
   <body className="min-h-screen bg-bg text-text-primary antialiased font-sans">
    <NasaqProvider>{children}</NasaqProvider>
   </body>
  </html>
 );
}
