'use client';

import { useCallback, useEffect, useState } from 'react';
import { loadProgress, localDay, progressSummary, PROGRESS_EVENT, saveProfile, STORAGE_KEY } from './engine.js';
import { flushSoon, queueActivity } from './cloudSync.js';

/**
 * The student's progress, kept up to date: after any task (PROGRESS_EVENT), when another tab
 * changes it, when the tab comes back into view, and when the day changes. Null until mounted, so
 * pages render the same on the server and the first client pass.
 */
export default function useProgress() {
  const [snapshot, setSnapshot] = useState(null);

  const refresh = useCallback(() => {
    const state = loadProgress();
    const today = localDay();
    setSnapshot({ state, summary: progressSummary(state, today), today });
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e) => { if (e.key === STORAGE_KEY) refresh(); };
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    let lastDay = localDay();
    const dayCheck = setInterval(() => {
      const now = localDay();
      if (now !== lastDay) {
        lastDay = now;
        refresh();
      }
    }, 60 * 1000);
    window.addEventListener(PROGRESS_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(dayCheck);
      window.removeEventListener(PROGRESS_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  return snapshot;
}

/** Saves onboarding answers and tells the toast and every progress view. */
export function completeOnboarding(profile) {
  const { events, skipped } = saveProfile(profile);
  if (skipped === false) queueActivity('robot.named', {});
  else flushSoon();
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { kind: 'robot.named', events } }));
  return events;
}
