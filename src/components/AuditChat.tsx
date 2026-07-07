"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  UserRound,
  Wallet,
  ArrowRight,
  Bot,
} from "lucide-react";
import { useForm } from "@/context/FormContext";

const AUDIT_ENDPOINT =
  process.env.NEXT_PUBLIC_AUDIT_ENDPOINT ||
  "https://asia-south1-alliancepak.cloudfunctions.net/auditWebsite";

interface Issue { title: string; impact: string; fix: string }
interface Report {
  overallScore: number;
  verdict: string;
  headline: string;
  mysteryPatient?: string;
  revenueImpact?: string;
  criticalIssues?: Issue[];
  improvements?: Issue[];
  doingWell?: string[];
  competitorComparison?: string;
  nextStep?: string;
}

type Msg =
  | { id: number; from: "bot"; kind: "text"; text: string }
  | { id: number; from: "bot"; kind: "typing" }
  | { id: number; from: "bot"; kind: "score"; report: Report; url: string }
  | { id: number; from: "bot"; kind: "impact"; report: Report }
  | { id: number; from: "bot"; kind: "issues"; report: Report }
  | { id: number; from: "bot"; kind: "improvements"; report: Report }
  | { id: number; from: "bot"; kind: "well"; report: Report }
  | { id: number; from: "bot"; kind: "cta"; report: Report }
  | { id: number; from: "user"; kind: "text"; text: string };

type MsgInput = Msg extends infer M ? (M extends Msg ? Omit<M, "id"> : never) : never;

function scoreColor(s: number) {
  if (s >= 80) return "#16A34A";
  if (s >= 60) return "#D97706";
  return "#DC2626";
}

let nextId = 1;
const mid = () => nextId++;

export function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-[#00283C] flex items-center justify-center flex-shrink-0">
      <Bot className="w-4 h-4 text-[#9FD3E8]" />
    </div>
  );
}

function Bubble({ children, from }: { children: React.ReactNode; from: "bot" | "user" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-2.5 ${from === "user" ? "justify-end" : "justify-start"}`}
    >
      {from === "bot" && <BotAvatar />}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          from === "user"
            ? "bg-[#00283C] text-white rounded-br-sm"
            : "bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-sm"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <Bubble from="bot">
      <span className="inline-flex gap-1 items-center py-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
          />
        ))}
      </span>
    </Bubble>
  );
}

function ScoreCard({ report, url }: { report: Report; url: string }) {
  const color = scoreColor(report.overallScore);
  return (
    <div className="text-center py-2">
      <p className="text-[11px] text-gray-400 mb-2 break-all">{url}</p>
      <div
        className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-3"
        style={{ background: `conic-gradient(${color} ${report.overallScore * 3.6}deg, #EEF2F6 0deg)` }}
      >
        <div className="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold" style={{ color }}>{report.overallScore}</span>
          <span className="text-[9px] text-gray-400 uppercase tracking-wide">/ 100</span>
        </div>
      </div>
      <p className="font-extrabold text-[#00283C]">{report.verdict}</p>
      <p className="text-gray-500 text-sm mt-1">{report.headline}</p>
    </div>
  );
}

/**
 * The audit chat conversation — embeddable anywhere.
 * `heightClass` controls the message area height (page vs widget).
 */
export default function AuditChat({ heightClass = "h-[520px]" }: { heightClass?: string }) {
  const { openForm } = useForm();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const push = useCallback((m: MsgInput) => {
    setMessages((prev) => [...prev, { ...m, id: mid() } as Msg]);
  }, []);

  const replaceTyping = useCallback((m: MsgInput) => {
    setMessages((prev) => {
      const withoutTyping = prev.filter((x) => x.kind !== "typing");
      return [...withoutTyping, { ...m, id: mid() } as Msg];
    });
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const t1 = setTimeout(
      () => push({ from: "bot", kind: "text", text: "👋 Hi! I'm the Alliance Tech audit bot. I check clinic websites for the problems that quietly cost you patients — slow loading, weak Google visibility, and booking friction." }),
      400
    );
    const t2 = setTimeout(
      () => push({ from: "bot", kind: "text", text: "Paste your website address below and I'll run a full audit — takes about 30 seconds. 👇" }),
      1400
    );
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [push]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const runAudit = async (rawUrl: string) => {
    setBusy(true);
    push({ from: "user", kind: "text", text: rawUrl });
    push({ from: "bot", kind: "typing" });

    const progress = [
      "🔍 Fetching your website…",
      "⚡ Measuring speed on mobile & desktop…",
      "📈 Analyzing your SEO & Google visibility…",
      "🧑‍⚕️ Walking through it like a patient would…",
      "✍️ Writing your report…",
    ];
    let pi = 0;
    const progressTimer = setInterval(() => {
      if (pi < progress.length) {
        const text = progress[pi++];
        setMessages((prev) => {
          const withoutTyping = prev.filter((x) => x.kind !== "typing");
          return [
            ...withoutTyping,
            { id: mid(), from: "bot", kind: "text", text } as Msg,
            { id: mid(), from: "bot", kind: "typing" } as Msg,
          ];
        });
      }
    }, 6000);

    try {
      const res = await fetch(AUDIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rawUrl }),
      });
      const data = await res.json();
      clearInterval(progressTimer);
      if (!res.ok) throw new Error(data.error || "Audit failed");

      const report: Report = data.report;
      const url: string = data.url || rawUrl;

      replaceTyping({ from: "bot", kind: "text", text: "Done! Here's what I found. 👇" });
      const steps: Array<[number, MsgInput]> = [
        [600, { from: "bot", kind: "score", report, url }],
        [1600, { from: "bot", kind: "impact", report }],
        [2600, { from: "bot", kind: "issues", report }],
        [3600, { from: "bot", kind: "improvements", report }],
        [4600, { from: "bot", kind: "well", report }],
        [5600, { from: "bot", kind: "cta", report }],
      ];
      steps.forEach(([delay, m]) => setTimeout(() => push(m), delay));
      setTimeout(() => setBusy(false), 5800);
    } catch (err) {
      clearInterval(progressTimer);
      replaceTyping({
        from: "bot",
        kind: "text",
        text: `😕 ${err instanceof Error ? err.message : "Something went wrong."} Double-check the address (e.g. yourclinic.com) and try again.`,
      });
      setBusy(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v || busy) return;
    setInput("");
    runAudit(v);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className={`${heightClass} overflow-y-auto px-4 py-5 space-y-4 bg-[#F8FAFC] flex-1`}>
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            if (m.kind === "typing") return <TypingBubble key={m.id} />;
            if (m.kind === "text") return <Bubble key={m.id} from={m.from}>{m.text}</Bubble>;
            if (m.kind === "score") return (
              <Bubble key={m.id} from="bot"><ScoreCard report={m.report} url={m.url} /></Bubble>
            );
            if (m.kind === "impact") return (
              <Bubble key={m.id} from="bot">
                <div className="space-y-3">
                  {m.report.revenueImpact && (
                    <div>
                      <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-1"><Wallet className="w-4 h-4 text-[#D97706]" /> What this is costing you</p>
                      <p>{m.report.revenueImpact}</p>
                    </div>
                  )}
                  {m.report.mysteryPatient && (
                    <div>
                      <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-1"><UserRound className="w-4 h-4 text-[#0077A8]" /> I tried booking like a patient…</p>
                      <p className="italic text-gray-600">{m.report.mysteryPatient}</p>
                    </div>
                  )}
                </div>
              </Bubble>
            );
            if (m.kind === "issues") return m.report.criticalIssues?.length ? (
              <Bubble key={m.id} from="bot">
                <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-2"><AlertTriangle className="w-4 h-4 text-[#DC2626]" /> Critical issues</p>
                <div className="space-y-2.5">
                  {m.report.criticalIssues.map((it, i) => (
                    <div key={i} className="pl-3 border-l-2 border-[#DC2626]">
                      <p className="font-bold text-[#00283C]">{it.title}</p>
                      <p className="text-gray-500">{it.impact}</p>
                      <p className="text-[#0077A8]">→ {it.fix}</p>
                    </div>
                  ))}
                </div>
              </Bubble>
            ) : null;
            if (m.kind === "improvements") return m.report.improvements?.length ? (
              <Bubble key={m.id} from="bot">
                <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-2"><TrendingUp className="w-4 h-4 text-[#D97706]" /> Worth improving</p>
                <div className="space-y-2">
                  {m.report.improvements.map((it, i) => (
                    <div key={i} className="pl-3 border-l-2 border-[#D97706]">
                      <p className="font-bold text-[#00283C]">{it.title}</p>
                      <p className="text-gray-500">{it.impact} <span className="text-[#0077A8]">→ {it.fix}</span></p>
                    </div>
                  ))}
                </div>
              </Bubble>
            ) : null;
            if (m.kind === "well") return m.report.doingWell?.length ? (
              <Bubble key={m.id} from="bot">
                <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> You&apos;re doing these well</p>
                <ul className="space-y-1.5">
                  {m.report.doingWell.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />{d}</li>
                  ))}
                </ul>
              </Bubble>
            ) : null;
            if (m.kind === "cta") return (
              <Bubble key={m.id} from="bot">
                <p className="mb-3">{m.report.nextStep || "Want us to fix all of this for you? Book a free strategy call — we'll turn these fixes into more patients."}</p>
                <button
                  onClick={openForm}
                  className="btn-dark w-full py-3 text-sm inline-flex items-center justify-center gap-2"
                >
                  Book My Free Strategy Call <ArrowRight className="w-4 h-4" />
                </button>
              </Bubble>
            );
            return null;
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="border-t border-gray-200 bg-white px-3 py-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={busy ? "Auditing… hang tight" : "Type your website, e.g. yourclinic.com"}
          disabled={busy}
          className="flex-1 px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-200 text-sm text-[#00283C] outline-none focus:border-[#0077A8] transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="w-11 h-11 rounded-xl bg-[#00283C] text-white flex items-center justify-center hover:bg-[#0077A8] transition-colors disabled:opacity-40 flex-shrink-0"
          aria-label="Send"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
