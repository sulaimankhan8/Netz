'use client';
// The live inequality solver. The maths is in src/app/utils/engines/inequalities.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/inequalities';

const EXAMPLES = ['5 - 2x >= 11', 'x^2 - 5x + 6 <= 0', '(x-1)/(x+2) >= 0', 'x^3 - x > 0', '1/x < 1'].map((ineq) => ({ label: ineq, input: { ineq } }));

/** A number line: the solution in colour, filled dots for included ends, hollow dots for excluded ones. */
function NumberLine({ pieces, chart }) {
  const xs = (chart?.cuts ?? []).map((c) => c.x);
  pieces.forEach((p) => { if (Number.isFinite(p.lo)) xs.push(p.lo); if (Number.isFinite(p.hi)) xs.push(p.hi); });
  const lo = xs.length ? Math.min(...xs) : -1, hi = xs.length ? Math.max(...xs) : 1;
  const pad = Math.max((hi - lo) * 0.4, 1.5);
  const [a, b] = [lo - pad, hi + pad];
  const W = 320, X = (x) => 12 + ((Math.max(a, Math.min(b, x)) - a) / (b - a)) * (W - 24);
  const ends = new Map();
  pieces.forEach((p) => {
    if (Number.isFinite(p.lo)) ends.set(p.lo, { x: p.lo, tex: p.loTex, filled: p.loClosed });
    if (Number.isFinite(p.hi)) ends.set(p.hi, { x: p.hi, tex: p.hiTex, filled: p.hiClosed });
  });
  (chart?.cuts ?? []).forEach((c) => { if (!ends.has(c.x)) ends.set(c.x, { x: c.x, tex: c.tex, filled: null }); });
  return (
    <svg viewBox={`0 0 ${W} 54`} className="w-full max-w-[360px] h-auto text-black dark:text-white" role="img" aria-label="Number line of the solution">
      <line x1="4" y1="22" x2={W - 4} y2="22" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" />
      {pieces.map((p, i) => <line key={i} x1={X(p.lo)} y1="22" x2={X(p.hi)} y2="22" stroke="#3B6FC2" strokeWidth="6" strokeLinecap={p.lo === p.hi ? 'round' : 'butt'} className="dark:stroke-[#4F80D4]" />)}
      {[...ends.values()].map((e) => (
        <g key={e.x}>
          {e.filled !== null && <circle cx={X(e.x)} cy="22" r="5" fill={e.filled ? '#3B6FC2' : 'white'} stroke="#3B6FC2" strokeWidth="2" />}
          {e.filled === null && <line x1={X(e.x)} y1="16" x2={X(e.x)} y2="28" stroke="currentColor" strokeOpacity="0.6" />}
          <text x={X(e.x)} y="46" fontSize="10" textAnchor="middle" fill="currentColor" fontFamily="ui-monospace, monospace">{Number(e.x.toPrecision(4))}</text>
        </g>
      ))}
    </svg>
  );
}

export default function InequalityCalculator() {
  return (
    <SymbolicCalculator
      id="inequalities" unit={7} title="Inequality Engine" button="Solve"
      start={{ ineq: '2x - 3 > 5' }}
      fields={[{ key: 'ineq', label: 'Inequality', placeholder: 'e.g. x^2 - 5x + 6 <= 0' }]}
      examples={EXAMPLES} solve={solve}
      hint="Use <, >, <= (≤) or >= (≥). Polynomials and fractions of polynomials in one variable."
      resultLabel="Solution set"
      renderResult={(a) => (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
          <div className="space-y-2 min-w-0">
            <div className="overflow-x-auto"><BlockMath math={a.ineq} /></div>
            <div className="overflow-x-auto text-lg"><BlockMath math={`${a.variable} \\in ${a.answer}`} /></div>
          </div>
          <div className="flex justify-center"><NumberLine pieces={a.pieces} chart={a.chart} /></div>
        </div>
      )}
    />
  );
}
