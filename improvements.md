# Improvement Task: Live Voice Maya — Name / Phone / Email Confirmation Accuracy

## Context

Reference doc: **`maya.md`** (Maya AI Receptionist system doc, AlliancePAK `alliancepk` repo).

This task targets **only** the **Live Voice Maya** flow:
- `functions/realtime.js` — prompt + session config only (no API contract changes)
- `src/components/LiveCall.tsx` — live call UI + tool handlers + confirmation state

**Problem:** When Maya confirms the caller's name, mobile number, and email verbally, the captured values are sometimes wrong (STT lag, wrong utterance picked, digits misheard, no letter-by-letter email spelling).

Known root causes (from `maya.md` §14):

1. STT lag — `book_appointment` can fire before `gpt-4o-transcribe` finishes; only a 1.2s wait buffers this.
2. `pickTranscript` heuristics are brittle — can grab the wrong recent utterance for name.
3. Phone read-back uses `digits` but the value sent to booking may come from LLM memory instead of confirmed STT — the two can diverge.
4. Email has no letter-by-letter spell-back — relies on STT + regex guessing "at" / "dot".
5. On-screen editable fields in `LiveCall.tsx` are **display-only** — manual corrections never reach `book_appointment`.

---

## Goal

Raise the accuracy of name / phone / email values that actually get booked, by:

- Making confirmation authoritative (what Maya confirms out loud is what gets booked — not a separate LLM-memory copy).
- Adding an explicit per-field confirmation state so booking cannot complete until required fields are confirmed.
- Adding a letter-by-letter spell-back path for email.
- Wiring on-screen editable fields into the actual booking payload so manual corrections aren't silently dropped.

---

## ⚠️ Critical Rule: Do Not Break the Rest of the Website

**This is a surgical fix.** Only Live Voice Maya inside the live-call modal may change. Everything else on the site must keep working exactly as today.

### Files you MAY change (and only these)

| File | What may change |
|------|-----------------|
| `functions/realtime.js` | `liveInstructions()` prompt text only — booking/confirmation rules for live voice |
| `src/components/LiveCall.tsx` | Confirmation state, `pickTranscript`, tool handlers, form → booking wiring |

### Files you must NOT change

| Area | Files / behavior — leave untouched |
|------|--------------------------------------|
| **Chat Maya** | `functions/receptionist.js`, `src/components/ReceptionistDemo.tsx` — form, voice notes, TTS, chat booking flow |
| **Shared booking pipeline** | `functions/lib/booking.js` — no schema, email template, or signature changes |
| **Shared extraction (Chat)** | `functions/lib/bookingExtract.js`, `src/lib/bookingExtract.ts` — do not change existing function behavior used by Chat Maya |
| **Clinic data** | `functions/lib/clinicKB.js` |
| **Other APIs** | `functions/transcribe.js`, `functions/leadAlert.js`, `functions/index.js` exports |
| **Endpoints & hosting** | `firebase.json`, `next.config.js`, `src/lib/receptionistEndpoints.ts` |
| **Rest of website** | Homepage, pricing, blog, portfolio, contact, admin, audit forms, all other pages under `src/app/` |
| **Marketing components** | `AIReceptionist.tsx`, `AICallMockup.tsx`, etc. |

### Behavioral guarantees (must pass after every change)

- [ ] **Chat Maya** on `/ai-receptionist` — text chat, suggestions, service menu, booking form, voice notes, TTS, “Confirm Booking ✓” — all unchanged.
- [ ] **Live call launcher** — “📞 Talk live” button still opens/closes the modal; only behavior *inside* the call improves.
- [ ] **API contracts** — `/api/receptionist`, `/api/realtime-token`, `/api/book` request/response shapes identical.
- [ ] **Firestore** — `appointments` and `leads` document shape unchanged.
- [ ] **Rate limits** — 60 chat / 12 live calls / 15 bookings per IP per day unchanged.
- [ ] **No new npm packages** — use existing OpenAI Realtime + `gpt-4o-transcribe` stack only.
- [ ] **Model & voice** — keep `gpt-realtime-mini`, voice `marin`, 180s call cap, 300s token expiry.

If a shared file must be touched, changes must be **backward-compatible** and **opt-in** so Chat Maya path is unaffected.

---

## Strict Scope Boundaries

- **Do not modify** Chat Maya's flow, prompts, or UI.
- **Do not change** rate limits, endpoint contracts, Firestore schema, or email templates.
- **Do not add** new dependencies or third-party APIs.
- **Do not change** session token minting logic beyond prompt text in `liveInstructions()`.
- **Prefer new logic inside `LiveCall.tsx`** (local state, local helpers) over edits to shared modules.

---

## Required Changes

### 1. Confirmation state machine (`LiveCall.tsx` + prompt in `realtime.js`)

Track client-side in `LiveCall.tsx`:

```typescript
{
  nameConfirmed: boolean;
  phoneConfirmed: boolean;
  emailConfirmed: boolean | "skipped";
  serviceConfirmed: boolean;
  scheduleConfirmed: boolean;  // day + time together
}
```

Also store **`confirmedValues`** — the authoritative strings used for booking:

```typescript
{ name, phone, email, service, preferredTime }
```

Rules:

- Mark a field confirmed only after Maya's read-back **and** caller says yes (or email is skipped).
- Reset a field's confirmed flag if the caller corrects it verbally or edits it on screen.
- Extend state to **service** and **schedule** so the final booking payload never mixes LLM guesses with unconfirmed data.

**Update `liveInstructions()` in `realtime.js`** to match:

- One confirm per field, then move on.
- Email gets letter-by-letter spell-back (see §4).
- Do not call `book_appointment` until all required fields are collected and caller said yes to the final summary.

### 2. Gate `book_appointment` in the browser (practical approach)

OpenAI Realtime keeps tools available for the whole session — you cannot remove `book_appointment` mid-call.

**Implementation:** In `LiveCall.tsx`, when Maya calls `book_appointment`:

1. Check confirmation state + `confirmedValues`.
2. If anything required is missing or unconfirmed → return tool output `{ booked: false, reason: "…" }` to Maya (do **not** call `/api/book`).
3. If all confirmed → build payload from **`confirmedValues` + on-screen form** (form wins on conflict) → POST `/api/book`.

The LLM's tool arguments are **hints only** — never trust them as the source of truth for name/phone/email.

### 3. Single source of truth for confirmed values

- What Maya reads back and the caller confirms becomes the stored value in `confirmedValues`.
- On-screen form edits **override** spoken values and reset that field's confirmed flag.
- At booking time: merge `confirmedValues` with current form `draft`; **form fields win** on any conflict.
- Phone stored for booking = exact digit string from STT read-back (10+ digits), formatted consistently once at booking time.

### 4. Improve `pickTranscript()` (`LiveCall.tsx`)

Current logic scans the last 12 utterances — too brittle.

Required improvements (local to `LiveCall.tsx` only):

- Track **which field Maya is currently asking for** (set when handling `recall_last_spoken_text`).
- Only consider transcripts received **after** that field was requested (not unrelated earlier speech).
- **Name:** prefer short alphabetic utterances; exclude yes/no, phone-like digit strings, service names.
- **Phone:** require ≥7 digits in candidate; prefer most recent digit-heavy utterance for that field window.
- **Email:** prefer `@`, `at`, or `dot` in candidate.

Do not change `src/lib/bookingExtract.ts` — implement tighter picking inside `LiveCall.tsx`.

### 5. Phone read-back

- Use `spoken_digits` from recall output for natural grouped read-back (e.g. "seven one three, five five five, zero one four two").
- Store confirmed phone as the raw `digits` string from STT — do not let the LLM reformat before booking.

### 6. Email — letter-by-letter spell-back

- If email is provided, one spelled-back confirmation: *"I have j-o-h-n at g-m-a-i-l dot c-o-m — is that right?"*
- Only for email — name/phone keep one-shot confirm-and-move-on (per `maya.md` §4).
- Add this rule to **`liveInstructions()`** so Maya follows it consistently.

### 7. STT race condition

Before marking a field confirmed:

- Ensure `gpt-4o-transcribe` returned a **final** transcript for that utterance (not only the 1.2s timer firing).
- If `recall_last_spoken_text` returns `ready: false` → Maya re-prompts once ("Sorry, could you repeat that?") instead of confirming empty/stale text.
- Optionally extend wait/retry once (e.g. up to 2s total) before giving up — **inside `LiveCall.tsx` only**.

### 8. Service & schedule from on-screen form

- Service, day, and time dropdowns already exist on the live call UI.
- Treat them as part of the booking payload source of truth (alongside verbally confirmed name/phone/email).
- If caller sets service/time verbally, auto-fill dropdowns via existing `extractBookingDraft` sync — but **do not modify** `bookingExtract.ts`; call it as-is from `LiveCall.tsx`.

---

## Non-Goals (out of scope)

- Duplicate booking prevention
- Appointment slot validation / calendar integration
- WhatsApp API integration
- Chat Maya UX or confirmation rules
- Changes to any page outside `/ai-receptionist` live call modal
- PSTN / phone network telephony

---

## Manual Test Plan

Run these after implementation. **All must pass**, including regression checks on Chat Maya.

### Live Voice — improvement tests

| # | Scenario | Expected result |
|---|----------|-----------------|
| 1 | Caller gives name → Maya read-back → caller says "no, it's Sarah Khan" → corrects | Booked name = "Sarah Khan" |
| 2 | Caller gives phone → Maya read-back → caller says wrong → repeats number | Booked phone = corrected digits |
| 3 | Caller gives email → Maya spells it letter-by-letter → caller confirms | Booked email matches spell-back |
| 4 | Caller confirms verbally, then edits phone on screen before booking | Booked phone = screen value |
| 5 | Maya tries to book before all fields confirmed | `/api/book` **not** called; Maya asks for missing field |
| 6 | Full happy path — all fields confirmed → "Shall I book?" → yes | Booking succeeds with ref number |

### Regression tests — rest of website (must still work)

| # | Scenario | Expected result |
|---|----------|-----------------|
| 7 | Chat Maya — type message, get reply | Same as before |
| 8 | Chat Maya — open booking form, fill, Confirm Booking ✓ | Appointment booked |
| 9 | Chat Maya — voice note (30s) | Transcribed + reply + TTS |
| 10 | Chat Maya — service menu & service detail cards | Still client-side, no breakage |
| 11 | Homepage, contact, pricing, blog pages load | No errors, no layout changes |
| 12 | Live call — connect, talk, hang up | Modal opens/closes; no console errors |

---

## Acceptance Criteria

- [ ] Caller correction after read-back results in corrected value booked (name, phone, email).
- [ ] `book_appointment` cannot complete booking while any required field is unconfirmed.
- [ ] Manual on-screen edit after verbal confirmation updates the booked value.
- [ ] Email is spelled back letter-by-letter before being marked confirmed.
- [ ] Booked payload uses `confirmedValues` + form — not raw LLM tool arguments.
- [ ] **`pickTranscript` uses field-scoped utterances**, not blind last-12 scan.
- [ ] Chat Maya (`receptionist.js`, `ReceptionistDemo.tsx`, `bookingExtract.ts`) unchanged in behavior.
- [ ] No changes to `/api/receptionist`, `/api/realtime-token`, `/api/book` contracts.
- [ ] Rate limits untouched.
- [ ] No other website pages or features affected (regression tests 7–12 pass).

---

## Implementation Notes for Claude / Developer

1. Read **`maya.md`** first for full system context.
2. Start with **`LiveCall.tsx`** — most logic belongs here to avoid touching shared code.
3. Then update **`liveInstructions()`** in `realtime.js` to align Maya's speech with client-side gating.
4. Test Chat Maya **before and after** every commit.
5. If unsure whether a file is shared → **don't change it**; add logic locally in `LiveCall.tsx` instead.

*Last updated: July 2026 — AlliancePAK `alliancepk` repository.*
