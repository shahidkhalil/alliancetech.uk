import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Website Audit for Clinics | Alliance Tech",
  description:
    "Paste your clinic's website and get an instant AI audit — speed, SEO, and patient experience — with the exact fixes costing you appointments. Free.",
  keywords: ["free website audit", "clinic website checker", "SEO audit Pakistan", "website speed test", "dental website audit"],
  alternates: { canonical: "/free-website-audit" },
  openGraph: {
    title: "Free AI Website Audit for Clinics | Alliance Tech",
    description: "Instant AI audit of your clinic website — speed, SEO, and patient experience — with the fixes that matter.",
    url: "/free-website-audit",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
