import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { ChromeVisibility } from "@/components/layout/chrome-visibility";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
} from "@/lib/seo/structured-data";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from "@/lib/seo/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSerifDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col pb-16 md:pb-0">
        <JsonLd data={buildOrganizationJsonLd()} />
        <JsonLd data={buildWebsiteJsonLd()} />
        <Navbar />
        <main className="flex flex-1 flex-col">{children}</main>
        <ChromeVisibility>
          <Footer />
        </ChromeVisibility>
        <ChromeVisibility>
          <MobileBottomNav />
        </ChromeVisibility>
        <Toaster />
      </body>
    </html>
  );
}
