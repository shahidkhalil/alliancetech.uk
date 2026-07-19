import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";

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
  const ref = doc(getDb(), "form_drafts", sessionId);
  const isNew = localStorage.getItem(DRAFT_INIT_KEY) !== sessionId;
  await setDoc(
    ref,
    {
      name: form.name.trim().slice(0, 120),
      phone: form.phone.trim().slice(0, 40),
      email: form.email.trim().slice(0, 160),
      clinicName: form.clinicName.trim().slice(0, 160),
      clinicType: form.clinicType.trim().slice(0, 80),
      message: form.message.trim().slice(0, 2000),
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

/** Finalize a complete submission and close the draft (no client delete). */
export async function submitCompleteLead(form: FormFields, sessionId: string) {
  await addDoc(collection(getDb(), "leads"), {
    name: form.name.trim().slice(0, 120),
    phone: form.phone.trim().slice(0, 40),
    email: form.email.trim().slice(0, 160),
    clinicName: form.clinicName.trim().slice(0, 160),
    clinicType: form.clinicType.trim().slice(0, 80),
    message: form.message.trim().slice(0, 2000),
    source: "consultation_form",
    completionStatus: "complete",
    status: "new",
    createdAt: serverTimestamp(),
  });

  if (sessionId) {
    try {
      await setDoc(
        doc(getDb(), "form_drafts", sessionId),
        {
          completionStatus: "submitted",
          updatedAt: serverTimestamp(),
          submittedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch {
      // Draft may not exist yet
    }
  }
  clearFormSessionId();
}
