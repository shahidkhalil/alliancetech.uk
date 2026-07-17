import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services | Alliance Tech",
  description:
    "Full-stack growth services for dental and aesthetic clinics across the United States: websites, local SEO, AI receptionists, WhatsApp automation, and EHR platforms.",
  keywords: ["clinic marketing services", "AI automation for clinics", "dental practice marketing services Houston", "med spa growth services Texas"],
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Our Services | Alliance Tech",
    description: "Full-stack growth services for dental and aesthetic clinics across the United States.",
    url: "/services",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
