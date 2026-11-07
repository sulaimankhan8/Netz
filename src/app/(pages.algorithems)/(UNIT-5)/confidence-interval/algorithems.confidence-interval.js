'use client';
// The live confidence interval calculator. The maths is in src/app/utils/engines/confidence-interval.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/confidence-interval';

const EXAMPLES = [
  {
    label: "x̄ = 50, σ = 10, n = 25, 95%",
    input: {
      mode: "z",
      xbar: "50",
      sd: "10",
      n: "25",
      level: "95"
    }
  },
  {
    label: "small sample: x̄ = 12, s = 3, n = 10",
    input: {
      mode: "t",
      xbar: "12",
      sd: "3",
      n: "10",
      level: "95"
    }
  },
  {
    label: "120 of 400 say yes, 99%",
    input: {
      mode: "proportion",
      x: "120",
      n: "400",
      level: "99"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="confidence-interval" unit={5} title="Confidence Interval Engine" button="Find the Interval"
      start={{
  mode: "z",
  xbar: "50",
  sd: "10",
  n: "25",
  level: "95",
  x: ""
}}
      fields={[
        { key: 'mode', label: 'For', kind: 'choice', options: [{ value: 'z', label: 'Mean (σ known)' }, { value: 't', label: 'Mean (σ unknown)' }, { value: 'proportion', label: 'Proportion' }] },
        { key: 'xbar', label: 'Sample mean x̄', placeholder: '50', show: (v) => v.mode !== 'proportion' },
        { key: 'sd', label: 'σ (or sample s)', placeholder: '10', show: (v) => v.mode !== 'proportion' },
        { key: 'x', label: 'Number of successes', placeholder: '120', show: (v) => v.mode === 'proportion' },
        { key: 'n', label: 'Sample size n', placeholder: '25' }, { key: 'level', label: 'Confidence level (%)', placeholder: '95' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Use the t interval when σ is estimated from a small sample."
      resultLabel={(a) => `${a.level}% confidence interval`}
      renderResult={(a) => <div className="overflow-x-auto text-lg min-w-0"><BlockMath math={`${a.centre} \\pm ${a.margin} = ${a.interval}`} /></div>}
    />
  );
}
