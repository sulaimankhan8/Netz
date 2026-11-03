'use client';

import React from 'react';
import { FiTrash2 } from 'react-icons/fi';

/**
 * Data points (x_i, y_i) for the interpolation pages.
 * Each row: point number, x box, y box, delete. The two boxes share all the remaining width,
 * so a value like 479.425539 is never cut off on a 375px phone (the old table left ~80px per box).
 */
export default function DataPointsInput({
  rows,
  onChange,
  onDelete,
  xPlaceholder = 'e.g. 10',
  yPlaceholder = 'e.g. 0.1736',
  xLabel = 'x_i',
  yLabel = 'y_i',
}) {
  const grid = 'grid grid-cols-[1.25rem_minmax(0,0.8fr)_minmax(0,1.2fr)_2.5rem] sm:grid-cols-[1.5rem_minmax(0,1fr)_minmax(0,1fr)_2.5rem] items-center gap-1.5 sm:gap-2';
  const box = 'w-full min-w-0 px-1 sm:px-2 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-center font-mono font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white';

  return (
    <div className="rounded-xl border-2 border-black/80 dark:border-neutral-700 overflow-hidden">
      <div className={`${grid} px-2 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-mono font-bold uppercase`}>
        <span className="text-center">#</span>
        <span className="text-center">{xLabel}</span>
        <span className="text-center">{yLabel}</span>
        <span className="sr-only">Delete</span>
      </div>
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {rows.map((row, index) => (
          <div key={index} className={`${grid} px-2 py-1.5`}>
            <span className="text-center text-xs font-mono font-bold text-neutral-500">{index + 1}</span>
            <input
              type="number"
              step="any"
              value={row.x}
              onChange={(e) => onChange(index, 'x', e.target.value)}
              placeholder={xPlaceholder}
              aria-label={`Point ${index + 1} x`}
              className={`${box} text-sm`}
            />
            <input
              type="number"
              step="any"
              value={row.y}
              onChange={(e) => onChange(index, 'y', e.target.value)}
              placeholder={yPlaceholder}
              aria-label={`Point ${index + 1} y`}
              className={`${box} text-sm`}
            />
            <button
              type="button"
              onClick={() => onDelete(index)}
              aria-label={`Delete point ${index + 1}`}
              className="h-10 w-10 flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
