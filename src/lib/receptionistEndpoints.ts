/**
 * Maya AI receptionist endpoints (Live Call + Chat + booking).
 * Same Firebase project as the site: alliance-tech-656ba.
 */
const MAYA_CF =
  process.env.NEXT_PUBLIC_MAYA_FUNCTIONS_BASE ||
  "https://asia-south1-alliance-tech-656ba.cloudfunctions.net";

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
