import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alliancetech.io"),
  title: "Alliance Tech | AI-Powered Growth for Dental & Aesthetic Clinics",
  description:
    "Alliance Tech helps Dental and Aesthetic Clinics grow through AI Automation, Patient Acquisition, WhatsApp AI Agents, AI Receptionists, and Smart EHR Solutions. Book your free growth consultation today.",
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
    url: "https://alliancetech.io",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
