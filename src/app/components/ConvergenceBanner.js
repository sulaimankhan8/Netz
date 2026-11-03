'use client';

import React from 'react';
import { plural } from '@/app/utils/numberFormat';

/**
 * Result box for the iterative methods. Green only when the method really converged;
 * amber when it stopped at the iteration limit or failed, so a last value is never shown as a root.
 *
 * @param {boolean} converged
 * @param {number} count - iterations done
 * @param {React.ReactNode} children - the result line
 * @param {React.ReactNode} [action] - e.g. the Export button
 */
export default function ConvergenceBanner({ converged, count, children, action }) {
  const tone = converged
    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]'
    : 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 shadow-[2px_2px_0px_0px_rgba(245,158,11,0.3)]';
  const label = converged
    ? `Converged in ${plural(count, 'iteration')}`
    : `Did not converge · stopped after ${plural(count, 'iteration')}`;

  return (
    <div role="status" className={`p-5 border-2 rounded-xl flex items-center justify-between flex-wrap gap-4 ${tone}`}>
      <div className="min-w-0">
        <span className={`text-xs font-mono font-bold uppercase block ${converged ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-300'}`}>
          {label}
        </span>
        <span className="text-base md:text-lg font-mono font-black break-words">{children}</span>
      </div>
      {action}
    </div>
  );
}
