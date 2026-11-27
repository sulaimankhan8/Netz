'use client';

import React from 'react';

export default function NetzLoader({ label = 'Loading' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-gray-50/90 dark:bg-neutral-950/90 backdrop-blur-sm"
    >
      <style>{`
        @keyframes nz-spin { to { transform: rotate(360deg) } }
        .nz-ring { animation: nz-spin .8s linear infinite }
        @media (prefers-reduced-motion: reduce) { .nz-ring { animation-duration: 2.4s } }
      `}</style>

      <svg viewBox="0 0 40 40" className="nz-ring h-10 w-10 text-indigo-600 dark:text-indigo-400" aria-hidden="true">
        <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3" className="stroke-gray-200 dark:stroke-neutral-800" />
        <path d="M20 4a16 16 0 0 1 16 16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <p className="text-sm font-medium tracking-wide text-gray-500 dark:text-neutral-400">{label}</p>
    </div>
  );
}
