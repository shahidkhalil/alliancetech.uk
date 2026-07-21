"use client";

import { motion } from "framer-motion";

type ScoreGaugeProps = {
  score: number;
  size?: number;
};

export default function ScoreGauge({ score, size = 168 }: ScoreGaugeProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 75 ? "#00B4D8" : clamped >= 50 ? "#0077A8" : clamped >= 35 ? "#D97706" : "#DC2626";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,40,60,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          className="text-4xl font-extrabold text-[#00283C] tabular-nums leading-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          {clamped}
        </motion.span>
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#00283C]/45 mt-1">
          Growth Score
        </span>
      </div>
    </div>
  );
}
