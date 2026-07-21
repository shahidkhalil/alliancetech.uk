import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Automation for Dental Clinics Houston TX | AI Receptionist",
  description:
    "AI automation for Houston dental clinics: 24/7 AI receptionist, WhatsApp responses, lead follow-up, appointment workflows, and conversion tracking.",
  keywords: [
    "AI automation for dental clinics Houston",
    "AI receptionist Houston TX",
    "dental AI receptionist Houston",
    "dental appointment automation Texas",
    "WhatsApp automation for dentists Houston",
    "automated dental lead follow up",
    "AI patient booking Houston",
    "dental clinic automation Texas",
    "24/7 dental receptionist Houston",
  ],
  alternates: { canonical: "/dental-clinic-houston" },
  openGraph: {
    title: "AI Automation for Houston Dental Clinics | Alliance Tech",
    description:
      "AI receptionist, WhatsApp automation, lead follow-up, and appointment workflows for dental clinics in Houston, TX.",
    url: "https://alliancetechltd.com/dental-clinic-houston",
    type: "website",
    locale: "en_US",
    siteName: "Alliance Tech",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
