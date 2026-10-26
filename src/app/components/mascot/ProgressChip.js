'use client';

import Link from 'next/link';
import useProgress from '@/app/utils/progress/useProgress';
import { FlameIcon, GemIcon } from './art';

/**
 * Streak, gems and today's tasks in one small link to the Profile page (NETZ_LAUNCH_PLAN.md 2.8).
 * variant: 'rail' (collapsed side rail), 'row' (open sidebar), 'phone' (top bar on phones).
 */
export default function ProgressChip({ variant = 'row' }) {
  const snap = useProgress();
  if (!snap) return null;
  const { streak, gems, doneToday, goal } = snap.summary;
  const label = `Profile: ${streak}-day streak, ${gems} gems, ${Math.min(doneToday, goal)} of ${goal} tasks today`;

  if (variant === 'rail') {
    return (
      <Link
        href="/Profile"
        aria-label={label}
        title={label}
        className="mx-auto flex w-11 flex-col items-center gap-0.5 rounded-xl py-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800"
      >
        <FlameIcon size={18} />
        <span className="text-[12px] font-bold tabular-nums text-neutral-900 dark:text-white">{streak}</span>
        <span className="text-[10px] tabular-nums text-neutral-500 dark:text-neutral-400">{Math.min(doneToday, goal)}/{goal}</span>
      </Link>
    );
  }

  if (variant === 'phone') {
    return (
      <Link
        href="/Profile"
        aria-label={label}
        className="flex min-h-[44px] items-center gap-2.5 rounded-xl border border-neutral-300 bg-white px-3 font-mono text-[13px] font-bold tabular-nums text-neutral-900 dark:border-neutral-700 dark:bg-[#1A1A1A] dark:text-white"
      >
        <span className="flex items-center gap-1"><FlameIcon size={16} />{streak}</span>
        <span className="flex items-center gap-1"><GemIcon size={16} />{gems}</span>
      </Link>
    );
  }

  return (
    <Link
      href="/Profile"
      aria-label={label}
      className="flex min-h-[40px] items-center gap-3 rounded-xl border border-neutral-200 px-3 text-xs font-mono font-bold tabular-nums text-neutral-800 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-900"
    >
      <span className="flex items-center gap-1"><FlameIcon size={15} />{streak}</span>
      <span className="flex items-center gap-1"><GemIcon size={15} />{gems}</span>
      <span className="ml-auto text-neutral-500 dark:text-neutral-400">{Math.min(doneToday, goal)}/{goal} today</span>
    </Link>
  );
}
