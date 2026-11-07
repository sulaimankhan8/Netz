'use client';
// The live exponential distribution calculator. The maths is in src/app/utils/engines/exponential-dist.js.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/exponential-dist';

const EXAMPLES = [
  {
    label: "λ = 0.5, P(X ≤ 2)",
    input: {
      lambda: "0.5",
      mode: "less",
      x: "2"
    }
  },
  {
    label: "mean life 1000 h, P(X > 1200)",
    input: {
      lambda: "0.001",
      mode: "greater",
      x: "1200"
    }
  },
  {
    label: "λ = 2, P(1 < X < 3)",
    input: {
      lambda: "2",
      mode: "between",
      a: "1",
      b: "3"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="exponential-dist" unit={5} title="Exponential Distribution Engine" button="Calculate"
      start={{
  lambda: "0.5",
  mode: "less",
  x: "2",
  a: "1",
  b: "3"
}}
      fields={[
        { key: 'mode', label: 'Find', kind: 'choice', options: [{ value: 'less', label: 'P(X ≤ x)' }, { value: 'greater', label: 'P(X > x)' }, { value: 'between', label: 'P(a < X < b)' }] },
        { key: 'lambda', label: 'Rate λ', placeholder: '0.5' },
        { key: 'x', label: 'x', placeholder: '2', show: (v) => v.mode !== 'between' },
        { key: 'a', label: 'a', placeholder: '1', show: (v) => v.mode === 'between' }, { key: 'b', label: 'b', placeholder: '3', show: (v) => v.mode === 'between' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="λ is the rate: mean = 1/λ."
      resultLabel="Probability"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`${a.query} = ${a.p}`} /></div>
          <p className="text-sm">Mean <InlineMath math={a.mean} />, variance <InlineMath math={a.variance} /></p>
          {a.plot && <CoordPlot fn={a.plot.fn} shade={a.plot.shade} view={a.plot.view} />}
        </div>
      )}
    />
  );
}
