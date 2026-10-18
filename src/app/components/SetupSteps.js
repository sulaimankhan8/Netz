'use client';

import React from 'react';

/**
 * "Step 0" card for the method pages: the setup a student does before the main steps
 * (step size h, number of steps, sums, degrees of freedom, the sign-change search ...).
 *
 * @param {string[]} lines - Plain-text setup lines, in order
 * @param {string} [title] - Card heading
 * @param {number} [maxLines] - Long logs keep only the last maxLines lines
 */
export default function SetupSteps({ lines, title = 'Step 0: Setup', maxLines = 8 }) {
  if (!lines || lines.length === 0) return null;
  const hidden = Math.max(0, lines.length - maxLines);
  const shown = hidden > 0 ? lines.slice(-maxLines) : lines;

  return (
    <div className="border-2 border-black/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-none space-y-3">
      <h4 className="text-lg font-black uppercase text-black dark:text-white">{title}</h4>
      <ol className="space-y-1.5 font-mono text-xs md:text-sm text-black dark:text-white">
        {hidden > 0 && (
          <li className="text-neutral-500 dark:text-neutral-400">… {hidden} earlier line{hidden === 1 ? '' : 's'} not shown</li>
        )}
        {shown.map((line, i) => (
          <li key={i} className="px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-black/10 dark:border-neutral-700 break-words">
            {line}
          </li>
        ))}
      </ol>
    </div>
  );
}
