"use client";
import { ReactNode } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import ConsultationForm from "./ConsultationForm";
import AnalyticsTracker from "./AnalyticsTracker";
import AuditChatWidget from "./AuditChatWidget";
import { FormProvider, useForm } from "@/context/FormContext";

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
