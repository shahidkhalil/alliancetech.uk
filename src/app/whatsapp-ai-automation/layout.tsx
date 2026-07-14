import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsApp AI Automation for Clinics | Alliance Tech",
  description:
    "AI that replies to every WhatsApp inquiry in under 5 seconds, in English, and books patients into your calendar automatically — 3x more WhatsApp bookings.",
  keywords: ["WhatsApp AI automation", "WhatsApp AI for clinics", "automated WhatsApp booking", "clinic WhatsApp chatbot the United States", "AI patient messaging"],
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
