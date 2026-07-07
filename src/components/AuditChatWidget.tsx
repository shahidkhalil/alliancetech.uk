"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot } from "lucide-react";
import { usePathname } from "next/navigation";
import AuditChat, { BotAvatar } from "./AuditChat";

/**
 * Floating chat widget (bottom-right, every page).
 * Lazily mounts the chat the first time it's opened, then keeps the
 * conversation alive when minimized.
 */
export default function AuditChatWidget() {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const pathname = usePathname();

  // The dedicated page already hosts the chat — don't double up.
  const hidden = pathname === "/free-website-audit";

  // Small attention nudge after a few seconds, once per mount.
  useEffect(() => {
    if (hidden || everOpened) return;
    const t = setTimeout(() => setShowNudge(true), 6000);
    return () => clearTimeout(t);
  }, [hidden, everOpened]);

  if (hidden) return null;

  return (
    <>
      {/* Chat panel — stays mounted once opened so the conversation survives minimize */}
      {everOpened && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={open ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.22 }}
          className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] max-w-[400px] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden bg-white flex flex-col"
          style={{ height: "min(600px, calc(100vh - 140px))", pointerEvents: open ? "auto" : "none", visibility: open ? "visible" : "hidden" }}
        >
          {/* Header */}
          <div className="bg-[#00283C] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <BotAvatar />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#00283C]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">Alliance Audit Bot</p>
                <p className="text-[11px] text-white/50 leading-tight">Free AI website audit · online</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Minimize chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <AuditChat heightClass="" />
          </div>
        </motion.div>
      )}

      {/* Nudge bubble */}
      <AnimatePresence>
        {showNudge && !open && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={() => { setOpen(true); setEverOpened(true); setShowNudge(false); }}
            className="fixed bottom-24 right-4 sm:right-6 z-[59] bg-white rounded-2xl rounded-br-sm shadow-xl border border-gray-200 px-4 py-3 text-left max-w-[240px]"
          >
            <p className="text-xs font-bold text-[#00283C] mb-0.5">🔍 Free website audit</p>
            <p className="text-xs text-gray-500 leading-snug">Is your website losing you patients? Check it free in 30 seconds.</p>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Launcher button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        onClick={() => { setOpen((o) => !o); setEverOpened(true); setShowNudge(false); }}
        className="fixed bottom-5 right-4 sm:right-6 z-[60] w-14 h-14 rounded-full bg-[#00283C] shadow-xl flex items-center justify-center text-white hover:scale-105 transition-transform"
        aria-label={open ? "Close audit chat" : "Open audit chat"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Bot className="w-6 h-6 text-[#9FD3E8]" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
