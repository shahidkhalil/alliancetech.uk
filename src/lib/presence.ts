"use client";

import { useEffect } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

const PRESENCE_KEY = "alliance_presence_id";

export function getPresenceSessionId() {
  try {
    let id = localStorage.getItem(PRESENCE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(PRESENCE_KEY, id);
    }
    return id;
  } catch {
    return `anon-${Date.now()}`;
  }
}

export async function heartbeatPresence(path: string, title?: string) {
  if (path.startsWith("/admin")) return;
  const id = getPresenceSessionId();
  const ref = doc(getDb(), "presence", id);
  const existing = await getDoc(ref);
  const payload: Record<string, unknown> = {
    path: path.slice(0, 300),
    title: (title || (typeof document !== "undefined" ? document.title : "")).slice(0, 200),
    referrer: (typeof document !== "undefined" ? document.referrer : "").slice(0, 400),
    userAgent: (typeof navigator !== "undefined" ? navigator.userAgent : "").slice(0, 400),
    updatedAt: serverTimestamp(),
  };
  if (!existing.exists()) payload.createdAt = serverTimestamp();
  await setDoc(ref, payload, { merge: true });
}
