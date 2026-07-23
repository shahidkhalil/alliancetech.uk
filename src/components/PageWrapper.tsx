"use client";
import { ReactNode } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import dynamic from "next/dynamic";
import { FormProvider, useForm } from "@/context/FormContext";
import { PackageOrderProvider } from "@/context/PackageOrderContext";
import RouteFade from "@/components/Motion/RouteFade";

const ConsultationForm = dynamic(() => import("./ConsultationForm"), { ssr: false });
const AuditChatWidget = dynamic(() => import("./AuditChatWidget"), { ssr: false });
const PackageOrderForm = dynamic(() => import("./PackageOrderForm"), { ssr: false });
const MobileStickyCta = dynamic(() => import("./MobileStickyCta"), { ssr: false });

function PageContent({ children }: { children: ReactNode }) {
  const { isOpen, closeForm } = useForm();
  return (
    <div className="relative min-h-screen bg-white">
      <Navigation />
      <RouteFade>
        <main className="relative">{children}</main>
      </RouteFade>
      <Footer />
      {isOpen && <ConsultationForm isOpen={isOpen} onClose={closeForm} />}
      <AuditChatWidget />
      <PackageOrderForm />
      <MobileStickyCta />
    </div>
  );
}

export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <FormProvider>
      <PackageOrderProvider>
        <PageContent>{children}</PageContent>
      </PackageOrderProvider>
    </FormProvider>
  );
}
