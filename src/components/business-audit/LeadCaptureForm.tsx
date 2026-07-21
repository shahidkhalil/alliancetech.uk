"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, Loader2, Download } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { AuditAnswers, BusinessGrowthReport } from "@/lib/businessAuditTypes";
import { trackEvent, trackFormSubmit } from "@/lib/analytics";
import { printGrowthReport } from "./printReport";

type LeadCaptureFormProps = {
  answers: AuditAnswers;
  report: BusinessGrowthReport;
};

export default function LeadCaptureForm({ answers, report }: LeadCaptureFormProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const startedRef = useRef(false);

  const emailOk = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = name.trim().length >= 2 && company.trim().length >= 2 && email.trim() && emailOk;
  const isSaving = status === "saving";
  const markStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("form_start", { form_id: "business_growth_audit" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSaving) return;

    setStatus("saving");
    setError("");

    try {
      await addDoc(collection(getDb(), "leads"), {
        name: name.trim().slice(0, 120),
        clinicName: company.trim().slice(0, 160),
        clinicType: answers.businessType.slice(0, 80),
        email: email.trim().slice(0, 160),
        phone: phone.trim().slice(0, 40),
        source: "business_growth_audit",
        auditScore: report.growthScore,
        auditVerdict: report.summary.slice(0, 200),
        topIssue: report.biggestIssues[0]?.slice(0, 200) || "",
        growthReport: report,
        auditAnswers: answers,
        message: [
          `Goal: ${answers.primaryGoal}`,
          `Challenge: ${answers.biggestChallenge}`,
          `Budget: ${answers.marketingBudget}`,
          `Customers/mo: ${answers.monthlyCustomers}`,
        ].join(" · ").slice(0, 500),
        completionStatus: "complete",
        createdAt: serverTimestamp(),
        status: "new",
      });
      setStatus("done");
      trackFormSubmit("business_growth_audit", {
        service: "business_growth_audit",
        lead_source: "business_growth_audit",
        business_type: answers.businessType,
      });
      trackEvent("form_submit", {
        form_id: "business_growth_audit",
        business_type: answers.businessType,
      });
      trackEvent("generate_lead", {
        lead_source: "business_growth_audit",
        business_type: answers.businessType,
      });
    } catch (err) {
      console.error("Lead save failed:", err);
      trackEvent("api_error", {
        api_name: "business_growth_audit_lead",
        error_message: err instanceof Error ? err.message : "Lead save failed",
      });
      setStatus("error");
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg.includes("permission") || msg.includes("Permission")
          ? "Could not save your report. Please refresh the page and try again."
          : "Could not save your details. Please try again or contact us directly."
      );
    }
  };

  if (status === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-white rounded-2xl p-6 lg:p-8 text-center border border-[#00B4D8]/25 mb-28 sm:mb-24 lg:mb-0"
      >
        <CheckCircle2 className="w-12 h-12 text-[#0077A8] mx-auto mb-4" strokeWidth={1.8} />
        <h3 className="text-lg font-extrabold text-[#00283C] mb-2">Report sent!</h3>
        <p className="text-sm text-[#00283C]/55 max-w-md mx-auto">
          We&apos;ve saved your growth report and will email you a copy at{" "}
          <span className="font-semibold text-[#0077A8]">{email}</span>. Our team may reach out with
          tailored recommendations.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card-white rounded-2xl p-6 lg:p-8 border border-[#00283C]/08 mb-28 sm:mb-24 lg:mb-0 scroll-mt-24"
      id="growth-report-email-capture"
    >
      <div className="flex items-start gap-3 mb-6 pb-5 border-b border-[#00283C]/06">
        <span className="w-11 h-11 rounded-xl bg-[#E8F4F8] flex items-center justify-center flex-shrink-0">
          <Mail className="w-5 h-5 text-[#0077A8]" strokeWidth={2} />
        </span>
        <div>
          <h3 className="text-lg font-extrabold text-[#00283C]">Email this report to yourself</h3>
          <p className="text-sm text-[#00283C]/55 mt-1 leading-relaxed">
            Get a copy in your inbox and let our team follow up with personalized recommendations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => {
              markStarted();
              setName(e.target.value);
            }}
            placeholder="Your name *"
            required
            className="w-full px-4 py-3 rounded-xl border border-[#00283C]/12 text-sm text-[#00283C] outline-none focus:border-[#0077A8] focus:ring-2 focus:ring-[#00B4D8]/15"
            aria-label="Your name"
          />
          <input
            value={company}
            onChange={(e) => {
              markStarted();
              setCompany(e.target.value);
            }}
            placeholder="Company name *"
            required
            className="w-full px-4 py-3 rounded-xl border border-[#00283C]/12 text-sm text-[#00283C] outline-none focus:border-[#0077A8] focus:ring-2 focus:ring-[#00B4D8]/15"
            aria-label="Company name"
          />
        </div>
        <input
          value={email}
          onChange={(e) => {
            markStarted();
            setEmail(e.target.value);
          }}
          type="email"
          placeholder="Email address *"
          required
          className={`w-full px-4 py-3 rounded-xl border text-sm text-[#00283C] outline-none focus:border-[#0077A8] focus:ring-2 focus:ring-[#00B4D8]/15 ${emailOk ? "border-[#00283C]/12" : "border-red-300"}`}
          aria-label="Email address"
        />
        <input
          value={phone}
          onChange={(e) => {
            markStarted();
            setPhone(e.target.value);
          }}
          type="tel"
          placeholder="Phone (optional)"
          className="w-full px-4 py-3 rounded-xl border border-[#00283C]/12 text-sm text-[#00283C] outline-none focus:border-[#0077A8] focus:ring-2 focus:ring-[#00B4D8]/15"
          aria-label="Phone number"
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="submit"
            disabled={!canSubmit || isSaving}
            className={`inline-flex items-center justify-center gap-2 rounded-lg py-3.5 px-4 text-sm font-bold transition-all duration-200 min-h-[48px] ${
              canSubmit && !isSaving
                ? "bg-[#00283C] text-white hover:bg-[#003D5C] hover:shadow-md"
                : "bg-[#00283C]/08 text-[#00283C]/35 border border-[#00283C]/10 cursor-not-allowed"
            }`}
            aria-disabled={!canSubmit || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>Email My Growth Report</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              trackEvent("file_download", {
                file_name: "business_growth_report",
                business_type: answers.businessType,
              });
              printGrowthReport(report, answers);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg py-3.5 px-4 text-sm font-semibold text-[#00283C] bg-white border border-[#00283C]/15 hover:border-[#0077A8] hover:text-[#0077A8] transition-colors min-h-[48px]"
          >
            <Download className="w-4 h-4 flex-shrink-0" />
            <span>Download as PDF</span>
          </button>
        </div>
        <p className="text-[10px] text-[#00283C]/40 text-center pt-1">Private. No spam, ever.</p>
      </form>
    </motion.div>
  );
}
