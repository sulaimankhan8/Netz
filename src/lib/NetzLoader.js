'use client';

import React, { useEffect, useState } from 'react';

const DEFAULT_STEPS = [
  'Getting things ready',
  'Loading your page',
  'Almost there',
];

// Riemann-sum bars under a curve: the loader "integrates" while you wait.
const BARS = Array.from({ length: 12 }, (_, i) => {
  const x = 14 + i * 14;
  const h = 18 + 34 * Math.sin((i / 11) * Math.PI * 0.9 + 0.35);
  return { x, h: Math.round(h) };
});

export default function NetzLoader({ steps = DEFAULT_STEPS }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % steps.length), 1600);
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/85 dark:bg-neutral-950/85 backdrop-blur-md"
    >
      <style>{`
        @keyframes nz-draw { 0%{stroke-dashoffset:260} 60%,100%{stroke-dashoffset:0} }
        @keyframes nz-bar { 0%,100%{transform:scaleY(.15);opacity:.35} 50%{transform:scaleY(1);opacity:1} }
        @keyframes nz-slide { 0%{transform:translateX(-110%)} 100%{transform:translateX(260%)} }
        @keyframes nz-fade { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
        .nz-curve{stroke-dasharray:260;animation:nz-draw 2.4s ease-in-out infinite}
        .nz-bar{transform-box:fill-box;transform-origin:bottom;animation:nz-bar 2.4s ease-in-out infinite}
        .nz-slide{animation:nz-slide 1.4s cubic-bezier(.4,0,.2,1) infinite}
        .nz-step{animation:nz-fade .35s ease-out}
        @media (prefers-reduced-motion: reduce){
          .nz-curve,.nz-bar,.nz-slide{animation:none}
          .nz-curve{stroke-dashoffset:0}
          .nz-bar{opacity:.8}
          .nz-slide{transform:none;width:100%!important}
        }
      `}</style>

      <div className="flex w-full max-w-xs flex-col items-center px-6 text-center">
        <svg
          viewBox="0 0 180 80"
          className="h-24 w-full text-indigo-600 dark:text-indigo-400"
          aria-hidden="true"
        >
          <line x1="8" y1="70" x2="172" y2="70" className="stroke-gray-300 dark:stroke-neutral-700" strokeWidth="1.5" />
          {BARS.map((b, i) => (
            <rect
              key={i}
              x={b.x - 5}
              y={70 - b.h}
              width="10"
              height={b.h}
              rx="1.5"
              fill="currentColor"
              className="nz-bar"
              style={{ animationDelay: `${i * 0.09}s` }}
              opacity="0.8"
            />
          ))}
          <path
            d="M10 56 C 38 20, 60 14, 88 22 S 142 44, 170 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="nz-curve"
          />
        </svg>

        <p className="mt-5 text-lg font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
          NETZ
        </p>

        <p
          key={step}
          className="nz-step mt-1 h-5 text-sm text-gray-500 dark:text-neutral-400"
        >
          {steps[step]}…
        </p>

        <div className="relative mt-5 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-800">
          <div
            className="nz-slide absolute inset-y-0 left-0 rounded-full bg-indigo-600 dark:bg-indigo-400"
            style={{ width: '40%' }}
          />
        </div>
      </div>
    </div>
  );
}
