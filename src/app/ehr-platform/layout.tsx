import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EHR Platform for Dental & Aesthetic Clinics | Alliance Tech",
  description:
    "A complete digital clinic management system — patient records, digital prescriptions, appointments, billing, and a patient app, all in one paperless platform.",
  keywords: ["EHR platform", "electronic health records the United States", "clinic management system", "dental clinic software", "digital patient records"],
  alternates: { canonical: "/ehr-platform" },
  openGraph: {
    title: "EHR Platform for Dental & Aesthetic Clinics | Alliance Tech",
    description: "A complete digital clinic management system — records, prescriptions, billing, and a patient app.",
    url: "/ehr-platform",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
