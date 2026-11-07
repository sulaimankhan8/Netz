'use client';
// The live uniform distribution calculator. The maths is in src/app/utils/engines/uniform-dist.js.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/uniform-dist';

const EXAMPLES = [
  {
    label: "U(0, 10): P(3 < X < 7)",
    input: {
      a: "0",
      b: "10",
      c: "3",
      d: "7"
    }
  },
  {
    label: "bus every 15 min: wait < 5",
    input: {
      a: "0",
      b: "15",
      c: "0",
      d: "5"
    }
  },
  {
    label: "U(−2, 2): P(X > 1)",
    input: {
      a: "-2",
      b: "2",
      c: "1",
      d: "2"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="uniform-dist" unit={5} title="Uniform Distribution Engine" button="Calculate"
      start={{
  a: "0",
  b: "10",
  c: "3",
  d: "7"
}}
      fields={[
        { key: 'a', label: 'a (lowest value)', placeholder: '0' }, { key: 'b', label: 'b (highest value)', placeholder: '10' },
        { key: 'c', label: 'P(c < X < d): c', placeholder: '3' }, { key: 'd', label: 'd', placeholder: '7' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="X is equally likely anywhere in [a, b]."
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
