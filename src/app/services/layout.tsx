import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services | Alliance Tech",
  description:
    "Browse Alliance Tech services by group — AI Automation, Growth & Marketing, and Platform — for dental and aesthetic clinics across the UK.",
  keywords: [
    "clinic marketing services UK",
    "AI automation for clinics",
    "dental practice marketing UK",
    "aesthetic clinic growth services",
  ],
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Our Services | Alliance Tech",
    description: "Browse services by group: AI Automation, Growth & Marketing, and Platform — for UK dental and aesthetic clinics.",
    url: "/services",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
