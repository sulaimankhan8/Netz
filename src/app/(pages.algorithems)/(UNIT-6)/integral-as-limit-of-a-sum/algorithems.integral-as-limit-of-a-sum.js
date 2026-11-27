'use client';
// The live limit-of-a-sum (Riemann sum) calculator. The maths is in src/app/utils/engines/riemann-sum.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/riemann-sum';
import { sig } from '@/app/utils/numberFormat';

const EXAMPLES = [
  { label: 'x² on [0, 1], 4 strips', input: { f: 'x^2', a: '0', b: '1', n: '4', rule: 'right' } },
  { label: 'x² + 1 on [0, 2], 8 strips', input: { f: 'x^2 + 1', a: '0', b: '2', n: '8', rule: 'right' } },
  { label: 'x³ on [0, 2], 10 strips', input: { f: 'x^3', a: '0', b: '2', n: '10', rule: 'right' } },
  { label: '2x + 3 on [1, 3], 6 strips', input: { f: '2x + 3', a: '1', b: '3', n: '6', rule: 'left' } },
  { label: 'sin x on [0, π], midpoint', input: { f: 'sin(x)', a: '0', b: 'pi', n: '10', rule: 'mid' } },
  { label: '1/x on [1, 2], 20 strips', input: { f: '1/x', a: '1', b: '2', n: '20', rule: 'mid' } },
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="riemann-sum" unit={6} title="Limit-of-a-Sum Engine" button="Add the Rectangles"
      start={{ f: 'x^2', a: '0', b: '1', n: '4', rule: 'right' }}
      fields={[
        { key: 'rule', label: 'Rectangle heights taken at the', kind: 'choice', options: [{ value: 'left', label: 'Left end' }, { value: 'right', label: 'Right end' }, { value: 'mid', label: 'Middle' }] },
        { key: 'f', label: 'f(x) =', placeholder: 'e.g. x^2', wide: true, maths: true },
        { key: 'a', label: 'From x = a', placeholder: 'e.g. 0' },
        { key: 'b', label: 'To x = b', placeholder: 'e.g. 1' },
        { key: 'n', label: 'Number of strips, n', placeholder: 'e.g. 4' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Try a small n first to see the rectangles, then a large n to watch the sum close in on the exact area."
      resultLabel="Sum of the rectangles"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`S_{${a.n}} \\approx ${sig(a.sum, 8)}`} /></div>
          <p className="text-sm font-mono">Exact area{a.exactNumeric ? ' (numerical)' : ''}: {sig(a.exactValue, 8)} · difference: {sig(a.error, 4)}</p>
          {a.plot && <CoordPlot fn={a.plot.fn} shade={a.plot.shade} view={a.plot.view} />}
          <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
            <table className="w-full text-center text-xs md:text-sm font-mono border-collapse">
              <thead><tr className="bg-neutral-200 dark:bg-neutral-900 font-bold"><th className="p-2">n</th><th className="p-2">Sum S</th><th className="p-2">Error</th></tr></thead>
              <tbody>
                {a.convergence.map((r) => (
                  <tr key={r.n} className={`border-t border-black/15 dark:border-neutral-700 ${r.n === a.n ? 'bg-[#FFE600]/20 font-bold' : ''}`}>
                    <td className="p-2">{r.n}</td><td className="p-2">{sig(r.sum, 8)}</td><td className="p-2">{sig(r.error, 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    />
  );
}
