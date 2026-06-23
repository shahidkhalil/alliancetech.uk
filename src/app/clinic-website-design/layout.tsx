import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Design for Dental & Aesthetic Clinics | Alliance Tech",
  description:
    "Custom, mobile-first clinic websites live in 7 days. SEO-optimised from day one, with online booking built in — 3x more enquiries than your old site.",
  keywords: ["clinic website design", "dental clinic website", "aesthetic clinic website Pakistan", "medical website design", "clinic web design Lahore"],
  alternates: { canonical: "/clinic-website-design" },
  openGraph: {
    title: "Website Design for Dental & Aesthetic Clinics | Alliance Tech",
    description: "Custom, mobile-first clinic websites live in 7 days, with online booking built in.",
    url: "/clinic-website-design",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
