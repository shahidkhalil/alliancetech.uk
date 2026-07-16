import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-TR2J78K3F0";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alliancetechltd.com"),
  title: "Alliance Tech | AI-Powered Growth for Dental & Aesthetic Clinics",
  description:
    "AI automation for dental & aesthetic clinics: AI receptionists, WhatsApp agents, and patient acquisition that fill your calendar. Book a free audit.",
  alternates: { canonical: "/" },
  keywords: [
    "dental clinic growth",
    "aesthetic clinic AI",
    "AI receptionist",
    "WhatsApp AI agent",
    "healthcare automation",
    "patient acquisition",
    "clinic management",
    "EHR platform",
    "Alliance Tech",
  ],
  authors: [{ name: "Alliance Tech" }],
  openGraph: {
    title: "Alliance Tech | AI-Powered Growth for Dental & Aesthetic Clinics",
    description:
      "Get more patients, automate operations, and increase revenue with our healthcare growth ecosystem.",
    type: "website",
    url: "https://alliancetechltd.com",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Alliance Tech (PVT) LTD" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alliance Tech | AI Healthcare Growth",
    description: "AI-powered growth solutions for dental and aesthetic clinics.",
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
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
