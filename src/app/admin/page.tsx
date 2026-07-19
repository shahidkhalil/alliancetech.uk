"use client";

import { useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseAuth, getDb } from "@/lib/firebase";
import { Loader2, LogOut, Inbox, FileWarning } from "lucide-react";

type LeadRow = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  clinicName?: string;
  clinicType?: string;
  message?: string;
  source?: string;
  website?: string;
  auditScore?: number;
  step?: number;
  completionStatus?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

function formatDate(ts?: Timestamp | null) {
  if (!ts?.toDate) return "—";
  return ts.toDate().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function LeadCard({ lead, incomplete }: { lead: LeadRow; incomplete?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-bold text-[#00283C] text-lg">{lead.name || "No name yet"}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {incomplete ? `Last updated ${formatDate(lead.updatedAt || lead.createdAt)}` : formatDate(lead.createdAt)}
          </p>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
            incomplete ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {incomplete ? `Incomplete · Step ${(lead.step ?? 0) + 1}` : "Submitted"}
        </span>
      </div>
      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <dt className="text-gray-400 text-xs">Phone</dt>
          <dd className="text-[#00283C] font-medium">{lead.phone || "—"}</dd>
        </div>
        <div>
          <dt className="text-gray-400 text-xs">Email</dt>
          <dd className="text-[#00283C] font-medium break-all">{lead.email || "—"}</dd>
        </div>
        <div>
          <dt className="text-gray-400 text-xs">Clinic</dt>
          <dd className="text-[#00283C] font-medium">{lead.clinicName || "—"}</dd>
        </div>
        <div>
          <dt className="text-gray-400 text-xs">Type</dt>
          <dd className="text-[#00283C] font-medium">{lead.clinicType || "—"}</dd>
        </div>
        {lead.website && (
          <div className="sm:col-span-2">
            <dt className="text-gray-400 text-xs">Website</dt>
            <dd className="text-[#0077A8] font-medium break-all">{lead.website}</dd>
          </div>
        )}
        {lead.auditScore != null && (
          <div>
            <dt className="text-gray-400 text-xs">Audit score</dt>
            <dd className="text-[#00283C] font-medium">{lead.auditScore}/100</dd>
          </div>
        )}
        <div>
          <dt className="text-gray-400 text-xs">Source</dt>
          <dd className="text-[#00283C] font-medium">{lead.source || "—"}</dd>
        </div>
        {lead.message && (
          <div className="sm:col-span-2">
            <dt className="text-gray-400 text-xs">Message</dt>
            <dd className="text-gray-600">{lead.message}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState<"completed" | "incomplete">("completed");
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [drafts, setDrafts] = useState<LeadRow[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(getFirebaseAuth(), async (u) => {
      if (!u) {
        setUser(null);
        setAuthReady(true);
        return;
      }
      const email = (u.email || "").toLowerCase();
      const token = await u.getIdTokenResult().catch(() => null);
      const isAdminClaim = token?.claims?.admin === true;
      const isDomainAdmin = u.emailVerified && email.endsWith("@alliancetechltd.com");
      if (!isAdminClaim && !isDomainAdmin) {
        await signOut(getFirebaseAuth());
        setLoginError("This account is not authorized for admin access.");
        setUser(null);
        setAuthReady(true);
        return;
      }
      setUser(u);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setLeads([]);
      setDrafts([]);
      return;
    }
    setLoadingData(true);
    const leadsQ = query(collection(getDb(), "leads"), orderBy("createdAt", "desc"));
    const draftsQ = query(collection(getDb(), "form_drafts"), orderBy("updatedAt", "desc"));

    const unsubLeads = onSnapshot(
      leadsQ,
      (snap) => {
        setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LeadRow)));
        setLoadingData(false);
      },
      () => setLoadingData(false)
    );
    const unsubDrafts = onSnapshot(draftsQ, (snap) => {
      setDrafts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LeadRow)));
    });

    return () => {
      unsubLeads();
      unsubDrafts();
    };
  }, [user]);

  const incompleteDrafts = useMemo(
    () => drafts.filter((d) => d.completionStatus !== "submitted"),
    [drafts]
  );

  const counts = useMemo(
    () => ({ completed: leads.length, incomplete: incompleteDrafts.length }),
    [leads, incompleteDrafts]
  );

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
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-6 h-6 animate-spin text-[#0077A8]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-lg p-8"
        >
          <h1 className="text-2xl font-extrabold text-[#00283C] mb-1">Admin Panel</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to view form submissions.</p>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#0077A8]"
          />
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#0077A8]"
          />
          {loginError && <p className="text-red-500 text-sm mb-3">{loginError}</p>}
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full py-3.5 rounded-xl bg-[#00283C] text-white font-bold text-sm hover:bg-[#003d5c] transition-colors disabled:opacity-60"
          >
            {loggingIn ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  const list = tab === "completed" ? leads : incompleteDrafts;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <p className="font-extrabold text-[#00283C]">Alliance Admin</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={() => signOut(getFirebaseAuth())}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#00283C] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setTab("completed")}
            className={`text-left rounded-2xl p-5 border transition-all ${
              tab === "completed"
                ? "border-[#0077A8] bg-white shadow-md"
                : "border-gray-100 bg-white/70 hover:border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Inbox className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-[#00283C]">Completed submissions</span>
            </div>
            <p className="text-3xl font-extrabold text-[#00283C]">{counts.completed}</p>
            <p className="text-xs text-gray-400 mt-1">Users who finished and submitted the form</p>
          </button>
          <button
            onClick={() => setTab("incomplete")}
            className={`text-left rounded-2xl p-5 border transition-all ${
              tab === "incomplete"
                ? "border-amber-400 bg-white shadow-md"
                : "border-gray-100 bg-white/70 hover:border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <FileWarning className="w-5 h-5 text-amber-600" />
              <span className="font-bold text-[#00283C]">Incomplete forms</span>
            </div>
            <p className="text-3xl font-extrabold text-[#00283C]">{counts.incomplete}</p>
            <p className="text-xs text-gray-400 mt-1">Users who filled some fields and left</p>
          </button>
        </div>

        <h2 className="text-lg font-bold text-[#00283C] mb-4">
          {tab === "completed" ? "Completed submissions" : "Incomplete / abandoned forms"}
        </h2>

        {loadingData ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#0077A8]" />
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-400 text-sm">
            No {tab === "completed" ? "completed submissions" : "incomplete forms"} yet.
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((lead) => (
              <LeadCard key={lead.id} lead={lead} incomplete={tab === "incomplete"} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
