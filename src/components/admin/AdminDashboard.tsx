"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Inbox,
  FileWarning,
  Newspaper,
  Eye,
  Database,
  LogOut,
  Search,
  Plus,
  ImagePlus,
  Trash2,
  Save,
  X,
  ExternalLink,
  Loader2,
  Radio,
} from "lucide-react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getDb, getFirebaseStorage } from "@/lib/firebase";
import {
  formatAdminDate,
  LIVE_VISITOR_MS,
  sectionsFromPlainText,
  slugify,
  type AdminTab,
  type CmsBlogPost,
  type DbDocRow,
  type LeadRow,
  type PresenceRow,
} from "@/lib/adminTypes";
import type { User } from "firebase/auth";

const NAV: { id: AdminTab; label: string; icon: typeof Inbox }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Form leads", icon: Inbox },
  { id: "drafts", label: "Incomplete", icon: FileWarning },
  { id: "blog", label: "Blog CMS", icon: Newspaper },
  { id: "visitors", label: "Live visitors", icon: Eye },
  { id: "database", label: "Database", icon: Database },
];

const emptyBlog: {
  title: string;
  slug: string;
  excerpt: string;
  location: string;
  state: string;
  readTime: string;
  contentText: string;
  status: "draft" | "published";
  metaTitle: string;
  metaDescription: string;
  coverImageUrl: string;
} = {
  title: "",
  slug: "",
  excerpt: "",
  location: "Blackburn",
  state: "England",
  readTime: "5 min read",
  contentText: "",
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  coverImageUrl: "",
};

function StatCard({
  label,
  value,
  hint,
  accent,
  delay = 0,
}: {
  label: string;
  value: string | number;
  hint: string;
  accent: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{label}</p>
      <p className={`text-3xl font-extrabold mt-2 ${accent}`}>{value}</p>
      <p className="text-xs text-white/40 mt-1">{hint}</p>
    </motion.div>
  );
}

function LeadCard({ lead, incomplete }: { lead: LeadRow; incomplete?: boolean }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-bold text-[#00283C] text-lg">{lead.name || "No name yet"}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {incomplete
              ? `Last updated ${formatAdminDate(lead.updatedAt || lead.createdAt)}`
              : formatAdminDate(lead.createdAt)}
          </p>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
            incomplete ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {incomplete ? `Incomplete · Step ${(lead.step ?? 0) + 1}` : lead.status || "Submitted"}
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
    </motion.article>
  );
}

export default function AdminDashboard({
  user,
  onSignOut,
}: {
  user: User;
  onSignOut: () => void;
}) {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [drafts, setDrafts] = useState<LeadRow[]>([]);
  const [posts, setPosts] = useState<CmsBlogPost[]>([]);
  const [presence, setPresence] = useState<PresenceRow[]>([]);
  const [orders, setOrders] = useState<DbDocRow[]>([]);
  const [appointments, setAppointments] = useState<DbDocRow[]>([]);
  const [audits, setAudits] = useState<DbDocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [blogForm, setBlogForm] = useState(emptyBlog);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [blogBusy, setBlogBusy] = useState(false);
  const [blogMsg, setBlogMsg] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dbCollection, setDbCollection] = useState<"orders" | "appointments" | "audits">("orders");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubs = [
      onSnapshot(query(collection(getDb(), "leads"), orderBy("createdAt", "desc")), (snap) => {
        setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LeadRow)));
        setLoading(false);
      }),
      onSnapshot(query(collection(getDb(), "form_drafts"), orderBy("updatedAt", "desc")), (snap) => {
        setDrafts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LeadRow)));
      }),
      onSnapshot(query(collection(getDb(), "blog_posts"), orderBy("updatedAt", "desc")), (snap) => {
        setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CmsBlogPost)));
      }),
      onSnapshot(query(collection(getDb(), "presence"), orderBy("updatedAt", "desc"), limit(100)), (snap) => {
        setPresence(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PresenceRow)));
      }),
      onSnapshot(query(collection(getDb(), "orders"), limit(50)), (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(query(collection(getDb(), "appointments"), limit(50)), (snap) => {
        setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }),
      onSnapshot(query(collection(getDb(), "audits"), limit(50)), (snap) => {
        setAudits(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  const incomplete = useMemo(
    () => drafts.filter((d) => d.completionStatus !== "submitted"),
    [drafts]
  );

  const liveVisitors = useMemo(
    () =>
      presence.filter((p) => {
        const t = p.updatedAt?.toMillis?.() ?? 0;
        return now - t < LIVE_VISITOR_MS;
      }),
    [presence, now]
  );

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = tab === "drafts" ? incomplete : leads;
    if (!q) return list;
    return list.filter((l) =>
      [l.name, l.email, l.phone, l.clinicName, l.source, l.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [tab, leads, incomplete, search]);

  const uploadCoverImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setBlogMsg("Please choose an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setBlogMsg("Image must be under 5 MB.");
      return;
    }
    setUploadingImage(true);
    setBlogMsg("");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `blog-covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const storageRef = ref(getFirebaseStorage(), path);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      setBlogForm((p) => ({ ...p, coverImageUrl: url }));
      setBlogMsg("Cover image uploaded.");
    } catch {
      setBlogMsg("Image upload failed. Enable Storage in Firebase and deploy storage.rules.");
    } finally {
      setUploadingImage(false);
    }
  };

  const saveBlog = async () => {
    if (!blogForm.title.trim()) {
      setBlogMsg("Title is required.");
      return;
    }
    setBlogBusy(true);
    setBlogMsg("");
    try {
      const slug = blogForm.slug.trim() || slugify(blogForm.title);
      const sections = sectionsFromPlainText(blogForm.contentText);
      const payload = {
        slug,
        title: blogForm.title.trim(),
        excerpt: blogForm.excerpt.trim(),
        location: blogForm.location.trim() || "Blackburn",
        state: blogForm.state.trim() || "England",
        readTime: blogForm.readTime.trim() || "5 min read",
        date: new Date().toLocaleDateString("en-GB", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        imageGradient: "linear-gradient(135deg, #00283C 0%, #005C7A 50%, #00B4D8 100%)",
        coverImageUrl: blogForm.coverImageUrl.trim(),
        content: [] as string[],
        sections,
        metaTitle: blogForm.metaTitle.trim() || blogForm.title.trim(),
        metaDescription: blogForm.metaDescription.trim() || blogForm.excerpt.trim(),
        status: blogForm.status,
        updatedAt: serverTimestamp(),
      };
      if (editingId) {
        await updateDoc(doc(getDb(), "blog_posts", editingId), payload);
        setBlogMsg("Post updated.");
      } else {
        await addDoc(collection(getDb(), "blog_posts"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setBlogMsg("Post created.");
      }
      setBlogForm(emptyBlog);
      setEditingId(null);
    } catch {
      setBlogMsg("Could not save. Check Firestore rules/indexes.");
    } finally {
      setBlogBusy(false);
    }
  };

  const editBlog = (post: CmsBlogPost) => {
    setEditingId(post.id);
    setBlogForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      location: post.location || "Blackburn",
      state: post.state || "England",
      readTime: post.readTime || "5 min read",
      contentText:
        post.contentText ||
        post.sections?.flatMap((s) => s.paragraphs).join("\n\n") ||
        (post.content || []).join("\n\n"),
      status: post.status || "draft",
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
      coverImageUrl: post.coverImageUrl || "",
    });
    setTab("blog");
  };

  const removeBlog = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    await deleteDoc(doc(getDb(), "blog_posts", id));
  };

  const dbRows =
    dbCollection === "orders" ? orders : dbCollection === "appointments" ? appointments : audits;

  return (
    <div className="min-h-screen bg-[#071018] text-white flex">
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-[#0B1520]">
        <div className="p-6 border-b border-white/10">
          <p className="text-lg font-extrabold tracking-tight">Alliance Admin</p>
          <p className="text-xs text-white/40 mt-1 truncate">{user.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active ? "bg-[#0077A8] text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {item.id === "visitors" && liveVisitors.length > 0 && (
                  <span className="ml-auto text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full">
                    {liveVisitors.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={onSignOut}
          className="m-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/50 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B1520]/90 backdrop-blur px-4 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="lg:hidden flex gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${
                  tab === item.id ? "bg-[#0077A8]" : "bg-white/5 text-white/60"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm text-white/50">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            {liveVisitors.length} live now
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white"
          >
            View site <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            {tab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl font-extrabold">Dashboard</h1>
                  <p className="text-sm text-white/50 mt-1">Realtime overview of your UK site.</p>
                </div>
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <StatCard label="Form leads" value={leads.length} hint="Completed submissions" accent="text-emerald-300" />
                  <StatCard label="Incomplete" value={incomplete.length} hint="Abandoned forms" accent="text-amber-300" delay={0.05} />
                  <StatCard label="Live visitors" value={liveVisitors.length} hint="Active in last 90s" accent="text-sky-300" delay={0.1} />
                  <StatCard label="Blog posts" value={posts.length} hint="Drafts + published" accent="text-violet-300" delay={0.15} />
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h2 className="font-bold mb-3">Latest leads</h2>
                    <div className="space-y-3">
                      {leads.slice(0, 5).map((l) => (
                        <div key={l.id} className="rounded-xl bg-black/20 px-3 py-2.5 text-sm">
                          <p className="font-semibold">{l.name || "Unknown"} · {l.source || "—"}</p>
                          <p className="text-white/40 text-xs">{formatAdminDate(l.createdAt)}</p>
                        </div>
                      ))}
                      {leads.length === 0 && <p className="text-sm text-white/40">No leads yet.</p>}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h2 className="font-bold mb-3">Live pages</h2>
                    <div className="space-y-3">
                      {liveVisitors.slice(0, 6).map((v) => (
                        <div key={v.id} className="rounded-xl bg-black/20 px-3 py-2.5 text-sm flex justify-between gap-3">
                          <span className="font-medium truncate">{v.path || "/"}</span>
                          <span className="text-emerald-300 text-xs shrink-0">live</span>
                        </div>
                      ))}
                      {liveVisitors.length === 0 && (
                        <p className="text-sm text-white/40">No active visitors right now.</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {(tab === "leads" || tab === "drafts") && (
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-extrabold">
                      {tab === "leads" ? "Form leads" : "Incomplete forms"}
                    </h1>
                    <p className="text-sm text-white/50 mt-1">
                      {tab === "leads"
                        ? "Everyone who submitted a form — realtime from Firestore."
                        : "Users who started a form and left."}
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search name, email, phone…"
                      className="pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm outline-none focus:border-[#0077A8] w-full sm:w-72"
                    />
                  </div>
                </div>
                {loading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-[#00B4D8]" />
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-white/40 text-sm">
                    Nothing to show.
                  </div>
                ) : (
                  <div className="space-y-4 text-[#00283C]">
                    {filteredLeads.map((lead) => (
                      <LeadCard key={lead.id} lead={lead} incomplete={tab === "drafts"} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === "blog" && (
              <motion.div
                key="blog"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid lg:grid-cols-2 gap-6"
              >
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-extrabold">{editingId ? "Edit post" : "New blog post"}</h1>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setBlogForm(emptyBlog);
                        }}
                        className="text-xs text-white/50 hover:text-white inline-flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel edit
                      </button>
                    )}
                  </div>
                  {(
                    [
                      ["title", "Title"],
                      ["slug", "Slug (optional)"],
                      ["excerpt", "Excerpt"],
                      ["metaTitle", "SEO title"],
                      ["metaDescription", "SEO description"],
                      ["location", "City"],
                      ["state", "Region"],
                      ["readTime", "Read time"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key}>
                      <label className="text-[11px] uppercase tracking-wide text-white/40 font-semibold">{label}</label>
                      <input
                        value={blogForm[key]}
                        onChange={(e) => {
                          const value = e.target.value;
                          setBlogForm((p) => ({
                            ...p,
                            [key]: value,
                            ...(key === "title" && !editingId ? { slug: slugify(value) } : {}),
                          }));
                        }}
                        className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black/20 border border-white/10 text-sm outline-none focus:border-[#0077A8]"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-[11px] uppercase tracking-wide text-white/40 font-semibold">
                      Cover image
                    </label>
                    <div className="mt-2 rounded-xl border border-dashed border-white/20 bg-black/20 p-4">
                      {blogForm.coverImageUrl ? (
                        <div className="space-y-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={blogForm.coverImageUrl}
                            alt="Cover preview"
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <div className="flex flex-wrap gap-2">
                            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-xs font-bold cursor-pointer hover:bg-white/15">
                              <ImagePlus className="w-3.5 h-3.5" />
                              Change image
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingImage}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) uploadCoverImage(file);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setBlogForm((p) => ({ ...p, coverImageUrl: "" }))}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold hover:bg-red-500/30"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 py-6 cursor-pointer text-center">
                          {uploadingImage ? (
                            <Loader2 className="w-6 h-6 animate-spin text-[#00B4D8]" />
                          ) : (
                            <ImagePlus className="w-6 h-6 text-[#00B4D8]" />
                          )}
                          <span className="text-sm font-semibold text-white/80">
                            {uploadingImage ? "Uploading…" : "Click to upload cover image"}
                          </span>
                          <span className="text-[11px] text-white/40">JPG, PNG or WebP · max 5 MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingImage}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadCoverImage(file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wide text-white/40 font-semibold">
                      Body (paragraphs separated by blank lines)
                    </label>
                    <textarea
                      value={blogForm.contentText}
                      onChange={(e) => setBlogForm((p) => ({ ...p, contentText: e.target.value }))}
                      rows={8}
                      className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black/20 border border-white/10 text-sm outline-none focus:border-[#0077A8]"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={blogForm.status}
                      onChange={(e) =>
                        setBlogForm((p) => ({
                          ...p,
                          status: e.target.value as "draft" | "published",
                        }))
                      }
                      className="px-3 py-2.5 rounded-xl bg-black/20 border border-white/10 text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                    <button
                      type="button"
                      disabled={blogBusy}
                      onClick={saveBlog}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0077A8] font-bold text-sm hover:bg-[#0090c7] disabled:opacity-50"
                    >
                      {blogBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {editingId ? "Update" : "Create"}
                    </button>
                  </div>
                  {blogMsg && <p className="text-sm text-sky-300">{blogMsg}</p>}
                  <p className="text-xs text-white/35">
                    Published posts appear on the public blog list. CMS-only URLs:{" "}
                    <code className="text-white/60">/blog/cms?slug=your-slug</code>
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold">All posts</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setBlogForm(emptyBlog);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#00B4D8]"
                    >
                      <Plus className="w-3.5 h-3.5" /> New
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
                    {posts.map((post) => (
                      <div key={post.id} className="rounded-xl bg-black/20 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">{post.title}</p>
                            <p className="text-[11px] text-white/40 mt-0.5">
                              {post.status} · {post.slug}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => editBlog(post)}
                              className="text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeBlog(post.id)}
                              className="text-xs px-2 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {posts.length === 0 && (
                      <p className="text-sm text-white/40">No CMS posts yet — create your first one.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "visitors" && (
              <motion.div
                key="visitors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                <div>
                  <h1 className="text-2xl font-extrabold">Live visitors</h1>
                  <p className="text-sm text-white/50 mt-1">
                    Sessions that sent a heartbeat in the last 90 seconds.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-4 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="font-bold text-emerald-200">{liveVisitors.length} people on the site now</p>
                </div>
                <div className="space-y-3">
                  {liveVisitors.map((v) => (
                    <div key={v.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="font-semibold">{v.path || "/"}</p>
                      <p className="text-xs text-white/40 mt-1">{v.title || "—"}</p>
                      <p className="text-xs text-white/30 mt-2">
                        Updated {formatAdminDate(v.updatedAt)}
                        {v.referrer ? ` · from ${v.referrer}` : ""}
                      </p>
                    </div>
                  ))}
                  {liveVisitors.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-white/40 text-sm">
                      Open the public site in another tab to see live presence here.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {tab === "database" && (
              <motion.div
                key="database"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                <div>
                  <h1 className="text-2xl font-extrabold">Database</h1>
                  <p className="text-sm text-white/50 mt-1">
                    Orders, appointments, and audits stored by Cloud Functions.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["orders", "appointments", "audits"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDbCollection(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${
                        dbCollection === c ? "bg-[#0077A8]" : "bg-white/5 text-white/60"
                      }`}
                    >
                      {c} (
                      {c === "orders" ? orders.length : c === "appointments" ? appointments.length : audits.length})
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {dbRows.map((row) => (
                    <pre
                      key={row.id}
                      className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs overflow-auto text-white/70"
                    >
                      {JSON.stringify(row, null, 2)}
                    </pre>
                  ))}
                  {dbRows.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-white/40 text-sm">
                      No documents in `{dbCollection}` yet.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
