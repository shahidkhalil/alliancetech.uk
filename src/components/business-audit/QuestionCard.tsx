"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import type { AuditQuestion } from "@/lib/businessAuditTypes";

type QuestionCardProps = {
  question: AuditQuestion;
  value: string;
  onChange: (value: string) => void;
  stepIndex: number;
  totalSteps: number;
  onBack?: () => void;
  onContinue: () => void;
  canContinue: boolean;
  isGenerating?: boolean;
};

export default function QuestionCard({
  question,
  value,
  onChange,
  stepIndex,
  totalSteps,
  onBack,
  onContinue,
  canContinue,
  isGenerating = false,
}: QuestionCardProps) {
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-xl mx-auto w-full"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#00283C]/45 mb-2">
          <span>
            Question {stepIndex + 1} of {totalSteps}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#00283C]/06 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#0077A8] to-[#00B4D8]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="card-white rounded-2xl p-6 lg:p-8 shadow-lg border border-[#00283C]/06">
        <h2 className="text-xl lg:text-2xl font-extrabold text-[#00283C] tracking-tight mb-2">
          {question.title}
        </h2>
        {question.subtitle ? (
          <p className="text-sm text-[#00283C]/55 mb-6">{question.subtitle}</p>
        ) : (
          <div className="mb-6" />
        )}

        {question.type === "options" && question.options ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="listbox" aria-label={question.title}>
            {question.options.map((opt) => {
              const selected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => onChange(opt.value)}
                  className={`text-left px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                    selected
                      ? "border-[#0077A8] bg-[#E8F4F8] text-[#00283C] shadow-sm ring-1 ring-[#00B4D8]/30"
                      : "border-[#00283C]/10 bg-white text-[#00283C]/70 hover:border-[#0077A8]/40 hover:bg-[#F8FCFE]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : question.type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-[#00283C]/12 text-sm text-[#00283C] outline-none focus:border-[#0077A8] focus:ring-2 focus:ring-[#00B4D8]/20 resize-none"
            aria-label={question.title}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            inputMode={question.inputMode}
            className="w-full px-4 py-3.5 rounded-xl border border-[#00283C]/12 text-sm text-[#00283C] outline-none focus:border-[#0077A8] focus:ring-2 focus:ring-[#00B4D8]/20"
            aria-label={question.title}
          />
        )}

        <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-[#00283C]/06">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00283C]/55 hover:text-[#00283C] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue || isGenerating}
            className="btn-dark inline-flex items-center gap-2 px-6 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                {stepIndex === totalSteps - 1 ? "Generate Report" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
