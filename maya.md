# Maya AI Receptionist — System Documentation

> **Purpose of this document:** Complete reference for understanding how Maya works today — architecture, workflows, confirmation logic (name, phone, email, appointment), prompts, tools, and data flow. Use this when improving Maya’s voice “hearing,” field confirmation, and booking reliability.

---

## 1. What Is Maya?

**Maya** is the branded AI front-desk receptionist persona for AlliancePAK’s clinic demo. She answers patient questions from a clinic knowledge base and books appointments.

- **Demo clinic:** Bright Smile Dental Care (Houston, TX)
- **Clinic ID:** `demo` (only one clinic KB exists today)
- **Personality:** Warm, human, concise — like a real receptionist. One or two short sentences per turn.

Maya runs in **two separate channels** with different booking UX:

| Channel | Where | How the user talks | How booking works |
|---------|-------|--------------------|-------------------|
| **Chat Maya** | `/ai-receptionist` page | Text, voice notes (30s max), optional TTS replies | On-screen **booking form** → submit → LLM calls `book_appointment` |
| **Live Voice Maya** | “📞 Talk live” button | Real-time WebRTC voice call (3 min demo cap) | Verbal Q&A **one field at a time** → confirm name/phone/email → summary → `book_appointment` |

> **Important:** “Hearing” in this codebase means **speech-to-text (STT)**, not audiology. The live call uses a dedicated transcription layer for accurate name/phone/email capture.

---

## 2. File Map (Everything Attached to Maya)

### Backend — Firebase Cloud Functions (`functions/`)

| File | Role |
|------|------|
| `receptionist.js` | **Chat Maya** — OpenAI `gpt-4o-mini`, system prompt, `book_appointment` tool, voice note transcription, TTS |
| `realtime.js` | **Live Voice Maya** — session token minting, `liveInstructions()` prompt, `recall_last_spoken_text` + `book_appointment` tools |
| `lib/booking.js` | Shared booking pipeline: Firestore `appointments` + `leads`, patient confirmation email |
| `lib/clinicKB.js` | Clinic knowledge base (RAG source) — facts Maya is allowed to know |
| `lib/bookingExtract.js` | Server-side duplicate of booking field extraction (Node version) |
| `lib/cache.js` | Firestore rate limiting per IP |
| `lib/security.js` | CORS, client IP, SSRF guards |
| `transcribe.js` | Standalone voice-note transcription endpoint (chat also transcribes inline) |
| `leadAlert.js` | Firestore trigger on new `leads` — admin + user email alerts |
| `index.js` | Exports: `clinicReceptionist`, `realtimeToken`, `bookAppointmentHttp`, `transcribeAudio` |

### Frontend — Next.js (`src/`)

| File | Role |
|------|------|
| `components/ReceptionistDemo.tsx` | Main chat UI — Maya avatar, messages, booking form, voice notes, launches live call |
| `components/LiveCall.tsx` | Live voice call UI — WebRTC, captions, `recall_last_spoken_text` handler, editable booking fields |
| `lib/bookingExtract.ts` | Client-side extraction of name/phone/email/service/day/time from chat or speech |
| `lib/receptionistEndpoints.ts` | API URL resolution (`/api/*` vs Cloud Functions direct) |
| `app/ai-receptionist/page.tsx` | Product page hosting the demo |

### Infrastructure

| File | Role |
|------|------|
| `firebase.json` | Hosting rewrites: `/api/receptionist`, `/api/realtime-token`, `/api/book` → Cloud Functions |
| `next.config.js` | Dev rewrites to same Cloud Functions |
| `firestore.rules` | `appointments`, `cache`, `audits` — Admin SDK only |

---

## 3. API Endpoints

| Endpoint | Cloud Function | Method | Purpose |
|----------|----------------|--------|---------|
| `/api/receptionist` | `clinicReceptionist` | POST | Chat messages, voice notes, booking via tool call |
| `/api/realtime-token` | `realtimeToken` | POST | Mint ephemeral OpenAI Realtime session |
| `/api/book` | `bookAppointmentHttp` | POST | Persist appointment (called from live call browser) |

**Request/response shapes:**

### POST `/api/receptionist`
```json
// Request
{
  "messages": [{ "role": "user|assistant", "content": "..." }],
  "clinicId": "demo",
  "bookingDraft": { "name", "phone", "email", "service", "day", "time" },  // optional, when form open
  "audio": "<base64>",   // optional voice note
  "mime": "audio/webm",
  "speak": true          // optional — return TTS mp3
}

// Response
{
  "reply": "Maya's text reply",
  "booking": { "id", "name", "phone", "service", "preferredTime", "clinicName" },  // if booked
  "audio": "<base64 mp3>",   // if speak=true
  "transcript": "...",       // if voice note sent
  "bookingDraft": { ... },   // extracted fields
  "showBookingForm": true    // hint to show form
}
```

### POST `/api/realtime-token`
```json
// Request: { "clinicId": "demo" }
// Response: { "clientSecret": "...", "model": "gpt-realtime-mini", "maxSeconds": 180 }
```

### POST `/api/book`
```json
// Request
{
  "name": "John Smith",
  "phone": "(713) 555-0142",
  "email": "john@example.com",   // optional
  "service": "Consultation & Check-up",
  "preferredTime": "Saturday at 7:00 PM",
  "notes": "",                   // optional
  "clinicId": "demo"
}

// Response: { "booked": true, "id": "...", "reference": "ABC123" }
```

---

## 4. Maya’s Personality & Rules (Prompts)

### Chat Maya — `systemPrompt()` in `functions/receptionist.js`

- **Name:** “Your name is Maya”
- **Model:** `gpt-4o-mini`, temperature 0.4 (0.6 on confirmation pass)
- **Knowledge:** Injected from `clinicKB.js` — address, hours, doctors, services, policies, FAQs
- **Booking rule:** Do **NOT** collect details one-by-one in chat. Direct patient to the **on-screen form**.
- **Anti-loop rules:**
  - NEVER re-ask filled form fields (form state sent as `bookingDraft`)
  - NEVER ask the same question twice
  - NEVER say “is that correct?” more than once
- **When form is submitted:** Call `book_appointment` immediately → one warm confirmation

### Live Voice Maya — `liveInstructions()` in `functions/realtime.js`

- **Name:** “You are Maya”
- **Model:** `gpt-realtime-mini`, voice `marin`
- **STT layer:** `gpt-4o-transcribe` (separate from speech model — more accurate for digits/names)
- **High-precision fields:** name, phone, email — never invent or guess
- **Confirmation rule:** One verbal check per field maximum, then move on
- **On-screen fallback:** Patient sees editable fields that auto-fill from speech

---

## 5. Complete Workflows

### 5A. Chat Maya Workflow

```
User opens /ai-receptionist
        │
        ▼
Maya greeting: "Hi there! I'm Maya at Bright Smile Dental Care..."
        │
        ├── User asks about services → client shows service catalog (no API)
        ├── User asks about a treatment → client shows service detail card (no API)
        ├── User wants to book → client opens inline BookingForm
        │         │
        │         ├── User fills fields manually OR speech auto-fills via extractBookingDraft()
        │         ├── User taps "Confirm Booking ✓"
        │         └── Client sends structured message:
        │             "Please book my appointment. Name: X. Phone: Y. Email: Z.
        │              Service: S. Preferred time: Day at Time."
        │                   │
        │                   ▼
        │             POST /api/receptionist
        │                   │
        │                   ▼
        │             gpt-4o-mini calls book_appointment tool
        │                   │
        │                   ▼
        │             bookAndNotify() → Firestore + email
        │                   │
        │                   ▼
        │             Second LLM pass → warm confirmation reply (+ TTS if voice mode)
        │                   │
        │                   ▼
        │             UI shows green "Appointment Confirmed" card
        │
        └── General Q&A → POST /api/receptionist → text reply (+ optional TTS)
```

**Voice notes (chat):** User records up to 30s → base64 audio sent inline → `gpt-4o-mini-transcribe` → same chat flow with `speak: true`.

**Key point for improvements:** Chat mode does **not** do field-by-field verbal confirmation. Confirmation happens when the user reviews the form and taps **Confirm Booking ✓**.

---

### 5B. Live Voice Maya Workflow (Name / Phone / Email / Appointment)

This is the mode where Maya **hears** the caller and confirms each detail verbally.

```
User taps "📞 Talk live"
        │
        ▼
POST /api/realtime-token → ephemeral OpenAI session (300s token, 180s call cap)
        │
        ▼
Browser WebRTC → OpenAI Realtime API (gpt-realtime-mini)
        │
        ▼
Maya greets caller
        │
        ▼
BOOKING SCRIPT (one question at a time, skip already-given info):
        │
        ├─ 1. Which service? (default suggest: Consultation & Check-up)
        │
        ├─ 2. FULL NAME
        │      Patient speaks name
        │      → Maya calls recall_last_spoken_text(field: "name")
        │      → Browser returns accurate STT from gpt-4o-transcribe
        │      → Maya confirms once: "Got it — John Smith?"
        │      → If yes → move on (NEVER re-confirm name)
        │
        ├─ 3. PHONE
        │      Patient speaks number
        │      → recall_last_spoken_text(field: "phone")
        │      → Maya reads back once: "Your number is 555-0142 — right?"
        │      → If unclear → ask to repeat slowly in groups
        │      → If yes → move on
        │
        ├─ 4. EMAIL (optional)
        │      → recall_last_spoken_text(field: "email") if given
        │      → Confirm once, or skip if declined
        │
        ├─ 5. Preferred DAY (Mon–Sat)
        │
        ├─ 6. Preferred TIME (11 AM – 8:30 PM)
        │
        └─ 7. FINAL SUMMARY
               "Shall I book that?" — one line summary
               → Only after verbal YES → call book_appointment
               → Browser POST /api/book → bookAndNotify()
               → Maya confirms booking verbally
               → UI shows green "Booked: Service · Time (Ref XXXXXX)"
```

**Parallel path:** While Maya talks, user speech transcripts continuously feed `extractBookingDraft()` → on-screen editable fields update for manual review/correction.

---

## 6. Name / Phone / Email Confirmation — Detailed Logic

### 6A. Live Voice — The `recall_last_spoken_text` Tool

**Why it exists:** The Realtime speech model can mishear digits and spellings. A **separate STT layer** (`gpt-4o-transcribe`) transcribes what the patient actually said. Maya must call this tool **before** reading back name, phone, or email.

**Tool definition** (`functions/realtime.js`):
```javascript
{
  name: "recall_last_spoken_text",
  description: "REQUIRED right after the patient speaks their name, phone number, or email.
                Returns the accurate speech-to-text so you can confirm the exact value.",
  parameters: {
    field: { enum: ["name", "phone", "email", "other"] }
  }
}
```

**Browser handler** (`src/components/LiveCall.tsx`):

1. Listens for `conversation.item.input_audio_transcription.completed` events
2. Stores last 12 user transcripts in `userTranscriptsRef`
3. When Maya calls `recall_last_spoken_text`:
   - Runs `pickTranscript(field, recentTranscripts)` heuristics
   - If transcript empty or phone has <7 digits → **wait 1.2 seconds** and retry (STT can lag behind tool call)
   - Returns JSON to Maya:

```javascript
{
  ready: true|false,
  field: "name|phone|email|other",
  text: "John Smith",           // raw transcript
  digits: "7135550142",         // digits only (for phone)
  spoken_digits: "7 1 3 5 5 5 0 1 4 2",
  instruction: "Confirm this exact text once. If they say yes, move on — do not re-confirm."
}
```

**`pickTranscript()` heuristics** (`LiveCall.tsx`):

| Field | Selection logic |
|-------|-----------------|
| **phone** | Prefer transcript with ≥7 digits |
| **email** | Prefer transcript containing `@`, `at`, or `dot` |
| **name** | Prefer short alphabetic utterance (1–5 words), exclude yes/no/phone-like strings |
| **default** | Most recent transcript |

**Prompt rules for Maya (live):**
- After recall → confirm **once** in natural speech
- If patient says yes or corrects → **move on immediately**
- **Never** ask to confirm the same field again
- **One check per field maximum**
- Phone unclear → ask to say slowly in groups, read back once
- Email optional → confirm once or skip
- Mention on-screen editable fields as fallback

---

### 6B. Chat — Form-Based Confirmation (No Verbal Recall)

Chat Maya does **not** use `recall_last_spoken_text`. Instead:

1. **Booking form** appears when user expresses booking intent
2. **`extractBookingDraft()`** auto-fills fields from chat/voice text:

| Field | Extraction logic (`src/lib/bookingExtract.ts`) |
|-------|--------------------------------------------------|
| **Name** | Regex: `my name is`, `I am`, `call me`, or capitalized 1–4 word string |
| **Phone** | Last 10+ digit match → formatted as `(XXX) XXX-XXXX` |
| **Email** | Standard email regex |
| **Service** | Match against service list + aliases (braces, whitening, etc.) |
| **Day** | Match against `BOOKING_DAYS` |
| **Time** | Match against `BOOKING_TIMES` or normalize from free text |

3. **Validation** (`draftIsComplete()`):
   - Name ≥ 2 characters
   - Phone ≥ 10 digits
   - Service, day, time required
   - Email **optional**

4. User reviews form → taps **Confirm Booking ✓** → structured message sent to backend

5. LLM receives form state in system prompt via `bookingFormContext()` — told **never to re-ask filled fields**

---

## 7. Appointment Confirmation Logic

### When booking is triggered

| Channel | Trigger | Who calls `bookAndNotify()` |
|---------|---------|----------------------------|
| Chat | LLM `book_appointment` tool after form submit | `clinicReceptionist` directly |
| Live | LLM `book_appointment` after verbal “yes” to summary | Browser → `bookAppointmentHttp` |

### Required fields for booking

| Field | Required | Notes |
|-------|----------|-------|
| `name` | ✅ | Max 80 chars |
| `phone` | ✅ | Max 30 chars |
| `service` | ✅ | Max 80 chars |
| `preferredTime` | ✅ | Day + time combined string, max 120 chars |
| `email` | ❌ | If provided → confirmation email sent |
| `notes` | ❌ | Optional context |

### `bookAndNotify()` pipeline (`functions/lib/booking.js`)

```
book_appointment tool called with confirmed values
        │
        ▼
1. Firestore → collection "appointments"
   {
     name, phone, email, service, preferredTime, notes,
     clinicId: "demo",
     clinicName: "Bright Smile Dental Care",
     source: "ai_receptionist" | "ai_receptionist_live",
     status: "new",
     createdAt: server timestamp
   }
        │
        ▼
2. Reference ID = first 6 chars of doc ID, uppercased (e.g. "A1B2C3")
        │
        ▼
3. Firestore → collection "leads" (triggers leadAlert email to admin)
   {
     name, phone, email,
     source, clinicName,
     message: "Appointment: {service} — {preferredTime}",
     status: "new"
   }
        │
        ▼
4. Patient confirmation email (if email provided)
   Via Gmail/nodemailer — appointment details, clinic address, policies
        │
        ▼
5. Return { id, reference } to LLM / browser
        │
        ▼
6. Maya speaks/writes warm confirmation with reference number
```

### UI confirmation states

- **Chat:** Green card — “Appointment Confirmed” with name, service, time, WhatsApp note
- **Live:** Green banner — “Booked: {service} · {time} (Ref {reference})”

---

## 8. OpenAI Tools Reference

### `book_appointment` (both channels)

```javascript
{
  name: "book_appointment",
  description: "Book only after name, phone, service, day/time collected AND patient confirmed.",
  parameters: {
    name: string,
    phone: string,        // confirmed digits as patient approved
    email: string,      // optional
    service: string,
    preferredTime: string,
    notes: string         // optional
  },
  required: ["name", "phone", "service", "preferredTime"]
}
```

**Live mode extra rule in description:** “Use the exact confirmed values — never guessed digits.”

### `recall_last_spoken_text` (live only)

See Section 6A above.

---

## 9. Data Models

### `BookingDraft` (client TypeScript)

```typescript
interface BookingDraft {
  name: string;
  phone: string;
  email: string;      // optional in validation
  service: string;
  day: string;        // Today | Tomorrow | Monday … Saturday
  time: string;       // 11:00 AM | 1:00 PM | 3:00 PM | 5:00 PM | 7:00 PM | 8:30 PM
}
```

### Firestore `appointments`

```javascript
{
  name, phone, email?, service, preferredTime, notes?,
  clinicId, clinicName,
  source: "ai_receptionist" | "ai_receptionist_live",
  status: "new",
  createdAt
}
```

### Clinic Knowledge Base shape (`clinicKB.js`)

```javascript
{
  name, tagline, city, address, phone, whatsapp,
  hours: { weekdays, sunday, note },
  languages, doctors[], services[{ name, price, description }],
  policies: { payment, firstVisit, cancellation, emergency },
  faqs: [{ q, a }]
}
```

---

## 10. Integrations & Tech Stack

| Integration | Usage |
|-------------|-------|
| **OpenAI Chat Completions** | Chat Maya — `gpt-4o-mini` |
| **OpenAI Realtime API** | Live voice — `gpt-realtime-mini`, WebRTC, voice `marin` |
| **OpenAI Transcription** | Live input: `gpt-4o-transcribe`; Voice notes: `gpt-4o-mini-transcribe` |
| **OpenAI TTS** | Chat voice replies — `gpt-4o-mini-tts` or fallback `tts-1`, voice `nova` |
| **WebRTC / Browser mic** | `LiveCall.tsx` — direct connection to OpenAI |
| **Firebase Hosting** | Same-origin `/api/*` rewrites |
| **Firebase Firestore** | Appointments, leads, rate-limit cache |
| **Gmail (nodemailer)** | Patient confirmation + admin lead alerts |
| **Firebase Cloud Functions v2** | Region `asia-south1` |

**Not integrated (despite marketing copy):**
- WhatsApp Business API (UI says “We'll confirm on WhatsApp shortly” — aspirational)
- Real calendar / EHR integration
- PSTN telephony (live call is browser WebRTC only)

---

## 11. Rate Limits & Constants

| Limit | Value | Scope |
|-------|-------|-------|
| Chat messages | 60 / IP / day | `receptionist.js` |
| Live calls | 12 / IP / day | `realtime.js` |
| Bookings | 15 / IP / day | `realtime.js` |
| Live call duration | 180 seconds (3 min) | Client + server |
| Session token expiry | 300 seconds | `realtime.js` |
| Voice note max | 30 seconds | `ReceptionistDemo.tsx` |
| Chat history sent | Last 12 messages | `receptionist.js` |
| User transcripts kept | Last 12 utterances | `LiveCall.tsx` |
| STT wait on recall | 1.2 seconds if empty | `LiveCall.tsx` |

---

## 12. Environment & Secrets

### Firebase secrets
```
OPENAI_API_KEY      — all OpenAI calls
GMAIL_USER          — booking confirmation emails
GMAIL_APP_PASSWORD  — Gmail SMTP auth
```

### Optional Next.js env overrides
```
NEXT_PUBLIC_RECEPTIONIST_ENDPOINT=/api/receptionist
NEXT_PUBLIC_REALTIME_TOKEN_ENDPOINT=/api/realtime-token
NEXT_PUBLIC_BOOK_ENDPOINT=/api/book
```

---

## 13. Two Confirmation Philosophies (Summary)

| Aspect | Chat Maya | Live Voice Maya |
|--------|-----------|-----------------|
| Data collection | On-screen form (all fields visible) | Verbal, one field at a time |
| Name confirm | User reviews form, taps Confirm | `recall_last_spoken_text` → one verbal check |
| Phone confirm | User reviews form, taps Confirm | `recall_last_spoken_text` → one verbal read-back |
| Email confirm | Optional in form | `recall_last_spoken_text` → one verbal check or skip |
| Booking trigger | Form submit → LLM tool | Verbal “Shall I book?” → yes → tool → HTTP book |
| STT | Voice notes only | Continuous `gpt-4o-transcribe` on all speech |
| Anti-loop | Prompt: never re-ask filled fields | Prompt: one confirm per field max |
| Fallback | User edits form directly | On-screen editable fields + manual typing |

---

## 14. Known Gaps & Improvement Targets

Use this section when improving Maya’s “hearing” and confirmation flow.

### Live voice — hearing / STT issues
1. **STT lag:** Tool call can fire before transcription arrives → 1.2s wait helps but may still miss fast speakers
2. **`pickTranscript` heuristics are brittle:** Name detection excludes yes/no but may pick wrong utterance from recent history
3. **Phone formatting:** Maya reads back from `digits` but booking may use differently formatted string from LLM memory vs STT
4. **Email spelling:** “john at gmail dot com” relies on STT + regex — no spell-back letter-by-letter flow
5. **No sync between on-screen form and `book_appointment` args:** Live call form is display-only; Maya books from her own collected values, not the edited form fields
6. **Interruption handling:** Prompt says stop if interrupted, but recall timing on barge-in is untested

### Chat — confirmation gaps
1. **No field-by-field verbal confirm** — user must self-review the form
2. **Auto-extract can misparse** name from casual chat (“I am looking for braces” could false-match)
3. **Email not required** — bookings proceed without email confirmation path

### Booking pipeline
1. **No duplicate booking prevention** — same phone can book multiple times
2. **No appointment slot validation** — any day/time accepted
3. **WhatsApp confirmation is UI copy only** — not sent

### Suggested improvement directions (for Claude)
- **Wire live form edits into booking:** When user corrects name/phone/email on screen, pass those values to `book_appointment` instead of LLM memory
- **Stronger recall:** Wait longer or retry recall if `ready: false`; spell-back email letter-by-letter
- **Explicit confirmation state machine:** Track `{ nameConfirmed, phoneConfirmed, emailConfirmed }` in browser and gate `book_appointment` until all true
- **Chat mode verbal confirm option:** Optional “read back my details” step before form submit
- **Post-booking WhatsApp hook:** Integrate WhatsApp API for real confirmation message

---

## 15. Quick Reference — Booking Script (Live Voice)

Copy of the exact booking order from `liveInstructions()`:

```
1. Which service (suggest Consultation & Check-up if unsure)
2. Full name → recall_last_spoken_text(name) → confirm once → move on
3. Phone → recall_last_spoken_text(phone) → confirm once → move on
4. Email (optional) → recall if given → confirm once or skip
5. Preferred day (Mon–Sat)
6. Preferred time (11 AM–8:30 PM)
7. ONE summary line: "Shall I book that?"
8. Only after YES → book_appointment
9. Do NOT ask again after they confirm
```

---

## 16. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                           │
│  ReceptionistDemo.tsx          LiveCall.tsx                     │
│  ├─ Chat / voice notes         ├─ WebRTC mic/speaker            │
│  ├─ BookingForm                ├─ recall_last_spoken_text       │
│  └─ MayaAvatar                 └─ Editable booking fields       │
└────────────┬──────────────────────────────┬─────────────────────┘
             │ POST /api/receptionist       │ POST /api/realtime-token
             │                              │ WebRTC → OpenAI Realtime
             ▼                              ▼
┌────────────────────────┐    ┌──────────────────────────────────┐
│  clinicReceptionist    │    │  realtimeToken + OpenAI Realtime │
│  gpt-4o-mini + tools   │    │  gpt-realtime-mini + tools       │
│  book_appointment      │    │  recall_last_spoken_text         │
└────────────┬───────────┘    │  book_appointment → /api/book    │
             │                └──────────────┬───────────────────┘
             │                               │
             └───────────────┬───────────────┘
                             ▼
                  ┌─────────────────────┐
                  │   bookAndNotify()   │
                  │   lib/booking.js    │
                  └──────────┬──────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        Firestore       Firestore       Gmail
        appointments    leads           confirmation
                             │
                             ▼
                      leadAlert.js
                      (admin email)
```

---

*Last updated: July 2026 — reflects codebase at AlliancePAK `alliancepk` repository.*
