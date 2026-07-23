import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsApp AI Automation for Clinics | Alliance Tech",
  description:
    "AI that replies to every WhatsApp inquiry in under 5 seconds, in English, and books patients into your calendar automatically — 3x more WhatsApp bookings for UK clinics.",
  keywords: [
    "WhatsApp AI automation UK",
    "AI automation for clinics UK",
    "WhatsApp AI for clinics",
    "automated WhatsApp booking",
    "clinic WhatsApp chatbot",
    "AI patient messaging UK",
  ],
  alternates: { canonical: "/whatsapp-ai-automation" },
  openGraph: {
    title: "WhatsApp AI Automation for Clinics | Alliance Tech",
    description: "AI that replies to every WhatsApp inquiry in under 5 seconds and books patients automatically.",
    url: "/whatsapp-ai-automation",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
