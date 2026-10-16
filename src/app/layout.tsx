import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "نادوس | NADOS", template: "%s | نادوس" },
  description: "منصة عراقية لإدارة المتاجر والطلبات والمخزون والتوصيل والحجوزات.",
  applicationName: "NADOS"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
