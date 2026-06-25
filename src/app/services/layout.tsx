import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services | Alliance Tech",
  description:
    "Full-stack growth services for dental and aesthetic clinics in Pakistan: websites, local SEO, AI receptionists, WhatsApp automation, and EHR platforms.",
  keywords: ["clinic marketing services", "dental clinic services Pakistan", "aesthetic clinic growth services"],
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Our Services | Alliance Tech",
    description: "Full-stack growth services for dental and aesthetic clinics in Pakistan.",
    url: "/services",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
