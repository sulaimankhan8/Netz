/**
 * How the server counts a device's activities (NETZ_LAUNCH_PLAN.md 4.2). Pure: no database and no
 * network, so it can be tested on its own (test_progress_sync.mjs). The route handler
 * (api/progress/sync) loads the stored state, calls syncProgress, and saves what it returns.
 *
 * The server never trusts the device's numbers (gems, streak, medals). It only trusts activities, and
 * re-counts them with the same engine and the same daily caps.
 */

import { daysBetween, newProgressState, reduceActivity } from './engine.js';

export const MAX_ACTIVITIES_PER_SYNC = 100;
export const MAX_IMPORT_ENTRIES = 400;
const IMPORT_DAYS = 40;
const MAX_BACKDATE_MS = 48 * 60 * 60 * 1000;
// Kinds a device may report; anything else is ignored
const KINDS = new Set([
  'solver.run', 'note.saved', 'note.exported', 'quiz.correct', 'ink.converted', 'playground.eval',
  'playground.block', 'page.exported', 'robot.named',
]);

/** The student's local day for a moment, from their time-zone offset (minutes, as Date.getTimezoneOffset). */
export function dayAt(ms, tzOffsetMinutes) {
  const tz = Math.max(-840, Math.min(720, Number(tzOffsetMinutes) || 0));
  return new Date(ms - tz * 60 * 1000).toISOString().slice(0, 10);
}

function cleanDetails(details) {
  if (!details || typeof details !== 'object' || Array.isArray(details)) return {};
  const out = {};
  Object.entries(details).slice(0, 12).forEach(([k, v]) => {
    if (typeof v === 'string') out[k] = v.slice(0, 200);
    else if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'boolean') out[k] = v;
  });
  return out;
}

/** Device activity-log entries ({ key: 'kind|{json}', day, at }) as activities. */
function parseDeviceLog(entries, todayDay) {
  if (!Array.isArray(entries)) return [];
  return entries
    .slice(-MAX_IMPORT_ENTRIES)
    .map((e) => {
      const key = String(e?.key || '');
      const bar = key.indexOf('|');
      if (bar < 0) return null;
      let details = {};
      try {
        details = JSON.parse(key.slice(bar + 1));
      } catch {
        return null;
      }
      const day = String(e.day || '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
      const age = daysBetween(day, todayDay);
      if (age < 0 || age > IMPORT_DAYS) return null;
      return { kind: key.slice(0, bar), details, at: Number(e.at) || 0, day };
    })
    .filter(Boolean)
    .sort((a, b) => a.at - b.at);
}

/**
 * @param {object}  args
 * @param {object?} args.stored      the user's stored state, or null for a new account
 * @param {Array}   args.activities  [{ kind, details, at }] reported since the last sync
 * @param {object?} args.device      on the first sync: the device's progress (its activity log)
 * @param {object?} args.profile     robot name, display name, units, onboardingSeen
 * @param {number}  args.tz          the device's Date.getTimezoneOffset()
 * @param {number}  args.now         server time, ms
 * @returns {{ state, events, logRows, isNew }}
 */
export function syncProgress({ stored, activities = [], device = null, profile = null, tz = 0, now = Date.now() }) {
  const isNew = !stored;
  const state = stored ? structuredClone(stored) : newProgressState();
  const today = dayAt(now, tz);
  const events = [];
  const logRows = [];

  const apply = (kind, details, at, day) => {
    if (!KINDS.has(kind) && kind !== 'account.created') return;
    const clean = cleanDetails(details);
    const result = reduceActivity(state, kind, clean, at, day);
    if (result.skipped) return;
    events.push(...result.events);
    logRows.push({ kind, details: clean, localDay: day, at: new Date(at) });
  };

  if (isNew && device) {
    // First sign-in: re-count what this device did before it had an account, oldest first
    parseDeviceLog(device.activity, today).forEach((a) => apply(a.kind, a.details, a.at || now, a.day));
  }
  if (isNew) apply('account.created', {}, now, today);

  // Names and units are not scores, so the device's latest answers are taken as they are
  if (profile && typeof profile === 'object') {
    if (typeof profile.robotName === 'string') state.robotName = profile.robotName.slice(0, 24);
    if (typeof profile.displayName === 'string') state.displayName = profile.displayName.slice(0, 40);
    if (Array.isArray(profile.units)) state.units = profile.units.filter((u) => [1, 2, 3, 4, 5].includes(u));
    if (profile.onboardingSeen) state.onboardingSeen = true;
  }

  // New activities: a time from the device is kept only if it is in the last 48 hours
  (Array.isArray(activities) ? activities : []).slice(0, MAX_ACTIVITIES_PER_SYNC).forEach((a) => {
    if (!a || typeof a.kind !== 'string') return;
    const at = Number(a.at);
    const when = Number.isFinite(at) && at <= now && now - at <= MAX_BACKDATE_MS ? at : now;
    apply(a.kind, a.details, when, dayAt(when, tz));
  });

  return { state, events, logRows, isNew };
}
