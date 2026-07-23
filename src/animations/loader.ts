export const LOADER_MIN_MS = 900;
export const LOADER_SESSION_KEY = "alliance_loader_seen_v1";

export function shouldShowLoader(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(LOADER_SESSION_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markLoaderSeen(): void {
  try {
    sessionStorage.setItem(LOADER_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}
