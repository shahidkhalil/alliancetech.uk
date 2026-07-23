"use client";

/**
 * Scroll-driven AI receptionist story beats.
 * Phone rings -> AI answers -> waveform -> booking confirmed.
 */
export const AI_STORY_BEATS = [
  { id: "ring", title: "Missed call risk", copy: "A patient rings after hours. Most clinics lose this lead." },
  { id: "answer", title: "AI picks up", copy: "Your AI receptionist answers in natural English within one ring." },
  { id: "wave", title: "Understands intent", copy: "Voice + WhatsApp context qualifies the enquiry in real time." },
  { id: "book", title: "Books the slot", copy: "Available times offered, confirmed, and written to your calendar." },
  { id: "done", title: "Dashboard updates", copy: "Staff see the booking, notes, and follow-up — zero missed revenue." },
] as const;
