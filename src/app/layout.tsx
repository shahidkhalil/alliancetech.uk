import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import { OrganizationSchema } from "@/components/StructuredData";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alliancetechltd.com"),
  title: "AI Automation & Growth for Clinics in the UK | Alliance Tech",
  description:
    "UK AI automation agency for dental & aesthetic clinics: AI receptionists, WhatsApp agents, and patient acquisition that fill your calendar across the United Kingdom. Book a free audit.",
  alternates: { canonical: "/" },
  keywords: [
    "AI automation for clinics",
    "AI receptionist UK",
    "dental clinic marketing Blackburn",
    "dental marketing agency UK",
    "aesthetic clinic marketing UK",
    "WhatsApp AI agent",
    "healthcare automation UK",
    "patient acquisition",
    "Alliance Tech",
  ],
  authors: [{ name: "Alliance Tech" }],
  openGraph: {
    title: "AI Automation & Growth for Clinics in the UK | Alliance Tech",
    description:
      "Get more patients, automate your front desk with AI, and grow revenue — based in Blackburn, serving clinics across the United Kingdom.",
    type: "website",
    url: "https://alliancetechltd.com",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Alliance Tech Ltd" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alliance Tech | AI Healthcare Growth",
    description: "AI-powered growth solutions for dental and aesthetic clinics across the UK.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A2540",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <body className="antialiased">
        <OrganizationSchema />
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
