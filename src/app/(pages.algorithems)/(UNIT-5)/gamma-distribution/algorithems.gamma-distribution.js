'use client';
// The live gamma distribution calculator. The maths is in src/app/utils/engines/gamma-dist.js.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/gamma-dist';

const EXAMPLES = [
  {
    label: "α = 2, θ = 3: P(X ≤ 5)",
    input: {
      alpha: "2",
      theta: "3",
      mode: "less",
      x: "5"
    }
  },
  {
    label: "α = 1 (exponential)",
    input: {
      alpha: "1",
      theta: "2",
      mode: "greater",
      x: "3"
    }
  },
  {
    label: "α = 3.5, θ = 1: P(2 < X < 5)",
    input: {
      alpha: "3.5",
      theta: "1",
      mode: "between",
      a: "2",
      b: "5"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="gamma-dist" unit={5} title="Gamma Distribution Engine" button="Calculate"
      start={{
  alpha: "2",
  theta: "3",
  mode: "less",
  x: "5",
  a: "2",
  b: "8"
}}
      fields={[
        { key: 'mode', label: 'Find', kind: 'choice', options: [{ value: 'less', label: 'P(X ≤ x)' }, { value: 'greater', label: 'P(X > x)' }, { value: 'between', label: 'P(a < X < b)' }] },
        { key: 'alpha', label: 'Shape α', placeholder: '2' }, { key: 'theta', label: 'Scale θ', placeholder: '3' },
        { key: 'x', label: 'x', placeholder: '5', show: (v) => v.mode !== 'between' },
        { key: 'a', label: 'a', placeholder: '2', show: (v) => v.mode === 'between' }, { key: 'b', label: 'b', placeholder: '8', show: (v) => v.mode === 'between' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Scale θ (mean αθ). If your book uses a rate β, θ = 1/β."
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
