"use client";
import { Sparkles } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import AuditChat, { BotAvatar } from "@/components/AuditChat";

export default function FreeWebsiteAudit() {
  return (
    <PageWrapper>
      <section className="pt-28 pb-8 bg-gradient-to-b from-[#F8FAFC] to-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <span className="badge-light mb-4 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> FREE AI WEBSITE AUDIT
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Is Your Website <span className="gradient-heading">Losing You Patients?</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Chat with our AI auditor. Real data, plain answers, free.
          </p>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Chat header */}
            <div className="bg-[#00283C] px-5 py-3.5 flex items-center gap-3">
              <div className="relative">
                <BotAvatar />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#00283C]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Alliance Audit Bot</p>
                <p className="text-[11px] text-white/50">AI website auditor · online</p>
              </div>
            </div>
            <AuditChat heightClass="h-[520px]" />
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Powered by real Google PageSpeed data + AI analysis. Your audit is free — no signup needed.
          </p>
        </div>
      </section>
    </PageWrapper>
  );
}
