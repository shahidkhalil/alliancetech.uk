import type { Timestamp } from "firebase/firestore";
import type { BlogPost, BlogSection } from "@/lib/blogData";

export type AdminTab =
  | "dashboard"
  | "leads"
  | "drafts"
  | "blog"
  | "visitors"
  | "database";

export type LeadRow = {
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
  status?: string;
  completionStatus?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

export type CmsBlogPost = BlogPost & {
  id: string;
  status: "draft" | "published";
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  contentText?: string;
};

export type PresenceRow = {
  id: string;
  path?: string;
  title?: string;
  referrer?: string;
  userAgent?: string;
  updatedAt?: Timestamp | null;
  createdAt?: Timestamp | null;
};

export type DbDocRow = {
  id: string;
  [key: string]: unknown;
};

export function formatAdminDate(ts?: Timestamp | null) {
  if (!ts?.toDate) return "—";
  return ts.toDate().toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export function sectionsFromPlainText(text: string): BlogSection[] {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length === 0) {
    return [{ heading: "Overview", paragraphs: ["Add your article content."] }];
  }
  return [
    {
      heading: "Article",
      paragraphs: blocks,
    },
  ];
}

export const LIVE_VISITOR_MS = 90_000;
