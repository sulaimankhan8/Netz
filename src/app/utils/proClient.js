/**
 * The device's copy of "is this student Pro?" (NETZ_LAUNCH_PLAN.md 5.4 step 4). The server decides
 * (api/billing/status, from the Razorpay webhook); this is only a cached answer so ads, exports and
 * the progress toast can ask without waiting for the network. Every server limit checks Pro itself.
 *
 * Safe to import anywhere: on the server it simply says "not Pro".
 */

export const PRO_KEY = 'netz_pro_v1';
export const PRO_EVENT = 'netz:pro';

const REFRESH_MS = 10 * 60 * 1000;

function read() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PRO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(value) {
  try {
    if (value) window.localStorage.setItem(PRO_KEY, JSON.stringify(value));
    else window.localStorage.removeItem(PRO_KEY);
  } catch {
    // storage full or blocked: Pro just is not remembered on this device
  }
  window.dispatchEvent(new CustomEvent(PRO_EVENT));
}

/** The cached status ({ pro, plan, lifetime, until, renews, userId, at }) or null. */
export function cachedPro() {
  return read();
}

/** True when the cached status says Pro and its paid period has not ended. */
export function isProOnDevice(now = Date.now()) {
  const s = read();
  if (!s?.pro) return false;
  if (s.lifetime) return true;
  return !!s.until && Date.parse(s.until) > now;
}

/**
 * Asks the server for the signed-in student's Pro status and caches it. `userId` null clears it
 * (signed out). Skips the call when the cache for this user is fresh, unless `force`.
 */
export async function refreshPro(userId, { force = false } = {}) {
  if (typeof window === 'undefined') return null;
  if (!userId) {
    if (read()) write(null);
    return null;
  }
  const cached = read();
  if (!force && cached?.userId === userId && Date.now() - (cached.at || 0) < REFRESH_MS) return cached;
  try {
    const response = await fetch('/api/billing/status', { cache: 'no-store' });
    if (!response.ok) return cached?.userId === userId ? cached : null;
    const status = await response.json();
    const value = { ...status, userId, at: Date.now() };
    write(value);
    return value;
  } catch {
    return cached?.userId === userId ? cached : null;
  }
}
