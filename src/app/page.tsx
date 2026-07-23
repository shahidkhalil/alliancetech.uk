"use client";
import { FormProvider, useForm } from "@/context/FormContext";
import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import FinalCTA from "@/components/FinalCTA";
import HomeBelowFold from "@/components/HomeBelowFold";
import RouteFade from "@/components/Motion/RouteFade";

const ConsultationForm = dynamic(() => import("@/components/ConsultationForm"), { ssr: false });
const AuditChatWidget = dynamic(() => import("@/components/AuditChatWidget"), { ssr: false });
const MobileStickyCta = dynamic(() => import("@/components/MobileStickyCta"), { ssr: false });

function HomeContent() {
  const { isOpen, closeForm } = useForm();
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white">
      {isOpen && <ConsultationForm isOpen={isOpen} onClose={closeForm} />}
      <AuditChatWidget />
      <Navigation />
      <RouteFade>
        <main>
          <Hero />
          <HomeBelowFold />
          <FinalCTA />
        </main>
      </RouteFade>
      <Footer />
      <MobileStickyCta />
    </div>
  );
}

export default function Home() {
  return (
    <FormProvider>
      <HomeContent />
    </FormProvider>
  );
}
