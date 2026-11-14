import type { Metadata, Viewport } from "next";
import { Cairo, Readex_Pro, Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "cn";
import { getLocale } from "next-intl/server";
import { Providers } from "@/shared/providers";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const readexPro = Readex_Pro({
  subsets: ["arabic", "latin"],
  variable: "--font-readex",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0B7B5E",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isArabic = locale === "ar";

  const title = isArabic
    ? "منصة روشتة الطبية | النظام المستقل لإدارة وطباعة الروشتات"
    : "Roshteh | Offline-First Medical Prescription Management Platform";

  const description = isArabic
    ? "منصة روشتة لإدارة وتحرير وطباعة الروشتات الطبية للأطباء محلياً بدون إنترنت، مع بحث سريع في الأدوية وقوالب طباعة مخصصة."
    : "Roshteh — Offline-first medical prescription platform for doctors with instant drug search, custom templates, and dual-page printing.";

  return {
    title,
    description,
    keywords: [
      "روشتة",
      "طباعة روشتات",
      "إدارة الروشتات",
      "دليل الأدوية المصري",
      "Roshteh",
      "Prescription Management",
      "Offline Prescription",
    ],
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export const instant = false;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={cn("h-full", "antialiased", "scroll-smooth", cairo.variable, readexPro.variable, "font-sans", geistSans.variable, geistMono.variable)}
    >
      <body className="min-h-full flex flex-col" dir={locale === "ar" ? "rtl" : "ltr"}>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
