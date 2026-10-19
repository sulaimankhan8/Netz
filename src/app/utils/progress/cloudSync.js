'use client';

/**
 * Sends a signed-in student's activities to the server and takes the server's progress as the truth
 * (NETZ_LAUNCH_PLAN.md 4.2). Signed out, nothing here runs and progress stays on the device.
 *
 * - Every recorded activity waits in an outbox until the next sync (a moment later, or when back online).
 * - The first sync on an account also uploads this device's activity log, which the server re-counts.
 * - After a sync, activities still waiting are replayed on top of the server's state, so nothing
 *   disappears from the screen.
 */

import { loadProgress, PROGRESS_EVENT, reduceActivity, replaceProgress } from './engine.js';

const OUTBOX_KEY = 'netz_progress_outbox';
const ACCOUNT_KEY = 'netz_account';
const SYNCED_KEY = 'netz_account_synced';
const OUTBOX_MAX = 300;
const FLUSH_DELAY_MS = 2000;

let flushTimer = null;
let inFlight = null;

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked: the next visit syncs again from the server
  }
}

export function currentAccount() {
  return typeof window === 'undefined' ? null : read(ACCOUNT_KEY, null);
}

/** Called when sign-in state is known: the user id, or null when signed out. */
export function setAccount(userId) {
  const before = currentAccount();
  write(ACCOUNT_KEY, userId || null);
  if (!userId) {
    write(OUTBOX_KEY, null);
    return;
  }
  if (before !== userId) flushSoon(0);
}

/** Puts an activity in the outbox (signed-in students only). */
export function queueActivity(kind, details = {}) {
  if (!currentAccount()) return;
  const outbox = read(OUTBOX_KEY, []);
  outbox.push({ kind, details, at: Date.now() });
  write(OUTBOX_KEY, outbox.slice(-OUTBOX_MAX));
  flushSoon();
}

export function flushSoon(delay = FLUSH_DELAY_MS) {
  if (typeof window === 'undefined' || !currentAccount()) return;
  clearTimeout(flushTimer);
  flushTimer = setTimeout(() => { flush(); }, delay);
}

/** Sends the outbox now. Resolves to true when the server's state was taken. */
export async function flush() {
  if (inFlight) return inFlight;
  const userId = currentAccount();
  if (!userId || (typeof navigator !== 'undefined' && navigator.onLine === false)) return false;

  inFlight = (async () => {
    const outbox = read(OUTBOX_KEY, []);
    const local = loadProgress();
    const firstSync = read(SYNCED_KEY, null) !== userId;
    const body = {
      activities: outbox,
      tz: new Date().getTimezoneOffset(),
      profile: {
        robotName: local.robotName,
        displayName: local.displayName,
        units: local.units,
        onboardingSeen: local.onboardingSeen,
      },
      device: firstSync ? { activity: local.activity } : undefined,
    };

    let res;
    try {
      res = await fetch('/api/progress/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      return false; // offline or server unreachable: the outbox waits for the next try
    }
    if (res.status === 401) {
      setAccount(null);
      return false;
    }
    if (!res.ok) return false;
    const data = await res.json();

    // Drop what was sent; anything recorded meanwhile stays and is replayed on the server's state
    const remaining = read(OUTBOX_KEY, []).slice(outbox.length);
    write(OUTBOX_KEY, remaining);
    const state = data.state;
    remaining.forEach((a) => reduceActivity(state, a.kind, a.details, a.at));
    replaceProgress(state);
    write(SYNCED_KEY, userId);

    // Only the new-account medal is announced; everything else was already shown when it happened
    const events = data.isNew ? (data.events || []).filter((e) => e.taskId === 'onboard.account') : [];
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { kind: 'sync', events } }));
    return true;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}
