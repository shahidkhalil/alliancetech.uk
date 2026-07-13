/**
 * Tiny Firestore-backed cache with TTL, used to avoid re-spending
 * API credits (Serper, OpenAI, PageSpeed) on repeated work.
 */

const crypto = require("crypto");

let db = null;
function initCache(firestore) {
  db = firestore;
}

function keyToId(key) {
  return crypto.createHash("sha1").update(key).digest("hex");
}

async function getCache(key) {
  if (!db) return null;
  try {
    const snap = await db.collection("cache").doc(keyToId(key)).get();
    if (!snap.exists) return null;
    const { value, expiresAt } = snap.data();
    if (expiresAt && expiresAt.toMillis() < Date.now()) return null;
    return value;
  } catch {
    return null;
  }
}

async function setCache(key, value, ttlDays) {
  if (!db) return;
  try {
    await db.collection("cache").doc(keyToId(key)).set({
      key,
      value,
      expiresAt: new Date(Date.now() + ttlDays * 86400000),
      createdAt: new Date(),
    });
  } catch (e) {
    console.warn("cache set failed:", e.message);
  }
}

/**
 * Per-IP daily counter, namespaced per feature so chatting doesn't
 * consume the voice/audit quota. Returns true if within `limit`.
 */
async function checkRateLimit(ip, limit, scope = "global") {
  if (!db || !ip) return true;
  const day = new Date().toISOString().slice(0, 10);
  const ref = db.collection("cache").doc(keyToId(`rate:${scope}:${ip}:${day}`));
  try {
    const n = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const count = (snap.exists ? snap.data().count : 0) + 1;
      tx.set(ref, { count, expiresAt: new Date(Date.now() + 2 * 86400000) });
      return count;
    });
    return n <= limit;
  } catch {
    return true; // fail open
  }
}

module.exports = { initCache, getCache, setCache, checkRateLimit };
