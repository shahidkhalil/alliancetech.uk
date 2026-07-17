import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Marketing for Dental & Aesthetic Clinics | Alliance Tech",
  description:
    "Google and Meta ad campaigns built exclusively for dental and aesthetic clinics across the United States. Targeted by city and treatment — 4x average return on ad spend.",
  keywords: ["digital marketing for clinics", "clinic marketing agency Houston", "dental clinic ads", "med spa marketing agency", "Google Ads for dentists Texas", "Facebook ads for clinics"],
  alternates: { canonical: "/digital-marketing-for-clinics" },
  openGraph: {
    title: "Digital Marketing for Dental & Aesthetic Clinics | Alliance Tech",
    description: "Google and Meta ad campaigns built exclusively for clinics across the United States, targeted by city and treatment.",
    url: "/digital-marketing-for-clinics",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
