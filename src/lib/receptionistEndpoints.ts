/**
 * Maya AI receptionist endpoints (Live Call + Chat + booking).
 *
 * These Cloud Functions stay on the previous Firebase project `alliancepak`
 * (where they are already deployed with OpenAI secrets). Site data/Auth/CMS
 * continues to use `alliance-tech-656ba` via src/lib/firebase.ts.
 *
 * Prefer absolute cloudfunctions.net URLs — Firebase Hosting on the new
 * project cannot rewrite to another project's functions.
 */
const MAYA_CF =
  process.env.NEXT_PUBLIC_MAYA_FUNCTIONS_BASE ||
  "https://asia-south1-alliancepak.cloudfunctions.net";

export const RECEPTIONIST_ENDPOINT =
  process.env.NEXT_PUBLIC_RECEPTIONIST_ENDPOINT || `${MAYA_CF}/clinicReceptionist`;

export const REALTIME_TOKEN_ENDPOINT =
  process.env.NEXT_PUBLIC_REALTIME_TOKEN_ENDPOINT || `${MAYA_CF}/realtimeToken`;

export const BOOK_ENDPOINT =
  process.env.NEXT_PUBLIC_BOOK_ENDPOINT || `${MAYA_CF}/bookAppointmentHttp`;

/** @deprecated Absolute aliases kept for older imports. */
export const RECEPTIONIST_ENDPOINT_ABSOLUTE = `${MAYA_CF}/clinicReceptionist`;
export const REALTIME_TOKEN_ENDPOINT_ABSOLUTE = `${MAYA_CF}/realtimeToken`;
export const BOOK_ENDPOINT_ABSOLUTE = `${MAYA_CF}/bookAppointmentHttp`;

export function receptionistUrl() {
  return RECEPTIONIST_ENDPOINT;
}

export function realtimeTokenUrl() {
  return REALTIME_TOKEN_ENDPOINT;
}

export function bookUrl() {
  return BOOK_ENDPOINT;
}
