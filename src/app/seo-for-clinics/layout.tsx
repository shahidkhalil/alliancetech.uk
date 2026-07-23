import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO for Dental & Aesthetic Clinics | Alliance Tech",
  description:
    "Long-term organic Google rankings for the treatment keywords your UK patients search — dental implants, teeth whitening, botox, laser hair removal, and more.",
  keywords: [
    "SEO for clinics UK",
    "dental SEO Blackburn",
    "dental SEO services UK",
    "aesthetic clinic SEO",
    "dental clinic SEO",
    "clinic organic search ranking",
  ],
  alternates: { canonical: "/seo-for-clinics" },
  openGraph: {
    title: "SEO for Dental & Aesthetic Clinics | Alliance Tech",
    description: "Long-term organic Google rankings for the treatment keywords your patients search.",
    url: "/seo-for-clinics",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
