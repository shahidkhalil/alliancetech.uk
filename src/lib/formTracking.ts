import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface FormFields {
  name: string;
  phone: string;
  email: string;
  clinicName: string;
  clinicType: string;
  message: string;
}

const SESSION_KEY = "alliance_form_session";
const DRAFT_INIT_KEY = "alliance_form_draft_init";

export function getFormSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function clearFormSessionId() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(DRAFT_INIT_KEY);
}

export function hasMeaningfulData(form: FormFields): boolean {
  return Boolean(
    form.clinicType ||
      form.name.trim() ||
      form.phone.trim() ||
      form.email.trim() ||
      form.clinicName.trim() ||
      form.message.trim()
  );
}

/** Save or update an abandoned/in-progress form draft (no read required). */
export async function saveFormDraft(
  sessionId: string,
  form: FormFields,
  step: number
) {
  if (!sessionId || !hasMeaningfulData(form)) return;
  const ref = doc(db, "form_drafts", sessionId);
  const isNew = localStorage.getItem(DRAFT_INIT_KEY) !== sessionId;
  await setDoc(
    ref,
    {
      ...form,
      step,
      source: "consultation_form",
      completionStatus: "partial",
      updatedAt: serverTimestamp(),
      ...(isNew ? { createdAt: serverTimestamp() } : {}),
    },
    { merge: true }
  );
  if (isNew) localStorage.setItem(DRAFT_INIT_KEY, sessionId);
}

/** Finalize a complete submission and remove the draft. */
export async function submitCompleteLead(form: FormFields, sessionId: string) {
  await addDoc(collection(db, "leads"), {
    ...form,
    source: "consultation_form",
    completionStatus: "complete",
    status: "new",
    createdAt: serverTimestamp(),
  });

  if (sessionId) {
    try {
      await deleteDoc(doc(db, "form_drafts", sessionId));
    } catch {
      // Draft may not exist yet
    }
  }
  clearFormSessionId();
}
