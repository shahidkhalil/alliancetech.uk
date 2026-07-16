"use client";
import { ReactNode } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import dynamic from "next/dynamic";
import AnalyticsTracker from "./AnalyticsTracker";
import { FormProvider, useForm } from "@/context/FormContext";

// Lazy: both pull in the Firebase SDK and are only needed on interaction.
const ConsultationForm = dynamic(() => import("./ConsultationForm"), { ssr: false });
const AuditChatWidget = dynamic(() => import("./AuditChatWidget"), { ssr: false });

function PageContent({ children }: { children: ReactNode }) {
  const { isOpen, closeForm } = useForm();
  return (
    <div className="relative min-h-screen bg-white">
      <AnalyticsTracker />
      <Navigation />
      <main className="relative">{children}</main>
      <Footer />
      <ConsultationForm isOpen={isOpen} onClose={closeForm} />
      <AuditChatWidget />
    </div>
  );
}

export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <FormProvider>
      <PageContent>{children}</PageContent>
    </FormProvider>
  );
}
