'use client';
// Stacked bars for money over time (Unit 10): principal and interest per year.
// Palette checked with the dataviz validator: light #3B6FC2 / #D9692A on white, dark #4F80D4 / #DD7135 on #171717.
// Identity is never colour alone: a legend sits above, and the hovered/tapped bar's values are spelled out below.
import React, { useEffect, useRef, useState } from 'react';

export const SERIES_CLASSES = [
  { fill: 'fill-[#3B6FC2] dark:fill-[#4F80D4]', swatch: 'bg-[#3B6FC2] dark:bg-[#4F80D4]' },
  { fill: 'fill-[#D9692A] dark:fill-[#DD7135]', swatch: 'bg-[#D9692A] dark:bg-[#DD7135]' },
];

// The chart is drawn at its real on-screen width (measured), so text stays a true 11px on phones too
const H = 240, LEFT = 56, RIGHT = 8, TOP = 10, BOTTOM = 26;

/** 1, 2 or 5 × 10ⁿ above max/4, for 4 tidy gridlines. */
function niceStep(max) {
  const raw = max / 4 || 1;
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw);
}

/**
 * rows: [{ label, parts: [number, number] }]   series: ['Principal', 'Interest']
 * format(value) → text for axis and readout. title: what the chart shows (for screen readers).
 */
export default function StackedBars({ rows, series, format, title, xLabel = 'Year' }) {
  const [active, setActive] = useState(null);
  const [W, setW] = useState(640);
  const boxRef = useRef(null);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  if (!rows?.length) return null;
  const max = Math.max(...rows.map((r) => r.parts.reduce((a, b) => a + b, 0)));
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step || 1;
  const plotW = W - LEFT - RIGHT, plotH = H - TOP - BOTTOM;
  const slot = plotW / rows.length;
  const barW = Math.max(2, Math.min(36, slot * 0.7));
  const y = (v) => TOP + plotH - (v / top) * plotH;
  // About one x label per 44px, so they never collide
  const labelEvery = Math.max(1, Math.ceil(rows.length / Math.max(2, Math.floor(plotW / 44))));
  const shown = active ?? rows.length - 1;
  const cur = rows[shown];

  return (
    <figure ref={boxRef} className="space-y-2">
      <div className="flex flex-wrap gap-4 text-xs font-mono font-bold text-black dark:text-white">
        {series.map((s, i) => (
          <span key={s} className="flex items-center gap-1.5"><span className={`inline-block w-3 h-3 rounded-sm ${SERIES_CLASSES[i].swatch}`} />{s}</span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} className="w-full h-auto text-black dark:text-white" onMouseLeave={() => setActive(null)}>
        {Array.from({ length: Math.round(top / step) + 1 }, (_, k) => k * step).map((v) => (
          <g key={v}>
            <line x1={LEFT} x2={W - RIGHT} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={v === 0 ? 0.5 : 0.12} />
            <text x={LEFT - 6} y={y(v)} fontSize="11" textAnchor="end" dominantBaseline="middle" fill="currentColor" opacity="0.7" fontFamily="ui-monospace, monospace">{format(v, true)}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const x = LEFT + slot * i + (slot - barW) / 2;
          let base = 0;
          return (
            <g key={i} onMouseEnter={() => setActive(i)} onClick={() => setActive(i)} className="cursor-pointer">
              {/* Hit area taller and wider than the bar */}
              <rect x={LEFT + slot * i} y={TOP} width={slot} height={plotH} fill="transparent" />
              {r.parts.map((v, s) => {
                if (v <= 0) return null;
                const y0 = y(base + v), h = Math.max(0, y(base) - y(base + v) - (base > 0 ? 2 : 0)); // 2px gap between segments
                base += v;
                const topSeg = s === r.parts.length - 1 || r.parts.slice(s + 1).every((p) => p <= 0);
                return <rect key={s} x={x} y={y0} width={barW} height={h} rx={topSeg ? Math.min(4, barW / 2) : 0} className={SERIES_CLASSES[s].fill} opacity={active === null || active === i ? 1 : 0.45} />;
              })}
              {(i % labelEvery === 0 || i === rows.length - 1) && (
                <text x={LEFT + slot * i + slot / 2} y={H - 8} fontSize="11" textAnchor="middle" fill="currentColor" opacity="0.7" fontFamily="ui-monospace, monospace">{r.label}</text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="text-xs font-mono text-neutral-700 dark:text-neutral-300" aria-live="polite">
        {xLabel} {cur.label}: {series.map((s, i) => `${s} ${format(cur.parts[i])}`).join(' · ')} · Total {format(cur.parts.reduce((a, b) => a + b, 0))}
        <span className="text-neutral-500"> (tap or hover a bar)</span>
      </figcaption>
    </figure>
  );
}
