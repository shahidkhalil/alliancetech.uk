"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { AuditAnswers, BusinessGrowthReport } from "@/lib/businessAuditTypes";

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

  const emailOk = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = name.trim().length >= 2 && company.trim().length >= 2 && email.trim() && emailOk;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || status === "saving") return;

    setStatus("saving");
    setError("");

    try {
      await addDoc(collection(getDb(), "leads"), {
        name: name.trim().slice(0, 120),
        company: company.trim().slice(0, 160),
        clinicName: company.trim().slice(0, 160),
        clinicType: answers.businessType.slice(0, 80),
        email: email.trim().slice(0, 160),
        phone: phone.trim().slice(0, 40),
        source: "business_growth_audit",
        auditScore: report.growthScore,
        auditVerdict: report.summary.slice(0, 200),
        topIssue: report.biggestIssues[0]?.slice(0, 200) || "",
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
    } catch (err) {
      console.error("Lead save failed:", err);
      setStatus("error");
      setError("Could not save your details. Please try again or contact us directly.");
    }
  };

  if (status === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-white rounded-2xl p-6 lg:p-8 text-center border border-[#00B4D8]/25"
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
      transition={{ delay: 0.3 }}
      className="card-white rounded-2xl p-6 lg:p-8 border border-[#00283C]/08"
    >
      <div className="flex items-start gap-3 mb-6">
        <span className="w-11 h-11 rounded-xl bg-[#E8F4F8] flex items-center justify-center flex-shrink-0">
          <Mail className="w-5 h-5 text-[#0077A8]" strokeWidth={2} />
        </span>
        <div>
          <h3 className="text-lg font-extrabold text-[#00283C]">Email this report to yourself</h3>
          <p className="text-sm text-[#00283C]/55 mt-1">
            Get a copy in your inbox and let our team follow up with personalized recommendations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name *"
            required
            className="w-full px-4 py-3 rounded-xl border border-[#00283C]/12 text-sm text-[#00283C] outline-none focus:border-[#0077A8]"
            aria-label="Your name"
          />
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name *"
            required
            className="w-full px-4 py-3 rounded-xl border border-[#00283C]/12 text-sm text-[#00283C] outline-none focus:border-[#0077A8]"
            aria-label="Company name"
          />
        </div>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email address *"
          required
          className={`w-full px-4 py-3 rounded-xl border text-sm text-[#00283C] outline-none focus:border-[#0077A8] ${emailOk ? "border-[#00283C]/12" : "border-red-300"}`}
          aria-label="Email address"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          placeholder="Phone (optional)"
          className="w-full px-4 py-3 rounded-xl border border-[#00283C]/12 text-sm text-[#00283C] outline-none focus:border-[#0077A8]"
          aria-label="Phone number"
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={!canSubmit || status === "saving"}
          className="btn-dark w-full py-3.5 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {status === "saving" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Email My Growth Report
            </>
          )}
        </button>
        <p className="text-[10px] text-[#00283C]/40 text-center">Private. No spam, ever.</p>
      </form>
    </motion.div>
  );
}
