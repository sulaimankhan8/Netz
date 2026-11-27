'use client';
// The live curve-tracing calculator. The maths is in src/app/utils/engines/curve-tracing.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/curve-tracing';

const EXAMPLES = [
  { label: 'x³ − 3x', input: { f: 'x^3 - 3x' } },
  { label: 'x² / (x² − 1)', input: { f: 'x^2/(x^2 - 1)' } },
  { label: '(x² − 1) / (x² + 1)', input: { f: '(x^2 - 1)/(x^2 + 1)' } },
  { label: 'x / (x² + 1)', input: { f: 'x/(x^2 + 1)' } },
  { label: 'x eˣ', input: { f: 'x*e^x' } },
  { label: 'x⁴ − 2x²', input: { f: 'x^4 - 2x^2' } },
  { label: '(x² + 1) / (x − 1)', input: { f: '(x^2 + 1)/(x - 1)' } },
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="curve-tracing" unit={6} title="Curve Tracing Engine" button="Trace the Curve"
      start={{ f: 'x^3 - 3x' }}
      fields={[{ key: 'f', label: 'y = f(x)', placeholder: 'e.g. x^3 - 3x', wide: true, maths: true }]}
      examples={EXAMPLES} solve={solve}
      hint="Works for polynomials, fractions of polynomials and common functions of x. NETZ goes through the checklist: domain, symmetry, intercepts, asymptotes, rise and fall, bending, then draws it."
      resultLabel="The curve, traced"
      renderResult={(a) => (
        <div className="space-y-3 min-w-0">
          {a.plot && <CoordPlot fn={a.plot.fn} lines={a.plot.lines || []} points={a.plot.points || []} view={a.plot.view} />}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {a.facts.map((f) => (
              <div key={f.label} className="min-w-0">
                <dt className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">{f.label}</dt>
                <dd className="overflow-x-auto">{f.tex ? <BlockMath math={f.tex} /> : f.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    />
  );
}
