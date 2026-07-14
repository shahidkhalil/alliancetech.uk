import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Branded Mobile App for Dental & Aesthetic Clinics | Alliance Tech",
  description:
    "A fully branded iOS and Android app for your clinic. Patients book appointments, view records, get reminders, and pay — all under your own logo.",
  keywords: ["clinic mobile app", "dental clinic app", "patient app the United States", "aesthetic clinic app", "clinic booking app"],
  alternates: { canonical: "/clinic-mobile-app" },
  openGraph: {
    title: "Branded Mobile App for Dental & Aesthetic Clinics | Alliance Tech",
    description: "A fully branded iOS and Android app for your clinic — booking, records, reminders, and payments.",
    url: "/clinic-mobile-app",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
