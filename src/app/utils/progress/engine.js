/**
 * Progress engine on the device: tasks, gems, the daily goal, streaks with freezes and monthly
 * medals (NETZ_LAUNCH_PLAN.md section 2). Everything lives in one localStorage record until the
 * backend exists; then the server re-counts the activity log (plan section 4.2).
 *
 * Pages never call this file directly: they call recordActivity() in ../activity.js.
 */

import {
  DAILY_GOAL_TASKS, GEMS, MAX_FREEZES, MONTH_MEDAL_DAYS, ONBOARDING, PRO_REWARD_AT, PRO_SEASONS, PRO_TASKS, STREAK_MEDALS,
  TASKS, TASK_BY_ID,
} from './catalog.js';
import { isProOnDevice } from '../proClient.js';

export const STORAGE_KEY = 'netz_progress_v1';
export const PROGRESS_EVENT = 'netz:progress';

const ACTIVITY_KEEP_DAYS = 40;
const RECENT_SOLVES_KEEP = 60;
const SAME_ACTIVITY_GAP_MS = 60 * 1000;

const emptyState = () => ({
  version: 1,
  activity: [],
  recentSolves: [],
  tasksFirstDone: {},
  daysDone: {},
  onboarding: {},
  streak: { current: 0, best: 0, lastDay: null, freezes: 0 },
  medals: {},
  gems: 0,
  gemsByDay: {},
  owned: { skins: ['default'], banners: ['sunset-bands'] },
  equipped: { skin: 'default', banner: 'sunset-bands' },
  robotName: '',
  displayName: '',
  // Units the student picked in onboarding (1–5); empty means all
  units: [],
  onboardingSeen: false,
  daily: { date: null, ids: [] },
  // Pro: tasks done per year ({ '2026': { taskId: day } }) and the month the free freeze was given
  proTasks: {},
  proFreezeMonth: '',
});

/* ---------- dates (the student's own local day) ---------- */

export function localDay(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dayNumber(day) {
  const [y, m, d] = day.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

export function daysBetween(fromDay, toDay) {
  return dayNumber(toDay) - dayNumber(fromDay);
}

/* ---------- storage ---------- */

export function loadProgress() {
  if (typeof window === 'undefined') return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const saved = JSON.parse(raw);
    if (!saved || saved.version !== 1) return emptyState();
    return { ...emptyState(), ...saved };
  } catch {
    return emptyState();
  }
}

function saveProgress(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: progress for this visit is still shown, only not kept
  }
}

/* ---------- streak ---------- */

/**
 * The streak as it stands today. A streak whose last day is further back than the freezes can
 * cover has already broken, even before the next task is done.
 */
export function currentStreak(state, today = localDay()) {
  const { current, lastDay, freezes } = state.streak;
  if (!lastDay || !current) return 0;
  const gap = daysBetween(lastDay, today);
  if (gap <= 1) return current;
  return gap - 1 <= freezes ? current : 0;
}

function advanceStreak(state, today, events) {
  const s = state.streak;
  if (s.lastDay === today) return;
  const gap = s.lastDay ? daysBetween(s.lastDay, today) : 1;
  if (gap < 0) return; // clock moved back: leave the streak alone
  if (gap === 1 || !s.lastDay) {
    s.current += 1;
  } else {
    const missed = gap - 1;
    if (missed <= s.freezes) {
      s.freezes -= missed;
      s.current += 1;
      events.push({ type: 'freezeUsed', count: missed });
    } else {
      if (s.current > 0) events.push({ type: 'streakLost', was: s.current });
      s.current = 1;
    }
  }
  s.lastDay = today;
  s.best = Math.max(s.best, s.current);

  STREAK_MEDALS.forEach((m) => {
    if (s.current >= m.days && !state.medals[m.id]) {
      state.medals[m.id] = today;
      addGems(state, today, m.gems, false);
      events.push({ type: 'streakMedal', medalId: m.id, days: m.days, tier: m.tierName, gems: m.gems });
    }
  });
}

/* ---------- Pro (NETZ_LAUNCH_PLAN.md 2.7 and 5.1) ---------- */

/** Pro members get one free streak freeze each calendar month, given with their first activity. */
function giveProFreeze(state, today, events) {
  const month = today.slice(0, 7);
  if (state.proFreezeMonth === month) return;
  state.proFreezeMonth = month;
  if (state.streak.freezes >= MAX_FREEZES) return;
  state.streak.freezes += 1;
  events.push({ type: 'proFreeze', month });
}

/** The year's Pro tasks, and the banner, skin and medal they unlock (kept forever). */
function countProTasks(state, activity, today, recent, events) {
  const year = today.slice(0, 4);
  const season = PRO_SEASONS[year];
  if (!season) return;
  state.proTasks = state.proTasks || {};
  const done = { ...(state.proTasks[year] || {}) };
  PRO_TASKS.forEach((task) => {
    if (!task.id.startsWith(`pro.${year}.`) || done[task.id]) return;
    if (!task.check({ activity, state, today, recent })) return;
    done[task.id] = today;
    events.push({ type: 'proTask', taskId: task.id, name: task.name, count: Object.keys(done).length });
  });
  state.proTasks[year] = done;

  const count = Object.keys(done).length;
  const owned = { skins: [...(state.owned?.skins || [])], banners: [...(state.owned?.banners || [])] };
  if (count >= PRO_REWARD_AT.banner && !owned.banners.includes(season.banner)) {
    owned.banners.push(season.banner);
    events.push({ type: 'proReward', kind: 'banner', itemId: season.banner, year });
  }
  if (count >= PRO_REWARD_AT.skin && !owned.skins.includes(season.skin)) {
    owned.skins.push(season.skin);
    events.push({ type: 'proReward', kind: 'skin', itemId: season.skin, year });
  }
  state.owned = { ...state.owned, ...owned };
  const medalId = `pro.${year}`;
  if (count >= PRO_REWARD_AT.medal && !state.medals[medalId]) {
    state.medals[medalId] = today;
    events.push({ type: 'proReward', kind: 'medal', itemId: medalId, year });
  }
}

/* ---------- gems ---------- */

/** Adds gems; capped ones (repeats, daily goal) stop at GEMS.dailyCap a day. Returns what was given. */
function addGems(state, today, amount, capped) {
  let given = amount;
  if (capped) {
    const used = state.gemsByDay[today] || 0;
    given = Math.max(0, Math.min(amount, GEMS.dailyCap - used));
    state.gemsByDay[today] = used + given;
  }
  state.gems += given;
  return given;
}

/* ---------- daily suggestions ---------- */

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** The same shuffle all day, a different one the next day. */
function seededOrder(list, seed) {
  return [...list].sort((a, b) => hash(seed + a.id) - hash(seed + b.id));
}

/**
 * Today's 3 suggested tasks. Picked once per day: at least one from the part of NETZ used least,
 * the rest new tasks first, then repeats. Publishing is left out until the backend exists.
 */
export function dailyTasks(state, today = localDay()) {
  if (state.daily.date === today && state.daily.ids.length) return state.daily.ids;
  const units = Array.isArray(state.units) ? state.units : [];
  const inPickedUnits = (t) => !units.length || !t.group.startsWith('unit') || units.includes(Number(t.group.slice(4)));
  const pool = TASKS.filter((t) => t.id !== 'sharing.publish' && inPickedUnits(t));
  const doneCount = {};
  pool.forEach((t) => {
    doneCount[t.group] = (doneCount[t.group] || 0) + (state.tasksFirstDone[t.id] ? 1 : 0);
  });
  const leastGroup = Object.keys(doneCount).sort((a, b) => doneCount[a] - doneCount[b])[0];
  const ordered = seededOrder(pool, today);
  const fresh = ordered.filter((t) => !state.tasksFirstDone[t.id]);
  const picks = [];
  const take = (t) => { if (t && !picks.includes(t.id)) picks.push(t.id); };
  take(fresh.find((t) => t.group === leastGroup) || ordered.find((t) => t.group === leastGroup));
  fresh.forEach((t) => picks.length < DAILY_GOAL_TASKS && take(t));
  ordered.forEach((t) => picks.length < DAILY_GOAL_TASKS && take(t));
  state.daily = { date: today, ids: picks };
  return picks;
}

/* ---------- recording ---------- */

function trimActivity(state, today) {
  state.activity = state.activity.filter((a) => daysBetween(a.day, today) <= ACTIVITY_KEEP_DAYS);
  if (state.recentSolves.length > RECENT_SOLVES_KEEP) state.recentSolves = state.recentSolves.slice(-RECENT_SOLVES_KEEP);
}

function isRepeatOfLast(state, activity, now) {
  const key = `${activity.kind}|${JSON.stringify(activity.details)}`;
  const last = state.activity[state.activity.length - 1];
  return !!last && last.key === key && now - last.at < SAME_ACTIVITY_GAP_MS;
}

/**
 * Records one activity and returns what it earned. The returned `events` drive the toast and the
 * robot: taskFirst, taskRepeat, onboarding, dailyGoal, streakMedal, streakLost, freezeUsed, monthMedal.
 */
export function applyActivity(kind, details = {}, now = Date.now()) {
  const state = loadProgress();
  // The device's idea of Pro is only a guess for the toast; the server re-counts with its own
  const result = reduceActivity(state, kind, details, now, undefined, { pro: isProOnDevice() });
  if (!result.skipped) saveProgress(result.state);
  return result;
}

/**
 * The engine itself, with no storage: changes `state` for one activity and returns what it earned.
 * The device calls it through applyActivity; the server runs the same function on its own copy
 * (api/progress/sync), so both always count the same way. `today` is the student's local day.
 */
export function reduceActivity(state, kind, details = {}, now = Date.now(), today = localDay(new Date(now)), { pro = false } = {}) {
  const activity = { kind, details };
  const events = [];

  if (isRepeatOfLast(state, activity, now)) return { state, events, skipped: true };
  state.activity.push({ key: `${kind}|${JSON.stringify(details)}`, kind, day: today, at: now });
  if (pro) giveProFreeze(state, today, events);

  const recent = state.recentSolves.filter((r) => daysBetween(r.day, today) <= 7);

  // Tasks: first time gives the medal; later days give repeat gems, once per task per day
  const doneToday = new Set(state.daysDone[today] || []);
  TASKS.forEach((task) => {
    const hit = task.matchesHistory ? task.matchesHistory(activity, recent) : task.matches(activity);
    if (!hit) return;
    if (!state.tasksFirstDone[task.id]) {
      state.tasksFirstDone[task.id] = today;
      state.medals[`task.${task.id}`] = today;
      doneToday.add(task.id);
      addGems(state, today, GEMS.firstTime, false);
      events.push({ type: 'taskFirst', taskId: task.id, medal: task.medal, name: task.name, gems: GEMS.firstTime });
    } else if (!doneToday.has(task.id)) {
      doneToday.add(task.id);
      const given = addGems(state, today, GEMS.repeat, true);
      events.push({ type: 'taskRepeat', taskId: task.id, name: task.name, gems: given });
    }
  });

  ONBOARDING.forEach((step) => {
    if (state.onboarding[step.id] || !step.matches(activity)) return;
    state.onboarding[step.id] = today;
    state.medals[step.id] = today;
    addGems(state, today, GEMS.onboarding, false);
    events.push({ type: 'onboarding', taskId: step.id, medal: step.medal, name: step.name, gems: GEMS.onboarding });
  });

  const hadGoal = (state.daysDone[today] || []).length >= DAILY_GOAL_TASKS;
  state.daysDone[today] = [...doneToday];
  if (!hadGoal && doneToday.size >= DAILY_GOAL_TASKS) {
    const given = addGems(state, today, GEMS.dailyGoal, true);
    events.push({ type: 'dailyGoal', gems: given });
  }

  // A day with at least one task done keeps the streak going and counts towards the month medal
  if (doneToday.size > 0) {
    advanceStreak(state, today, events);
    const month = today.slice(0, 7);
    const medalId = `month.${month}`;
    const daysThisMonth = Object.keys(state.daysDone).filter((d) => d.startsWith(month) && state.daysDone[d].length).length;
    if (daysThisMonth >= MONTH_MEDAL_DAYS && !state.medals[medalId]) {
      state.medals[medalId] = today;
      addGems(state, today, GEMS.monthMedal, false);
      events.push({ type: 'monthMedal', medalId, month, gems: GEMS.monthMedal });
      // The year badge is bought with gems in the shop (shop.js YEAR_BADGE_PRICE), not earned here
    }
  }

  if (pro) countProTasks(state, activity, today, recent, events);

  if (kind === 'solver.run') {
    state.recentSolves.push({ day: today, method: details.method, fn: details.fn, a: details.a, b: details.b });
  }

  trimActivity(state, today);
  return { state, events, skipped: false };
}

/** A fresh, empty progress record (the server's starting point for a new account). */
export function newProgressState() {
  return emptyState();
}

/** Replaces the device copy, e.g. with the server's true state after a sync. */
export function replaceProgress(state) {
  saveProgress({ ...emptyState(), ...state });
}

/**
 * Saves the onboarding answers: robot name, the student's name and their units. Saving a robot
 * name also finishes onboarding step 1. Today's suggestions are picked again for the new units.
 */
export function saveProfile({ robotName, displayName, units } = {}) {
  const state = loadProgress();
  if (robotName !== undefined) state.robotName = String(robotName || '').trim().slice(0, 24);
  if (displayName !== undefined) state.displayName = String(displayName || '').trim().slice(0, 40);
  if (Array.isArray(units)) {
    state.units = units.filter((u) => [1, 2, 3, 4, 5].includes(u));
    state.daily = { date: null, ids: [] };
  }
  state.onboardingSeen = true;
  saveProgress(state);
  return state.robotName ? applyActivity('robot.named', {}) : { state, events: [] };
}

/** The onboarding was closed without finishing; do not open it by itself again. */
export function markOnboardingSeen() {
  const state = loadProgress();
  state.onboardingSeen = true;
  saveProgress(state);
}

export function resetProgress() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing kept, nothing to clear
  }
}

/** A summary for the Profile page, the nav chip and the toast. */
export function progressSummary(state = loadProgress(), today = localDay()) {
  const pickedBefore = state.daily.date === today;
  const ids = dailyTasks(state, today);
  // Keep today's picks, so they do not change as tasks get done during the day
  if (!pickedBefore && typeof window !== 'undefined') saveProgress(state);
  const doneToday = new Set(state.daysDone[today] || []);
  const month = today.slice(0, 7);
  return {
    gems: state.gems,
    gemsToday: state.gemsByDay[today] || 0,
    streak: currentStreak(state, today),
    bestStreak: state.streak.best,
    freezes: state.streak.freezes,
    doneToday: doneToday.size,
    goal: DAILY_GOAL_TASKS,
    today: ids.map((id) => ({ ...TASK_BY_ID[id], done: doneToday.has(id), first: !state.tasksFirstDone[id] })),
    medalCount: Object.keys(state.medals).length,
    tasksDone: Object.keys(state.tasksFirstDone).length,
    monthDays: Object.keys(state.daysDone).filter((d) => d.startsWith(month) && state.daysDone[d].length).length,
    robotName: state.robotName,
    displayName: state.displayName,
  };
}

export { MAX_FREEZES };
