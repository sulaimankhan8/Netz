'use client';
// The live types-of-discontinuity calculator. The maths is in src/app/utils/engines/discontinuity-types.js.
import React from 'react';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/discontinuity-types';

const EXAMPLES = [
  { label: 'hole: (x² − 1)/(x − 1)', input: { f: '(x^2 - 1)/(x - 1)', lo: '-10', hi: '10' } },
  { label: 'asymptote: 1/(x − 2)', input: { f: '1/(x - 2)', lo: '-10', hi: '10' } },
  { label: 'jump: x + 1 | x − 1', input: { f: 'x + 1 for x < 0; x - 1 for x >= 0', lo: '-10', hi: '10' } },
  { label: 'a hole and an asymptote', input: { f: '(x^2 - 1)/((x - 1)*(x - 3))', lo: '-10', hi: '10' } },
  { label: 'tan x', input: { f: 'tan(x)', lo: '-4', hi: '4' } },
  { label: 'no break: x² + 1', input: { f: 'x^2 + 1', lo: '-10', hi: '10' } },
];

const COLOURS = { Removable: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200', Jump: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200', Infinite: 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200', Continuous: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200' };

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="discontinuity-types" unit={6} title="Discontinuity Engine" button="Find the Breaks"
      start={{ f: '(x^2 - 1)/((x - 1)*(x - 3))', lo: '-10', hi: '10' }}
      fields={[
        { key: 'f', label: 'f(x), or pieces separated by ;', placeholder: 'e.g. 1/(x - 2)', wide: true, maths: true },
        { key: 'lo', label: 'Search from x =', placeholder: '-10' },
        { key: 'hi', label: 'to x =', placeholder: '10' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="For pieces write each as: x^2 for x < 1; 2x - 1 for x >= 1. NETZ checks every point where a bottom is 0 and where a piece starts or ends."
      resultLabel={(a) => (a.broken ? `${a.broken} break${a.broken === 1 ? '' : 's'} found` : 'No breaks found')}
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          {a.points.length === 0 && <p className="text-sm">f has no suspect points between {a.lo} and {a.hi}: it is continuous there.</p>}
          <ul className="space-y-1">
            {a.points.map((p) => (
              <li key={p.a} className="flex flex-wrap items-center gap-2 text-sm font-mono">
                <span>x = {Number(p.a.toPrecision(7))}</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${COLOURS[p.kind] || ''}`}>{p.kind === 'Continuous' ? 'continuous' : `${p.kind.toLowerCase()} discontinuity`}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    />
  );
}
