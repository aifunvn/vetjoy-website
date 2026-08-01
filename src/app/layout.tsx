import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { UtmTracker } from "@/components/layout/UtmTracker";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.brandName} – ${siteConfig.companyName}`,
    template: `%s | ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: siteConfig.brandName,
    title: `${siteConfig.brandName} – ${siteConfig.companyName}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteConfig.brandName,
            legalName: siteConfig.companyName,
            url: siteConfig.url,
            slogan: siteConfig.slogan,
          }}
        />
        <a href="#main-content" className="skip-link">
          Bỏ qua để đến nội dung chính
        </a>
        <Suspense fallback={null}>
          <UtmTracker />
        </Suspense>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <FloatingActionButton />
      </body>
    </html>
  );
}
