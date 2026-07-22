"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      setAuthReady(true);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    } catch {
      setLoginError("Invalid email or password.");
    } finally {
      setLoggingIn(false);
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#071018]">
        <Loader2 className="w-6 h-6 animate-spin text-[#00B4D8]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#071018] px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,180,216,0.25), transparent 70%)",
          }}
        />
        <motion.form
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          onSubmit={handleLogin}
          className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00B4D8] mb-3">Alliance Tech</p>
          <h1 className="text-2xl font-extrabold text-white mb-1">Admin Panel</h1>
          <p className="text-sm text-white/50 mb-6">Leads, blog CMS, live visitors, and database.</p>
          <label className="block text-xs font-semibold text-white/40 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mb-4 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white outline-none focus:border-[#0077A8]"
          />
          <label className="block text-xs font-semibold text-white/40 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mb-4 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-sm text-white outline-none focus:border-[#0077A8]"
          />
          {loginError && <p className="text-red-400 text-sm mb-3">{loginError}</p>}
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full py-3.5 rounded-xl bg-[#0077A8] text-white font-bold text-sm hover:bg-[#0090c7] transition-colors disabled:opacity-60"
          >
            {loggingIn ? "Signing in…" : "Sign in"}
          </button>
        </motion.form>
      </div>
    );
  }

  return <AdminDashboard user={user} onSignOut={() => signOut(getFirebaseAuth())} />;
}
