"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneOff,
  Loader2,
  Mic,
  CalendarCheck2,
  User,
  Phone,
  Mail,
  Stethoscope,
  Clock,
  Check,
} from "lucide-react";
import {
  BookingDraft,
  EMPTY_DRAFT,
  BOOKING_DAYS,
  BOOKING_TIMES,
  extractBookingDraft,
  mergeDraft,
  parseBookingSchedule,
} from "@/lib/bookingExtract";
import { trackDemoComplete, trackDemoStart, trackEvent } from "@/lib/analytics";
import { bookUrl } from "@/lib/receptionistEndpoints";
import {
  formatPhoneDigits,
  groupedSpokenDigits,
  isNameLike,
  isRecallReady,
  LIVE_CALL_BEHAVIOR_RULES,
  LIVE_STT_PROMPT,
  normalizeEmailFromSpeech,
  pickTranscript,
  speechToDigits,
  type RecallSnapshot,
} from "@/lib/speechDetails";

const LIVE_SERVICES = [
  "Consultation & Check-up",
  "Scaling & Polishing",
  "Tooth Filling",
  "Root Canal",
  "Dental Implants",
  "Braces (Orthodontics)",
  "Clear Aligners",
  "Teeth Whitening",
  "Veneers",
  "Wisdom Tooth Extraction",
];

type CallState = "connecting" | "live" | "ended" | "error";
type RecallField = "name" | "phone" | "email" | "other";

interface Props {
  onClose: () => void;
}

type FnCall = { type?: string; name?: string; call_id?: string; arguments?: string };

type ConfirmationFlags = {
  nameConfirmed: boolean;
  phoneConfirmed: boolean;
  emailConfirmed: boolean | "skipped";
  serviceConfirmed: boolean;
  scheduleConfirmed: boolean;
};

type ConfirmedValues = {
  name: string;
  phone: string;
  email: string;
  service: string;
  preferredTime: string;
};

const EMPTY_CONFIRMED: ConfirmedValues = {
  name: "",
  phone: "",
  email: "",
  service: "",
  preferredTime: "",
};

const EMPTY_FLAGS: ConfirmationFlags = {
  nameConfirmed: false,
  phoneConfirmed: false,
  emailConfirmed: false,
  serviceConfirmed: false,
  scheduleConfirmed: false,
};

/** Wait longer so gpt-4o-transcribe can finish before Maya reads back. */
const STT_WAIT_MS = 450;
const STT_MAX_WAIT_MS = 4500;

function digitsOnly(text: string) {
  return speechToDigits(text) || (text.match(/\d/g) || []).join("");
}

function recallInstruction(field: string, picked: RecallSnapshot, ready: boolean): string {
  if (!ready) {
    return "Transcript unclear — ask them to repeat once slowly, digit-by-digit for phone / letter-by-letter for email, or suggest they type it in the on-screen card.";
  }
  if (field === "phone") {
    return `Read back using ONLY these digit groups ONCE (do not invent digits): "${groupedSpokenDigits(picked.digits)}". If they say yes, call confirm_field(phone) immediately. NEVER invent or guess a digit.`;
  }
  if (field === "email") {
    return `Spell back letter-by-letter once from spelled_email only: "I have ${picked.spelled_email} — is that right?" If yes, confirm_field(email). Never invent letters.`;
  }
  if (field === "name") {
    return `Confirm the exact name once: "Got it — ${picked.text}?" If yes, confirm_field(name). Never invent a surname.`;
  }
  return "Confirm this exact text once. If they say yes, call confirm_field for that field.";
}

function isFieldLocked(field: string, flags: ConfirmationFlags): boolean {
  if (field === "name") return flags.nameConfirmed;
  if (field === "phone") return flags.phoneConfirmed;
  if (field === "email") return flags.emailConfirmed === true || flags.emailConfirmed === "skipped";
  return false;
}

function nextStepHint(flags: ConfirmationFlags): string {
  if (!flags.nameConfirmed) return "Collect full name only.";
  if (!flags.phoneConfirmed) return "Collect phone number only — one read-back, then confirm_field(phone).";
  if (flags.emailConfirmed !== "skipped" && flags.emailConfirmed !== true) {
    return "Ask for email (optional) or skip it. Do NOT ask for name or phone again.";
  }
  if (!flags.serviceConfirmed) return "Confirm service. Do NOT ask for name or phone again.";
  if (!flags.scheduleConfirmed) return "Collect preferred day and time. Do NOT ask for name or phone again.";
  return "Give one summary, ask 'Shall I book that?', then call book_appointment. Do NOT re-collect name or phone.";
}

function sessionStatus(flags: ConfirmationFlags, confirmed: ConfirmedValues) {
  return {
    confirmed_fields: {
      name: flags.nameConfirmed ? confirmed.name : null,
      phone: flags.phoneConfirmed ? formatPhoneDigits(confirmed.phone) : null,
      email:
        flags.emailConfirmed === "skipped"
          ? "(skipped)"
          : flags.emailConfirmed === true
            ? confirmed.email
            : null,
      service: flags.serviceConfirmed ? confirmed.service : null,
      schedule: flags.scheduleConfirmed ? confirmed.preferredTime : null,
    },
    next_step: nextStepHint(flags),
  };
}

const YES_TRANSCRIPT = /^(yes|yeah|yep|yup|correct|right|that's right|that is right|absolutely|sure|ok|okay)\.?$/i;

async function waitForTranscript(
  field: string,
  getTranscripts: () => string[],
  getSinceIndex: () => number,
  initialCount: number
): Promise<RecallSnapshot> {
  let picked = pickTranscript(field, getTranscripts(), getSinceIndex());
  if (isRecallReady(field, picked)) return picked;

  let waited = 0;
  let best = picked;
  while (waited < STT_MAX_WAIT_MS) {
    await sleep(STT_WAIT_MS);
    waited += STT_WAIT_MS;
    picked = pickTranscript(field, getTranscripts(), getSinceIndex());
    // Keep the richest phone digit string seen while waiting
    if (field === "phone" && picked.digits.length > best.digits.length) best = picked;
    else if (field === "email" && picked.text.length > best.text.length) best = picked;
    else if (field === "name" && picked.text.split(/\s+/).length >= best.text.split(/\s+/).length) best = picked;
    else if (!best.text && picked.text) best = picked;

    if (isRecallReady(field, picked)) return picked;
    if (getTranscripts().length > initialCount && isRecallReady(field, best)) return best;
  }
  return isRecallReady(field, best) ? best : pickTranscript(field, getTranscripts(), getSinceIndex());
}

function friendlyFetchError(err: unknown, step: string): string {
  if (err instanceof TypeError && /failed to fetch|networkerror|load failed/i.test(err.message)) {
    return `Could not reach the live-call server (${step}). Check your connection, disable ad-block for this page, then tap Retry — or use Chat with Maya.`;
  }
  if (err instanceof Error) return err.message;
  return `Couldn't start the call (${step}).`;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Maya voice session token — alliance-tech-656ba Cloud Functions. */
const SESSION_URL =
  process.env.NEXT_PUBLIC_REALTIME_TOKEN_ENDPOINT ||
  "https://asia-south1-alliance-tech-656ba.cloudfunctions.net/realtimeToken";

async function postJsonOnce(url: string, body: unknown, signal?: AbortSignal) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    mode: "cors",
    credentials: "omit",
    cache: "no-store",
    signal,
  });
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(String(data.error || "Daily live-call limit reached — please use Chat with Maya."));
    }
    if (res.status === 404 || res.status === 502 || res.status === 503) {
      throw new Error("Live voice is temporarily unavailable. Please use Chat with Maya.");
    }
    throw new Error(String(data.error || `Server error (${res.status})`));
  }
  return data;
}

async function postJson(url: string, body: unknown, step = "token") {
  const urls = Array.from(new Set([url, SESSION_URL].filter(Boolean)));
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    for (const u of urls) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 25000);
      try {
        return await postJsonOnce(u, body, ctrl.signal);
      } catch (err) {
        lastErr = err;
        if (err instanceof DOMException && err.name === "AbortError") {
          lastErr = new Error(`Timed out reaching the live-call server (${step}).`);
        }
      } finally {
        clearTimeout(timer);
      }
    }
    if (attempt < 2) await sleep(600 * (attempt + 1));
  }
  throw new Error(friendlyFetchError(lastErr, step));
}

function buildPreferredTime(draft: BookingDraft, confirmed: ConfirmedValues): string {
  if (draft.day && draft.time) return `${draft.day} at ${draft.time}`;
  return confirmed.preferredTime;
}

function buildBookingPayload(
  draft: BookingDraft,
  confirmed: ConfirmedValues
): { name: string; phone: string; email: string; service: string; preferredTime: string } {
  const phoneDigits = digitsOnly(draft.phone || confirmed.phone);
  return {
    name: (draft.name.trim() || confirmed.name).slice(0, 80),
    phone: formatPhoneDigits(phoneDigits || confirmed.phone).slice(0, 30),
    email: (draft.email.trim() || confirmed.email).slice(0, 120),
    service: (draft.service || confirmed.service).slice(0, 80),
    preferredTime: buildPreferredTime(draft, confirmed).slice(0, 120),
  };
}

function canBook(payload: ReturnType<typeof buildBookingPayload>, flags: ConfirmationFlags, draft: BookingDraft): { ok: boolean; reason: string } {
  if (!payload.name || payload.name.length < 2) {
    return { ok: false, reason: "Name is not confirmed yet. Ask for their full name, recall it, and call confirm_field(name) after they say yes." };
  }
  if (digitsOnly(payload.phone).length < 10) {
    return { ok: false, reason: "Phone is not confirmed yet. Ask for their number, recall it, read it back in digit groups, and call confirm_field(phone) after they say yes." };
  }
  if (!payload.service) {
    return { ok: false, reason: "Service is not confirmed. Ask which service they need and call confirm_field(service)." };
  }
  if (!payload.preferredTime) {
    return { ok: false, reason: "Day and time are not confirmed. Ask for preferred day and time, then call confirm_field(schedule)." };
  }

  const nameOk = flags.nameConfirmed || draft.name.trim().length >= 2;
  const phoneOk = flags.phoneConfirmed || digitsOnly(draft.phone).length >= 10;
  const emailOk =
    !payload.email ||
    flags.emailConfirmed === true ||
    flags.emailConfirmed === "skipped";
  const emailHandled = flags.emailConfirmed === "skipped" || flags.emailConfirmed === true || !payload.email;
  const serviceOk = flags.serviceConfirmed || !!draft.service;
  const scheduleOk = flags.scheduleConfirmed || (!!draft.day && !!draft.time);

  if (!nameOk) {
    return { ok: false, reason: "Name has not been confirmed. Use recall_last_spoken_text then confirm_field(name) after they say yes, or ask them to type it on screen." };
  }
  if (!phoneOk) {
    return { ok: false, reason: "Phone has not been confirmed. Use recall_last_spoken_text then confirm_field(phone) after they say yes, or ask them to type it on screen." };
  }
  if (payload.email && flags.emailConfirmed !== true) {
    return { ok: false, reason: "Email was given but not confirmed. Spell it back letter-by-letter and call confirm_field(email)." };
  }
  if (!emailHandled) {
    return { ok: false, reason: "Ask if they want to provide an email. If they decline, call confirm_field(email) with email_skipped true." };
  }
  if (!serviceOk) {
    return { ok: false, reason: "Service is not confirmed. Call confirm_field(service) after they choose a service." };
  }
  if (!scheduleOk) {
    return { ok: false, reason: "Schedule is not confirmed. Call confirm_field(schedule) after day and time are agreed." };
  }
  return { ok: true, reason: "" };
}

export default function LiveCall({ onClose }: Props) {
  const [state, setState] = useState<CallState>("connecting");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [maxSeconds, setMaxSeconds] = useState(180);
  const [caption, setCaption] = useState("");
  const [mayaTalking, setMayaTalking] = useState(false);
  const [booked, setBooked] = useState<string | null>(null);
  const [draft, setDraft] = useState<BookingDraft>({ ...EMPTY_DRAFT });
  const [locks, setLocks] = useState({ name: false, phone: false, email: false, service: false });
  const [retryKey, setRetryKey] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captionRef = useRef("");
  const userTranscriptsRef = useRef<string[]>([]);
  const recallSinceIndexRef = useRef(0);
  const lastRecallRef = useRef<Partial<Record<RecallField, RecallSnapshot>>>({});
  const confirmedValuesRef = useRef<ConfirmedValues>({ ...EMPTY_CONFIRMED });
  const confirmationFlagsRef = useRef<ConfirmationFlags>({ ...EMPTY_FLAGS });
  const draftRef = useRef<BookingDraft>({ ...EMPTY_DRAFT });
  const hangUpRef = useRef<() => void>(() => {});
  const pendingRecallRef = useRef<{ field: RecallField } | null>(null);
  const bookingTrackedRef = useRef(false);
  const secondsRef = useRef(0);

  draftRef.current = draft;
  secondsRef.current = seconds;

  useEffect(() => {
    trackDemoStart({ demo_type: "ai_receptionist_voice", voice_used: true });
    trackEvent("appointment_booking_start", { channel: "voice" });
  }, []);

  const applyFieldConfirm = useCallback((field: RecallField | "service" | "schedule", opts?: { emailSkipped?: boolean }) => {
    const flags = { ...confirmationFlagsRef.current };
    const confirmed = { ...confirmedValuesRef.current };

    if (field === "name" && lastRecallRef.current.name?.text && isNameLike(lastRecallRef.current.name.text)) {
      flags.nameConfirmed = true;
      confirmed.name = lastRecallRef.current.name.text;
      setDraft((d) => mergeDraft(d, { name: confirmed.name }));
    } else if (field === "phone" && lastRecallRef.current.phone?.digits) {
      flags.phoneConfirmed = true;
      confirmed.phone = lastRecallRef.current.phone.digits;
      setDraft((d) => mergeDraft(d, { phone: formatPhoneDigits(confirmed.phone) }));
    } else if (field === "email") {
      if (opts?.emailSkipped) {
        flags.emailConfirmed = "skipped";
        confirmed.email = "";
        setDraft((d) => ({ ...d, email: "" }));
      } else if (lastRecallRef.current.email?.text) {
        flags.emailConfirmed = true;
        confirmed.email = lastRecallRef.current.email.text;
        setDraft((d) => mergeDraft(d, { email: confirmed.email }));
      }
    }

    confirmationFlagsRef.current = flags;
    confirmedValuesRef.current = confirmed;
    pendingRecallRef.current = null;
    setLocks({
      name: flags.nameConfirmed,
      phone: flags.phoneConfirmed,
      email: flags.emailConfirmed === true,
      service: flags.serviceConfirmed,
    });
    return { flags, confirmed };
  }, []);

  /** Sync service/day/time from speech only — name/phone/email come from recall+confirm or manual typing. */
  const syncDraftFromSpeech = useCallback((transcripts: string[]) => {
    const msgs = transcripts.map((t) => ({ role: "user", content: t }));
    const extracted = extractBookingDraft(msgs, LIVE_SERVICES);
    const flags = confirmationFlagsRef.current;

    setDraft((prev) => {
      const patch: Partial<BookingDraft> = {};
      if (!flags.serviceConfirmed && extracted.service) patch.service = extracted.service;
      if (!flags.scheduleConfirmed || !prev.day || !prev.time) {
        if (extracted.day) patch.day = extracted.day;
        if (extracted.time) patch.time = extracted.time;
      }
      // Never write extracted "name" from free chat into the card — too error-prone
      return mergeDraft(prev, patch);
    });
  }, []);

  /** Fill day/time (and service hints) from Maya's spoken summary. */
  const syncScheduleFromMayaSpeech = useCallback((text: string) => {
    if (!text.trim()) return;
    const { day, time } = parseBookingSchedule(text);
    const svc =
      LIVE_SERVICES.find((s) => text.toLowerCase().includes(s.toLowerCase().split(" ")[0])) ||
      (/consultation|check-?up/i.test(text) ? "Consultation & Check-up" : "");

    setDraft((prev) => {
      const patch: Partial<BookingDraft> = {};
      if (day && !prev.day) patch.day = day;
      if (time && !prev.time) patch.time = time;
      if (day && time) {
        confirmationFlagsRef.current = {
          ...confirmationFlagsRef.current,
          scheduleConfirmed: true,
        };
        confirmedValuesRef.current = {
          ...confirmedValuesRef.current,
          preferredTime: `${day} at ${time}`,
        };
      }
      if (svc && !prev.service && !confirmationFlagsRef.current.serviceConfirmed) {
        patch.service = svc;
      }
      return Object.keys(patch).length ? mergeDraft(prev, patch) : prev;
    });
  }, []);

  const updateDraftField = useCallback((field: keyof BookingDraft, value: string) => {
    setDraft((d) => {
      const next = { ...d, [field]: value };
      draftRef.current = next;

      const flags = { ...confirmationFlagsRef.current };
      const confirmed = { ...confirmedValuesRef.current };

      if (field === "name") {
        if (value.trim().length >= 2 && isNameLike(value)) {
          flags.nameConfirmed = true;
          confirmed.name = value.trim();
        } else {
          flags.nameConfirmed = false;
          confirmed.name = "";
        }
      } else if (field === "phone") {
        const phoneDigits = digitsOnly(value);
        if (phoneDigits.length >= 10) {
          flags.phoneConfirmed = true;
          confirmed.phone = phoneDigits;
        } else {
          flags.phoneConfirmed = false;
          confirmed.phone = "";
        }
      } else if (field === "email") {
        if (!value.trim()) {
          flags.emailConfirmed = "skipped";
          confirmed.email = "";
        } else {
          flags.emailConfirmed = true;
          confirmed.email = normalizeEmailFromSpeech(value);
        }
      } else if (field === "service") {
        if (value.trim()) {
          flags.serviceConfirmed = true;
          confirmed.service = value.trim();
        } else {
          flags.serviceConfirmed = false;
          confirmed.service = "";
        }
      } else if (field === "day" || field === "time") {
        if (next.day && next.time) {
          flags.scheduleConfirmed = true;
          confirmed.preferredTime = `${next.day} at ${next.time}`;
        } else {
          flags.scheduleConfirmed = false;
          confirmed.preferredTime = "";
        }
      }

      confirmationFlagsRef.current = flags;
      confirmedValuesRef.current = confirmed;
      setLocks({
        name: flags.nameConfirmed,
        phone: flags.phoneConfirmed,
        email: flags.emailConfirmed === true,
        service: flags.serviceConfirmed,
      });
      return next;
    });
  }, []);

  const hangUp = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    setState((s) => (s === "error" ? s : "ended"));
  }, []);

  hangUpRef.current = hangUp;

  useEffect(() => {
    let cancelled = false;
    let active = true;

    (async () => {
      try {
        const tokenData = await postJson(SESSION_URL, { clinicId: "demo" }, "session");
        if (cancelled || !active) return;
        const clientSecret = String(tokenData.clientSecret || "");
        const model = String(tokenData.model || "gpt-realtime-mini");
        const callMaxSeconds = Number(tokenData.maxSeconds) || 180;
        const baseInstructions = String(tokenData.instructions || "");
        if (!clientSecret) throw new Error("No session token — please try the chat.");
        setMaxSeconds(callMaxSeconds);

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;

        const remote = new Audio();
        remote.autoplay = true;
        audioRef.current = remote;
        pc.ontrack = (e) => {
          remote.srcObject = e.streams[0];
        };

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
          throw new Error("Microphone access is required for live calls — please allow mic access and try again.");
        });
        streamRef.current = stream;
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        const dc = pc.createDataChannel("oai-events");
        dc.onopen = () => {
          try {
            const session: Record<string, unknown> = {
              type: "realtime",
              audio: {
                input: {
                  transcription: {
                    model: "gpt-4o-transcribe",
                    language: "en",
                    prompt: LIVE_STT_PROMPT,
                  },
                  noise_reduction: { type: "near_field" },
                },
              },
            };
            // Only append behaviour rules when we have the server clinic instructions
            if (baseInstructions) {
              session.instructions = `${baseInstructions}\n\n${LIVE_CALL_BEHAVIOR_RULES}`;
            }
            dc.send(JSON.stringify({ type: "session.update", session }));
          } catch {
            /* session.update optional */
          }
        };
        dc.onmessage = async (e) => {
          try {
            const ev = JSON.parse(e.data);

            if (ev.type === "conversation.item.input_audio_transcription.completed") {
              const t = String(ev.transcript || "").trim();
              if (t) {
                userTranscriptsRef.current = [...userTranscriptsRef.current.slice(-11), t];
                syncDraftFromSpeech(userTranscriptsRef.current);
                syncScheduleFromMayaSpeech(t);

                const pending = pendingRecallRef.current;
                if (pending && YES_TRANSCRIPT.test(t)) {
                  const flags = confirmationFlagsRef.current;
                  if (pending.field === "name" && !flags.nameConfirmed) applyFieldConfirm("name");
                  else if (pending.field === "phone" && !flags.phoneConfirmed) applyFieldConfirm("phone");
                  else if (pending.field === "email" && flags.emailConfirmed !== true && flags.emailConfirmed !== "skipped") {
                    applyFieldConfirm("email");
                  }
                }
              }
            }

            if (ev.type === "response.audio_transcript.delta" || ev.type === "response.output_audio_transcript.delta") {
              captionRef.current += ev.delta || "";
              setCaption(captionRef.current.slice(-160));
              setMayaTalking(true);
              if (captionRef.current.length > 24) {
                syncScheduleFromMayaSpeech(captionRef.current);
              }
            }
            if (ev.type === "response.done") {
              setMayaTalking(false);
              if (captionRef.current) syncScheduleFromMayaSpeech(captionRef.current);
              captionRef.current = "";
              const calls = (ev.response?.output || []).filter(
                (o: FnCall) => o.type === "function_call" && o.name && o.call_id
              ) as FnCall[];
              if (!calls.length) return;

              for (const call of calls) {
                if (call.name === "recall_last_spoken_text") {
                  let args: { field?: string } = {};
                  try {
                    args = JSON.parse(call.arguments || "{}");
                  } catch {
                    /* ignore */
                  }
                  const field = (args.field || "other") as RecallField;
                  const flags = confirmationFlagsRef.current;
                  const confirmed = confirmedValuesRef.current;

                  if (isFieldLocked(field, flags)) {
                    const status = sessionStatus(flags, confirmed);
                    const lockedPhone = formatPhoneDigits(confirmed.phone);
                    const output = {
                      ready: true,
                      field,
                      already_confirmed: true,
                      text: field === "phone" ? lockedPhone : field === "name" ? confirmed.name : confirmed.email,
                      instruction: `STOP — ${field} is already confirmed and locked. Do NOT ask for or read back ${field} again. ${status.next_step}`,
                      ...status,
                    };
                    dc.send(
                      JSON.stringify({
                        type: "conversation.item.create",
                        item: { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(output) },
                      })
                    );
                    continue;
                  }

                  recallSinceIndexRef.current =
                    field === "name"
                      ? Math.max(0, userTranscriptsRef.current.length - 12)
                      : Math.max(0, userTranscriptsRef.current.length - 1);
                  const initialCount = userTranscriptsRef.current.length;

                  const picked = await waitForTranscript(
                    field,
                    () => userTranscriptsRef.current,
                    () => recallSinceIndexRef.current,
                    initialCount
                  );

                  if (field === "name" || field === "phone" || field === "email") {
                    lastRecallRef.current[field] = picked;
                  }

                  const ready = isRecallReady(field, picked);

                  if (ready && field === "name" && !flags.nameConfirmed && isNameLike(picked.text)) {
                    setDraft((d) => mergeDraft(d, { name: picked.text }));
                  } else if (ready && field === "phone" && !flags.phoneConfirmed) {
                    setDraft((d) => mergeDraft(d, { phone: formatPhoneDigits(picked.digits) }));
                  } else if (ready && field === "email" && flags.emailConfirmed !== true && flags.emailConfirmed !== "skipped") {
                    setDraft((d) => mergeDraft(d, { email: picked.text }));
                  }

                  if (ready && (field === "name" || field === "phone" || field === "email")) {
                    pendingRecallRef.current = { field };
                  }

                  const status = sessionStatus(confirmationFlagsRef.current, confirmedValuesRef.current);
                  const output = {
                    ready,
                    field,
                    text: picked.text,
                    digits: picked.digits,
                    spoken_digits: picked.spoken_digits,
                    grouped_spoken_digits: groupedSpokenDigits(picked.digits),
                    spelled_email: picked.spelled_email,
                    instruction: recallInstruction(field, picked, ready),
                    ...status,
                  };
                  dc.send(
                    JSON.stringify({
                      type: "conversation.item.create",
                      item: { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(output) },
                    })
                  );
                }

                if (call.name === "confirm_field") {
                  let args: {
                    field?: string;
                    confirmed?: boolean;
                    email_skipped?: boolean;
                    service?: string;
                    preferredTime?: string;
                  } = {};
                  try {
                    args = JSON.parse(call.arguments || "{}");
                  } catch {
                    /* ignore */
                  }

                  const flags = { ...confirmationFlagsRef.current };
                  const confirmed = { ...confirmedValuesRef.current };
                  const currentDraft = draftRef.current;
                  let output: Record<string, unknown> = { success: false, field: args.field };

                  if (args.field === "name" && flags.nameConfirmed) {
                    output = {
                      success: true,
                      already_confirmed: true,
                      field: "name",
                      value: confirmed.name,
                      instruction: "Name already confirmed. Do NOT ask again. " + nextStepHint(flags),
                      ...sessionStatus(flags, confirmed),
                    };
                  } else if (
                    args.field === "name" &&
                    args.confirmed &&
                    lastRecallRef.current.name?.text &&
                    isNameLike(lastRecallRef.current.name.text)
                  ) {
                    flags.nameConfirmed = true;
                    confirmed.name = lastRecallRef.current.name.text;
                    setDraft((d) => mergeDraft(d, { name: confirmed.name }));
                    pendingRecallRef.current = null;
                    output = {
                      success: true,
                      field: "name",
                      value: confirmed.name,
                      locked: true,
                      instruction: "Name is locked. Do NOT ask for name again. Ask for phone number next.",
                      ...sessionStatus(flags, confirmed),
                    };
                  } else if (args.field === "name" && args.confirmed && !isNameLike(lastRecallRef.current.name?.text || "")) {
                    output = {
                      success: false,
                      field: "name",
                      reason: "That was not a person name (sounds like a service). Ask for their full name again and call recall_last_spoken_text(name).",
                    };
                  } else if (args.field === "phone" && flags.phoneConfirmed) {
                    output = {
                      success: true,
                      already_confirmed: true,
                      field: "phone",
                      value: formatPhoneDigits(confirmed.phone),
                      instruction: "Phone already confirmed. Do NOT mention phone again. " + nextStepHint(flags),
                      ...sessionStatus(flags, confirmed),
                    };
                  } else if (args.field === "phone" && args.confirmed && lastRecallRef.current.phone?.digits) {
                    flags.phoneConfirmed = true;
                    confirmed.phone = lastRecallRef.current.phone.digits;
                    setDraft((d) => mergeDraft(d, { phone: formatPhoneDigits(confirmed.phone) }));
                    pendingRecallRef.current = null;
                    output = {
                      success: true,
                      field: "phone",
                      value: formatPhoneDigits(confirmed.phone),
                      locked: true,
                      instruction: "Phone is locked. Do NOT ask for or read back the phone number again. Ask about email (optional) or preferred day and time next.",
                      ...sessionStatus(flags, confirmed),
                    };
                  } else if (args.field === "email") {
                    if (args.email_skipped) {
                      flags.emailConfirmed = "skipped";
                      confirmed.email = "";
                      setDraft((d) => ({ ...d, email: "" }));
                      output = { success: true, field: "email", skipped: true };
                    } else if (args.confirmed && lastRecallRef.current.email?.text) {
                      flags.emailConfirmed = true;
                      confirmed.email = lastRecallRef.current.email.text;
                      setDraft((d) => mergeDraft(d, { email: confirmed.email }));
                      output = { success: true, field: "email", value: confirmed.email };
                    }
                  } else if (args.field === "service" && args.confirmed) {
                    const svc = (currentDraft.service || args.service || "").trim();
                    if (svc) {
                      flags.serviceConfirmed = true;
                      confirmed.service = svc;
                      setDraft((d) => mergeDraft(d, { service: svc }));
                      output = { success: true, field: "service", value: svc };
                    }
                  } else if (args.field === "schedule" && args.confirmed) {
                    const pref =
                      currentDraft.day && currentDraft.time
                        ? `${currentDraft.day} at ${currentDraft.time}`
                        : (args.preferredTime || "").trim();
                    if (pref) {
                      flags.scheduleConfirmed = true;
                      confirmed.preferredTime = pref;
                      const parsed = parseBookingSchedule(pref);
                      setDraft((d) =>
                        mergeDraft(d, {
                          day: parsed.day || d.day,
                          time: parsed.time || d.time,
                        })
                      );
                      output = { success: true, field: "schedule", value: pref };
                    }
                  } else if (!args.confirmed) {
                    if (args.field === "name") flags.nameConfirmed = false;
                    if (args.field === "phone") flags.phoneConfirmed = false;
                    if (args.field === "email") flags.emailConfirmed = false;
                    output = { success: true, field: args.field, corrected: true };
                  }

                  confirmationFlagsRef.current = flags;
                  confirmedValuesRef.current = confirmed;
                  setLocks({
                    name: flags.nameConfirmed,
                    phone: flags.phoneConfirmed,
                    email: flags.emailConfirmed === true,
                    service: flags.serviceConfirmed,
                  });
                  dc.send(
                    JSON.stringify({
                      type: "conversation.item.create",
                      item: { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(output) },
                    })
                  );
                }

                if (call.name === "book_appointment") {
                  const llmArgs = JSON.parse(call.arguments || "{}");
                  const payload = buildBookingPayload(draftRef.current, confirmedValuesRef.current);
                  const gate = canBook(payload, confirmationFlagsRef.current, draftRef.current);

                  let output: Record<string, unknown> = { booked: false, reference: "" };

                  if (!gate.ok) {
                    output = { booked: false, reason: gate.reason };
                  } else {
                    try {
                      const br = await fetch(bookUrl(), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: payload.name,
                          phone: payload.phone,
                          email: payload.email,
                          service: payload.service,
                          preferredTime: payload.preferredTime,
                          notes: llmArgs.notes ? String(llmArgs.notes).slice(0, 300) : "",
                          clinicId: "demo",
                        }),
                      });
                      const bd = await br.json();
                      if (br.ok && bd.booked) {
                        output = { booked: true, reference: bd.reference };
                        const bookedLabel = `${payload.service} · ${payload.preferredTime} (Ref ${bd.reference})`;
                        setBooked(bookedLabel);
                        if (!bookingTrackedRef.current) {
                          bookingTrackedRef.current = true;
                          trackDemoComplete({
                            demo_type: "ai_receptionist_voice",
                            voice_used: true,
                            messages_sent: userTranscriptsRef.current.length,
                            duration: secondsRef.current,
                          });
                          trackEvent("appointment_booking_complete", { channel: "voice" });
                          trackEvent("generate_lead", { lead_source: "ai_receptionist_voice" });
                        }
                        // End call shortly after booking so Maya can finish her confirmation line.
                        setTimeout(() => hangUpRef.current(), 3000);
                      } else {
                        output = { booked: false, reason: bd.error || "Booking failed." };
                      }
                    } catch {
                      output = { booked: false, reason: "Could not reach booking server." };
                    }
                  }

                  dc.send(
                    JSON.stringify({
                      type: "conversation.item.create",
                      item: { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(output) },
                    })
                  );
                }
              }

              dc.send(JSON.stringify({ type: "response.create" }));
            }
          } catch {
            /* non-JSON frames ignored */
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        let sdpRes: Response;
        try {
          sdpRes = await fetch(`https://api.openai.com/v1/realtime/calls?model=${model}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${clientSecret}`, "Content-Type": "application/sdp" },
            body: offer.sdp,
          });
        } catch (err) {
          throw new Error(friendlyFetchError(err, "voice connection"));
        }
        if (!sdpRes.ok) {
          const detail = (await sdpRes.text()).slice(0, 120);
          throw new Error(`Voice connection failed (${sdpRes.status})${detail ? `: ${detail}` : ""}`);
        }
        await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });
        if (cancelled || !active) return;

        setState("live");
        timerRef.current = setInterval(() => {
          setSeconds((s) => {
            if (s + 1 >= callMaxSeconds) hangUp();
            return s + 1;
          });
        }, 1000);
      } catch (err) {
        if (cancelled || !active) return;
        trackEvent("api_error", {
          api_name: "ai_receptionist_voice",
          error_message: err instanceof Error ? err.message : "Voice call failed",
        });
        setError(err instanceof Error ? err.message : "Couldn't start the call.");
        setState("error");
      }
    })();

    return () => {
      cancelled = true;
      active = false;
      hangUp();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey]);

  const mm = String(Math.floor(seconds / 60));
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={state !== "live" && state !== "connecting" ? onClose : undefined}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full sm:max-w-sm max-h-[92dvh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto overflow-x-hidden shadow-2xl text-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ background: "linear-gradient(160deg, #06382F, #0B5D50)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-6 sm:pt-8 pb-4 px-4 sm:px-6">
          <div className="relative inline-block mb-3 sm:mb-4">
            <motion.div
              className="absolute inset-0 rounded-full bg-[#14A08A]"
              animate={mayaTalking ? { scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] } : { scale: 1, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#0E7C6B] to-[#14A08A] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-white/20">
              M
            </div>
          </div>

          <p className="text-xl font-bold text-white">Maya</p>
          <p className="text-xs text-white/60 mb-4">Bright Smile Dental Care · Live Call</p>

          {state === "connecting" && (
            <p className="flex items-center justify-center gap-2 text-sm text-white/70">
              <Loader2 className="w-4 h-4 animate-spin" /> Connecting…
            </p>
          )}

          {state === "live" && (
            <>
              <p className="text-2xl font-mono text-white mb-1">{mm}:{ss}</p>
              <p className="text-[11px] text-white/60 mb-4">demo call · max {Math.round(maxSeconds / 60)} min</p>
              <p className="flex items-center justify-center gap-2 text-xs text-white/60 mb-3">
                <Mic className="w-3.5 h-3.5 text-green-400" />{" "}
                {mayaTalking ? "Maya is speaking — you can interrupt" : "Listening… just talk"}
              </p>
              {caption && (
                <p className="text-xs text-white/70 bg-white/10 rounded-xl px-3 py-2 min-h-[36px] italic">
                  &ldquo;…{caption}&rdquo;
                </p>
              )}
              {booked && (
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-green-300 bg-green-500/10 border border-green-400/30 rounded-full px-3 py-2">
                  <CalendarCheck2 className="w-3.5 h-3.5" /> Booked: {booked}
                </p>
              )}

              {/* Unique “patient card” — glass strip with icon fields + live confirm chips */}
              <div className="mt-5 text-left rounded-[1.35rem] overflow-hidden border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                <div
                  className="px-4 py-3 flex items-center justify-between gap-2"
                  style={{
                    background:
                      "linear-gradient(105deg, rgba(20,160,138,0.45), rgba(6,56,47,0.9) 55%, rgba(11,93,80,0.85))",
                  }}
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Patient card</p>
                    <p className="text-sm font-semibold text-white">Speak · Maya fills · you can edit</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {(
                      [
                        ["N", locks.name || !!draft.name],
                        ["P", locks.phone || digitsOnly(draft.phone).length >= 10],
                        ["E", locks.email || !!draft.email],
                      ] as const
                    ).map(([label, ok]) => (
                      <span
                        key={label}
                        className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center border ${
                          ok
                            ? "bg-emerald-400 text-[#06382F] border-emerald-200"
                            : "bg-white/10 text-white/50 border-white/20"
                        }`}
                      >
                        {ok ? <Check className="w-3 h-3" strokeWidth={3} /> : label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#041F1A]/80 backdrop-blur-md p-3 space-y-2.5">
                  {(
                    [
                      {
                        key: "name" as const,
                        Icon: User,
                        label: "Full name",
                        placeholder: "e.g. Sarah Khan",
                        value: draft.name,
                        locked: locks.name,
                      },
                      {
                        key: "phone" as const,
                        Icon: Phone,
                        label: "Mobile",
                        placeholder: "07… or +44…",
                        value: draft.phone,
                        locked: locks.phone,
                        inputMode: "tel" as const,
                      },
                      {
                        key: "email" as const,
                        Icon: Mail,
                        label: "Email",
                        placeholder: "optional · name at gmail dot com",
                        value: draft.email,
                        locked: locks.email,
                      },
                    ] as const
                  ).map((f) => (
                    <label
                      key={f.key}
                      className={`group flex items-stretch gap-0 rounded-2xl border overflow-hidden transition-colors ${
                        f.locked
                          ? "border-emerald-400/40 bg-emerald-500/10"
                          : "border-white/10 bg-white/[0.06] focus-within:border-[#14A08A]/60 focus-within:bg-white/[0.1]"
                      }`}
                    >
                      <span className="w-11 flex items-center justify-center text-white/50 group-focus-within:text-[#7DD3C0]">
                        <f.Icon className="w-4 h-4" />
                      </span>
                      <span className="flex-1 min-w-0 py-2 pr-3">
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-white/45">{f.label}</span>
                          {f.locked && (
                            <span className="text-[9px] font-bold text-emerald-300 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" strokeWidth={3} /> Locked
                            </span>
                          )}
                        </span>
                        <input
                          value={f.value}
                          onChange={(e) => updateDraftField(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          inputMode={"inputMode" in f ? f.inputMode : undefined}
                          autoComplete={f.key === "name" ? "name" : f.key === "phone" ? "tel" : "email"}
                          className="w-full bg-transparent text-sm text-white placeholder:text-white/25 outline-none mt-0.5"
                        />
                      </span>
                    </label>
                  ))}

                  <label
                    className={`flex items-stretch gap-0 rounded-2xl border overflow-hidden ${
                      locks.service
                        ? "border-emerald-400/40 bg-emerald-500/10"
                        : "border-white/10 bg-white/[0.06]"
                    }`}
                  >
                    <span className="w-11 flex items-center justify-center text-white/50">
                      <Stethoscope className="w-4 h-4" />
                    </span>
                    <span className="flex-1 min-w-0 py-2 pr-3">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/45">Treatment</span>
                      <select
                        value={draft.service}
                        onChange={(e) => updateDraftField("service", e.target.value)}
                        className="w-full bg-transparent text-sm text-white outline-none mt-0.5 [&>option]:text-gray-900"
                      >
                        <option value="">Choose a service</option>
                        {LIVE_SERVICES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { key: "day" as const, label: "Day", options: BOOKING_DAYS },
                        { key: "time" as const, label: "Time", options: BOOKING_TIMES },
                      ] as const
                    ).map((f) => (
                      <label
                        key={f.key}
                        className="flex items-stretch gap-0 rounded-2xl border border-white/10 bg-white/[0.06] overflow-hidden"
                      >
                        <span className="w-9 flex items-center justify-center text-white/50">
                          <Clock className="w-3.5 h-3.5" />
                        </span>
                        <span className="flex-1 min-w-0 py-2 pr-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-white/45">{f.label}</span>
                          <select
                            value={draft[f.key]}
                            onChange={(e) => updateDraftField(f.key, e.target.value)}
                            className="w-full bg-transparent text-xs text-white outline-none mt-0.5 [&>option]:text-gray-900"
                          >
                            <option value="">{f.label}</option>
                            {f.options.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {state === "ended" && (
            <div className="text-sm text-white/70">
              <p className="mb-1">Call ended · {mm}:{ss}</p>
              {booked && <p className="text-green-300 text-xs">✓ Appointment booked: {booked}</p>}
            </div>
          )}

          {state === "error" && (
            <div className="space-y-3 px-1">
              <p className="text-sm text-red-300 leading-relaxed">{error}</p>
              <div className="flex flex-col gap-2.5 w-full max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setState("connecting");
                    setSeconds(0);
                    setRetryKey((k) => k + 1);
                  }}
                  className="inline-flex items-center justify-center w-full px-5 py-3 rounded-full bg-white text-[#0B5D50] text-sm font-bold hover:bg-white/90 transition-colors"
                >
                  Retry Live Call
                </button>
                <a
                  href="#receptionist-chat"
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    document.getElementById("receptionist-chat")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="inline-flex items-center justify-center w-full px-5 py-3 rounded-full border border-white/25 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  Use Chat with Maya instead
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-full text-white/70 text-sm font-medium hover:text-white hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {(state === "live" || state === "connecting" || state === "ended") && (
          <div className="pb-6 pt-1 flex items-center justify-center gap-4">
            {state === "live" || state === "connecting" ? (
              <button
                type="button"
                onClick={() => {
                  hangUp();
                }}
                className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors"
                aria-label="End call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        )}
        {state === "error" && <div className="pb-5" aria-hidden />}
      </motion.div>
    </motion.div>
  );
}

export function LiveCallLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 rounded-full px-2.5 sm:px-3 py-1.5 transition-colors whitespace-nowrap"
      >
        <span aria-hidden>📞</span>
        <span>Live</span>
      </button>
      <AnimatePresence>{open && <LiveCall onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
