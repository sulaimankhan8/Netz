/**
 * Counts the student's active minutes for the full-screen ad (NETZ_LAUNCH_PLAN.md 6.3): a minute
 * only counts while the tab is visible and they touched, typed or scrolled in the last minute.
 * After TIMED_AD.activeMinutes, one full-screen ad may show at the next page change; then the clock
 * starts again. At most TIMED_AD.perDay a day. Kept in localStorage, so it carries across pages.
 */

import { TIMED_AD } from './adsPolicy.js';

const KEY = 'netz_ad_clock';
const TICK_MS = 15 * 1000;
const IDLE_MS = 60 * 1000;

const today = () => new Date().toISOString().slice(0, 10);

/** Pure: a clock read back from storage; a new day starts the day's count again. */
export function freshClock(saved, day) {
  if (saved && typeof saved.minutes === 'number') return saved.day === day ? saved : { ...saved, day, shown: 0 };
  return { minutes: 0, day, shown: 0 };
}

/** Pure: the clock after `ms` of activity. */
export function tickClock(clock, ms) {
  return { ...clock, minutes: clock.minutes + ms / 60000 };
}

/** Pure: whether a full-screen ad may be armed. */
export function timedAdDue(clock) {
  return clock.minutes >= TIMED_AD.activeMinutes && clock.shown < TIMED_AD.perDay;
}

function read() {
  let saved = null;
  try {
    saved = JSON.parse(window.localStorage.getItem(KEY) || 'null');
  } catch {
    saved = null;
  }
  return freshClock(saved, today());
}

function write(clock) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(clock));
  } catch {
    // not remembered: the clock just restarts on the next page load
  }
}

export function isTimedAdDue() {
  return typeof window !== 'undefined' && timedAdDue(read());
}

/** Called when a full-screen ad has really shown: the clock starts again. */
export function markTimedAdShown() {
  const c = read();
  write({ ...c, minutes: 0, shown: c.shown + 1 });
}

/** Starts counting on this page. Returns a stop function. */
export function startActiveClock() {
  let lastInput = Date.now();
  const onInput = () => { lastInput = Date.now(); };
  const events = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
  events.forEach((e) => window.addEventListener(e, onInput, { passive: true, capture: true }));
  const timer = setInterval(() => {
    if (document.visibilityState !== 'visible' || Date.now() - lastInput > IDLE_MS) return;
    write(tickClock(read(), TICK_MS));
  }, TICK_MS);
  return () => {
    clearInterval(timer);
    events.forEach((e) => window.removeEventListener(e, onInput, { capture: true }));
  };
}
