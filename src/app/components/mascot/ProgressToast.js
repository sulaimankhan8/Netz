'use client';

import { useEffect, useRef, useState } from 'react';
import NetzRobot, { robotReact } from './NetzRobot';
import { PROGRESS_EVENT } from '@/app/utils/progress/engine';

// Settings can switch these toasts off (NETZ_LAUNCH_PLAN.md 2.8)
export const TOASTS_OFF_KEY = 'netz_progress_toasts_off';
const SHOW_MS = 3600;

// The most important thing earned is the one shown
const RANK = { yearBadge: 7, monthMedal: 6, streakMedal: 5, onboarding: 4, taskFirst: 4, dailyGoal: 3, streakLost: 2, freezeUsed: 1, taskRepeat: 1 };

function describe(event) {
  switch (event.type) {
    case 'yearBadge':
      return { mood: 'cheer', title: `${event.year} year badge!`, text: 'Monthly medals all year long. Amazing.' };
    case 'monthMedal':
      return { mood: 'cheer', title: 'Monthly medal!', text: `20 days of tasks this month · +${event.gems} gems` };
    case 'streakMedal':
      return { mood: 'cheer', title: `${event.days}-day streak!`, text: `${event.tier} streak medal · +${event.gems} gems` };
    case 'taskFirst':
    case 'onboarding':
      return { mood: 'cheer', title: `New medal: ${event.medal}`, text: `${event.name} · +${event.gems} gems` };
    case 'dailyGoal':
      return { mood: 'cheer', title: "Today's goal done", text: event.gems ? `3 tasks today · +${event.gems} gems` : '3 tasks today · gem limit reached for today' };
    case 'streakLost':
      return { mood: 'sad', title: 'Your streak ended', text: `It was ${event.was} days. Today starts a new one, and your medals stay.` };
    case 'freezeUsed':
      return { mood: 'wave', title: 'Streak saved', text: `A streak freeze covered the missed day${event.count > 1 ? 's' : ''}.` };
    case 'taskRepeat':
      return { mood: 'wave', title: event.name, text: event.gems ? `Done again today · +${event.gems} gems` : 'Done again today · gem limit reached for today' };
    default:
      return null;
  }
}

/** One small toast at the bottom of the screen with the robot, for whatever a task just earned. */
export default function ProgressToast() {
  const [toast, setToast] = useState(null);
  const pendingRef = useRef(null);
  const pointersDownRef = useRef(0);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    const show = (next) => {
      clearTimeout(hideTimerRef.current);
      setToast({ ...next, key: Date.now() });
      robotReact(next.mood === 'sad' ? 'sad' : next.mood === 'cheer' ? 'cheer' : 'hello');
      hideTimerRef.current = setTimeout(() => setToast(null), SHOW_MS);
    };

    const onProgress = (e) => {
      let off = false;
      try {
        off = window.localStorage.getItem(TOASTS_OFF_KEY) === '1';
      } catch {
        off = false;
      }
      const events = e.detail?.events || [];
      if (off || !events.length) return;
      const top = [...events].sort((a, b) => (RANK[b.type] || 0) - (RANK[a.type] || 0))[0];
      const next = describe(top);
      if (!next) return;
      // Never while a pen or finger is on the page: wait for it to lift
      if (pointersDownRef.current > 0) pendingRef.current = next;
      else show(next);
    };

    const onDown = () => { pointersDownRef.current += 1; };
    const onUp = () => {
      pointersDownRef.current = Math.max(0, pointersDownRef.current - 1);
      if (pointersDownRef.current === 0 && pendingRef.current) {
        const next = pendingRef.current;
        pendingRef.current = null;
        show(next);
      }
    };

    window.addEventListener(PROGRESS_EVENT, onProgress);
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onUp, true);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, onProgress);
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onUp, true);
      clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 z-[90] flex justify-center px-4"
      style={{ bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
    >
      {toast && (
        <div
          key={toast.key}
          className="pointer-events-auto flex max-w-[440px] items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl"
          style={{ background: '#1E1E20', borderColor: '#34343A', color: '#F4F4F2' }}
        >
          <NetzRobot size={52} mood={toast.mood} listen={false} title="NETZ robot" />
          <div className="min-w-0">
            <div className="text-[15px] font-bold leading-snug">{toast.title}</div>
            <div className="text-[13px] leading-snug" style={{ color: '#B4B4BA' }}>{toast.text}</div>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Close"
            className="ml-1 flex h-11 w-11 flex-none items-center justify-center rounded-xl"
            style={{ color: '#B4B4BA' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
