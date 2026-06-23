"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2, Phone, Mail, Building2, User, MessageSquare, ChevronDown } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FormData {
  name: string;
  phone: string;
  email: string;
  clinicName: string;
  clinicType: string;
  message: string;
}

const clinicTypes = [
  "Dental Clinic",
  "Aesthetic Clinic",
  "Cosmetic Surgery Clinic",
  "Dermatology Clinic",
  "Multi-Specialty Clinic",
  "Other Healthcare Provider",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsultationForm({ isOpen, onClose }: Props) {
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    clinicName: "",
    clinicType: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      await addDoc(collection(db, "leads"), {
        ...form,
        source: "consultation_form",
        createdAt: serverTimestamp(),
        status: "new",
      });

      setStatus("success");
      setForm({ name: "", phone: "", email: "", clinicName: "", clinicType: "", message: "" });
    } catch (err) {
      console.error("Firestore error:", err);
      setErrorMsg("Something went wrong. Please try WhatsApp instead.");
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-lg pointer-events-auto rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: "#0A1628", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {/* Top gradient bar */}
              <div
                className="h-1"
                style={{ background: "linear-gradient(90deg, #0066FF, #00D4FF, #7B61FF)" }}
              />

              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-6 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Book Free Consultation</h2>
                  <p className="text-sm text-white/50 mt-1">
                    We&apos;ll call you within 2 hours
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Success state */}
              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-6 pb-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Request Received! 🎉</h3>
                  <p className="text-white/60 text-sm mb-6">
                    Our team will call you within 2 hours. Check your WhatsApp for a confirmation message.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-full text-sm font-semibold text-white w-full"
                    style={{ background: "linear-gradient(135deg, #0066FF, #00D4FF)" }}
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Name + Phone row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-brand-blue transition-colors"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        placeholder="Phone / WhatsApp"
                        className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-brand-blue transition-colors"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email address (optional)"
                      className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-brand-blue transition-colors"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                  </div>

                  {/* Clinic name */}
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      name="clinicName"
                      value={form.clinicName}
                      onChange={handleChange}
                      required
                      placeholder="Clinic / Business name"
                      className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-brand-blue transition-colors"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                  </div>

                  {/* Clinic type */}
                  <div className="relative">
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    <select
                      name="clinicType"
                      value={form.clinicType}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-3 rounded-xl text-sm text-white outline-none appearance-none cursor-pointer"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: form.clinicType ? "white" : "rgba(255,255,255,0.3)",
                      }}
                    >
                      <option value="" disabled style={{ background: "#0A1628" }}>
                        Clinic type
                      </option>
                      {clinicTypes.map((t) => (
                        <option key={t} value={t} style={{ background: "#0A1628" }}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={3}
                      placeholder="What's your biggest challenge? (optional)"
                      className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none resize-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                  </div>

                  {/* Error */}
                  {status === "error" && (
                    <p className="text-red-400 text-xs text-center">{errorMsg}</p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #0066FF, #00D4FF)" }}
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Book My Free Consultation →"
                    )}
                  </button>

                  <p className="text-center text-xs text-white/30">
                    🔒 Your info is private. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
