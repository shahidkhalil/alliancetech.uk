"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  TrendingUp,
  Briefcase,
  Clock,
  DollarSign,
  ListChecks,
  ArrowRight,
  MessageCircle,
  FileText,
} from "lucide-react";
import { useForm } from "@/context/FormContext";
import ScoreGauge from "./ScoreGauge";
import LeadCaptureForm from "./LeadCaptureForm";
import type { AuditAnswers, BusinessGrowthReport } from "@/lib/businessAuditTypes";
import { StaggerGrid } from "@/components/ui/Card";

type GrowthReportProps = {
  report: BusinessGrowthReport;
  answers: AuditAnswers;
};

function ReportSection({
  icon: Icon,
  title,
  children,
  delay = 0,
}: {
  icon: typeof AlertTriangle;
  title: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay }}
      className="card-white rounded-2xl p-6 lg:p-7 h-full border border-[#00283C]/06"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-9 h-9 rounded-lg bg-[#E8F4F8] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#0077A8]" strokeWidth={2} />
        </span>
        <h3 className="text-base font-extrabold text-[#00283C]">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function BulletList({ items, color = "text-[#00283C]/70" }: { items: string[]; color?: string }) {
  if (!items.length) return <p className="text-sm text-[#00283C]/45">No items listed.</p>;
  return (
    <ul className={`space-y-2.5 text-sm leading-relaxed ${color}`}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="text-[#00B4D8] font-bold flex-shrink-0 mt-0.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function GrowthReportView({ report, answers }: GrowthReportProps) {
  const { openForm } = useForm();

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Score + summary hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-white rounded-2xl p-6 lg:p-10 border border-[#00283C]/06 overflow-hidden relative"
      >
        <span aria-hidden className="card-deco-dots" />
        <div className="relative z-[1] flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <ScoreGauge score={report.growthScore} />
          <div className="flex-1 text-center lg:text-left">
            <span className="badge-light mb-4">YOUR GROWTH REPORT</span>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] tracking-tight mt-3 mb-3">
              Executive Summary
            </h2>
            <p className="text-sm lg:text-base text-[#00283C]/65 leading-relaxed">{report.summary}</p>
            <p className="text-xs text-[#00283C]/40 mt-4">
              {answers.businessType} · {answers.monthlyCustomers} customers/mo · Budget:{" "}
              {answers.marketingBudget}
            </p>
          </div>
        </div>
      </motion.div>

      <StaggerGrid className="grid md:grid-cols-2 gap-5">
        <ReportSection icon={AlertTriangle} title="Biggest Business Issues">
          <BulletList items={report.biggestIssues} />
        </ReportSection>
        <ReportSection icon={TrendingUp} title="Revenue Opportunities">
          <BulletList items={report.opportunities} color="text-[#00283C]/70" />
        </ReportSection>
      </StaggerGrid>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="card-white rounded-2xl p-6 lg:p-7 border border-[#00283C]/06"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-9 h-9 rounded-lg bg-[#00283C] flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" strokeWidth={2} />
          </span>
          <h3 className="text-base font-extrabold text-[#00283C]">Recommended Alliance Tech Services</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {report.recommendedServices.map((service) => (
            <span
              key={service}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-[#E8F4F8] to-[#F0FAFC] text-[#0077A8] border border-[#00B4D8]/20"
            >
              {service}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-5">
        <ReportSection icon={Clock} title="Estimated Timeline" delay={0.05}>
          <p className="text-sm text-[#00283C]/70 leading-relaxed">{report.timeline}</p>
        </ReportSection>
        <ReportSection icon={DollarSign} title="Expected ROI" delay={0.1}>
          <p className="text-sm text-[#00283C]/70 leading-relaxed">{report.estimatedROI}</p>
        </ReportSection>
      </div>

      <ReportSection icon={ListChecks} title="Action Plan">
        <ol className="space-y-3">
          {report.nextSteps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-[#00283C]/75 leading-relaxed">
              <span className="w-6 h-6 rounded-full bg-[#00283C] text-white text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </ReportSection>

      <LeadCaptureForm answers={answers} report={report} />

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl p-8 lg:p-10 text-center card-cta-dark card-cta-glow relative overflow-hidden"
      >
        <div className="relative z-[1]">
          <h3 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-3">
            Ready to Grow Your Business?
          </h3>
          <p className="text-white/65 text-sm max-w-lg mx-auto mb-8">
            Turn this AI roadmap into real results — websites, SEO, ads, and AI automation built for
            businesses like yours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={openForm}
              className="inline-flex items-center gap-2 bg-white text-[#00283C] font-bold px-7 py-3.5 rounded-lg text-sm hover:bg-[#E8F7FB] transition-colors w-full sm:w-auto justify-center"
            >
              Book Free Consultation
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/25 text-white font-semibold px-7 py-3.5 rounded-lg text-sm hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
            >
              <FileText className="w-4 h-4" />
              Get Proposal
            </a>
            <a
              href="mailto:Sales@alliancetechltd.com?subject=Business%20Growth%20Audit%20Follow-up"
              className="inline-flex items-center gap-2 border border-white/25 text-white font-semibold px-7 py-3.5 rounded-lg text-sm hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
