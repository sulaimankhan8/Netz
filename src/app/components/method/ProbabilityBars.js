'use client';
// A bar chart of a discrete distribution: one bar per value, the bars the question counts highlighted.
import React from 'react';

/** bars: [{ k, p, in }] */
export default function ProbabilityBars({ bars, label = 'P(X = k)' }) {
  if (!bars?.length) return null;
  const W = 360, H = 200, pad = 26;
  const max = Math.max(...bars.map((b) => b.p), 1e-9);
  const step = (W - pad * 2) / bars.length;
  const bw = Math.max(2, step * 0.7);
  const every = Math.ceil(bars.length / 12);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Bar chart of ${label}`} className="w-full max-w-[360px] h-auto text-black dark:text-white rounded-xl border-2 border-black/20 dark:border-neutral-700 bg-white dark:bg-neutral-900">
      <line x1={pad} y1={H - pad} x2={W - pad / 2} y2={H - pad} stroke="currentColor" strokeOpacity="0.5" />
      {bars.map((b, i) => {
        const h = ((H - pad * 2) * b.p) / max;
        const x = pad + i * step + (step - bw) / 2;
        return (
          <g key={i}>
            <rect x={x} y={H - pad - h} width={bw} height={h} rx="1.5" fill={b.in ? '#3B6FC2' : 'currentColor'} fillOpacity={b.in ? 1 : 0.22} className={b.in ? 'dark:fill-[#4F80D4]' : ''} />
            {i % every === 0 && <text x={x + bw / 2} y={H - pad + 13} fontSize="9" textAnchor="middle" fill="currentColor" opacity="0.7" fontFamily="ui-monospace, monospace">{Number(b.k.toPrecision ? b.k.toPrecision(4) : b.k)}</text>}
          </g>
        );
      })}
      <text x={pad} y={14} fontSize="9" fill="currentColor" opacity="0.6" fontFamily="ui-monospace, monospace">{label}; highlighted bars are counted</text>
    </svg>
  );
}
