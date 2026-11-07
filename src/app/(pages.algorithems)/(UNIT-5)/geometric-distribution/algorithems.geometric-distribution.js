'use client';
// The live geometric distribution calculator. The maths is in src/app/utils/engines/geometric-dist.js.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import ProbabilityBars from '@/app/components/method/ProbabilityBars';
import { solve } from '@/app/utils/engines/geometric-dist';

const EXAMPLES = [
  {
    label: "p = 0.2, first success on trial 3",
    input: {
      p: "0.2",
      k: "3",
      mode: "exact"
    }
  },
  {
    label: "die: a six within 4 rolls",
    input: {
      p: "1/6",
      k: "4",
      mode: "atmost"
    }
  },
  {
    label: "p = 0.1, needs at least 5 trials",
    input: {
      p: "0.1",
      k: "5",
      mode: "atleast"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="geometric-dist" unit={5} title="Geometric Distribution Engine" button="Calculate"
      start={{
  p: "0.2",
  k: "3",
  mode: "exact"
}}
      fields={[
        { key: 'mode', label: 'Find', kind: 'choice', options: [{ value: 'exact', label: 'P(X = k)' }, { value: 'atmost', label: 'P(X ≤ k)' }, { value: 'atleast', label: 'P(X ≥ k)' }] },
        { key: 'p', label: 'Success probability p', placeholder: '0.2' }, { key: 'k', label: 'k (trial number)', placeholder: '3' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="X counts trials up to and including the first success."
      resultLabel="Probability"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`${a.query} = ${a.p}`} /></div>
          <p className="text-sm">Mean <InlineMath math={a.mean} />, variance <InlineMath math={a.variance} /></p>
          <ProbabilityBars bars={a.bars} />
        </div>
      )}
    />
  );
}
