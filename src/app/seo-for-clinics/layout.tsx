import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO for Dental & Aesthetic Clinics | Alliance Tech",
  description:
    "Long-term organic Google rankings for the treatment keywords your patients search — dental implants, teeth whitening, botox, laser hair removal, and more.",
  keywords: ["SEO for clinics", "dental clinic SEO", "aesthetic clinic SEO the United States", "treatment keyword SEO", "clinic organic search ranking"],
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
