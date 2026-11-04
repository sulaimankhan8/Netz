'use client';
// The live double integration calculator. The maths is in src/app/utils/engines/double-integration.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method/StepTable';
import { solve } from '@/app/utils/engines/double-integration';

const RULES = [{ value: 'simpson', label: "Simpson's 1/3" }, { value: 'trapezoidal', label: 'Trapezoidal' }];
const EXAMPLES = [
  { label: '1/(x + y) on [1, 2] × [1, 2]', input: { f: '1/(x+y)', a: '1', b: '2', c: '1', d: '2', m: '4', n: '4' } },
  { label: 'e^(x+y) on [0, 1]²', input: { f: 'exp(x+y)', a: '0', b: '1', c: '0', d: '1', m: '2', n: '2' } },
  { label: 'xy on [0, 1] × [0, 2]', input: { f: 'x*y', a: '0', b: '1', c: '0', d: '2', m: '2', n: '2' } },
];

export default function DoubleIntegrationCalculator() {
  return (
    <SymbolicCalculator
      id="double-integration" unit={3} title="Double Integration Engine" button="Integrate"
      start={{ f: '1/(x+y)', a: '1', b: '2', c: '1', d: '2', m: '4', n: '4', rule: 'trapezoidal' }}
      fields={[
        { key: 'rule', label: 'Rule', kind: 'choice', options: RULES },
        { key: 'f', label: 'f(x, y)', placeholder: 'e.g. 1/(x+y)', wide: true },
        { key: 'a', label: 'x from' }, { key: 'b', label: 'x to' },
        { key: 'c', label: 'y from' }, { key: 'd', label: 'y to' },
        { key: 'm', label: 'Strips in x' }, { key: 'n', label: 'Strips in y' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Write x*y for a product. Simpson's rule needs an even number of strips in each direction."
      resultLabel="Double integral"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`\\int_{${a.limits.c}}^{${a.limits.d}}\\int_{${a.limits.a}}^{${a.limits.b}} ${a.f}\\,dx\\,dy \\approx ${Number(a.value.toPrecision(8))}`} /></div>
          <p className="text-sm font-mono">Very fine grid: {Number(a.accurate.toPrecision(8))} (error ≈ {Number(a.error.toPrecision(3))})</p>
        </div>
      )}
      renderSteps={(a) => (a.table ? <StepTable columns={a.table.columns} rows={a.table.rows} /> : null)}
    />
  );
}
