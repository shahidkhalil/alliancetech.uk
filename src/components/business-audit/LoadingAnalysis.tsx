"use client";

import { motion } from "framer-motion";
import { Loader2, Sparkles, BarChart3, Target, Lightbulb } from "lucide-react";

const STEPS = [
  { icon: BarChart3, label: "Reviewing your market position" },
  { icon: Target, label: "Mapping growth opportunities" },
  { icon: Lightbulb, label: "Building your action plan" },
];

export default function LoadingAnalysis() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto text-center py-16 px-6"
      role="status"
      aria-live="polite"
      aria-label="Analyzing your business"
    >
      <div className="relative w-20 h-20 mx-auto mb-8">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-[#E6F4F8] to-[#00B4D8]/20"
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-9 h-9 text-[#0077A8] animate-spin" strokeWidth={2} />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6F4F8] text-[#0077A8] text-xs font-bold uppercase tracking-wider mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        AI Analysis
      </div>

      <h2 className="text-2xl font-extrabold text-[#00283C] tracking-tight mb-2">
        Analyzing your business…
      </h2>
      <p className="text-sm text-[#00283C]/55 mb-10">
        Our AI consultant is reviewing your answers and building a tailored growth strategy.
      </p>

      <div className="space-y-3 text-left">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.5, duration: 0.4 }}
            className="flex items-center gap-3 rounded-xl border border-[#00283C]/08 bg-white px-4 py-3 shadow-sm"
          >
            <span className="w-9 h-9 rounded-lg bg-[#E8F4F8] flex items-center justify-center flex-shrink-0">
              <step.icon className="w-4 h-4 text-[#0077A8]" strokeWidth={2} />
            </span>
            <span className="text-sm font-semibold text-[#00283C]/75">{step.label}</span>
            <motion.span
              className="ml-auto w-2 h-2 rounded-full bg-[#00B4D8]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          </motion.div>
        ))}
      </div>

      <div className="mt-10 h-1.5 rounded-full bg-[#00283C]/06 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#0077A8] to-[#00B4D8]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
