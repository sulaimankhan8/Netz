'use client';
// The live inverse trig calculator. The maths is in src/app/utils/engines/inverse-trig.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/inverse-trig';

const EXAMPLES = [
  {
    label: "cos⁻¹(−1/2)",
    input: {
      mode: "value",
      fn: "cos",
      value: "-1/2"
    }
  },
  {
    label: "sin⁻¹(−√3/2)",
    input: {
      mode: "value",
      fn: "sin",
      value: "-sqrt(3)/2"
    }
  },
  {
    label: "sec⁻¹(2)",
    input: {
      mode: "value",
      fn: "sec",
      value: "2"
    }
  },
  {
    label: "sin⁻¹(sin 5π/6)",
    input: {
      mode: "compose",
      fn: "sin",
      angle: "5pi/6"
    }
  },
  {
    label: "tan⁻¹(1/2) + tan⁻¹(1/3)",
    input: {
      mode: "sum",
      a: "1/2",
      b: "1/3",
      op: "+"
    }
  },
  {
    label: "tan⁻¹2 + tan⁻¹3",
    input: {
      mode: "sum",
      a: "2",
      b: "3",
      op: "+"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="inverse-trig" unit={9} title="Inverse Trig Engine" button="Find the Value"
      start={{
  mode: "value",
  fn: "cos",
  value: "-1/2",
  angle: "5pi/6",
  a: "1/2",
  b: "1/3",
  op: "+"
}}
      fields={[
        { key: 'mode', label: 'Find', kind: 'choice', options: [{ value: 'value', label: "Principal value" }, { value: 'compose', label: "f⁻¹(f(θ))" }, { value: 'sum', label: "tan⁻¹a ± tan⁻¹b" }] },
        { key: 'fn', label: 'Function', kind: 'select', options: [{ value: 'sin', label: "sin⁻¹" }, { value: 'cos', label: "cos⁻¹" }, { value: 'tan', label: "tan⁻¹" }, { value: 'cot', label: "cot⁻¹" }, { value: 'sec', label: "sec⁻¹" }, { value: 'csc', label: "csc⁻¹" }], show: (v) => v.mode !== 'sum' },
        { key: 'value', label: 'Value', placeholder: 'e.g. -1/2 or sqrt(3)/2', show: (v) => v.mode === 'value' },
        { key: 'angle', label: 'Angle θ (radians, use pi)', placeholder: 'e.g. 5pi/6', show: (v) => v.mode === 'compose' },
        { key: 'a', label: 'a', show: (v) => v.mode === 'sum' }, { key: 'b', label: 'b', show: (v) => v.mode === 'sum' },
        { key: 'op', label: 'Sign', kind: 'choice', options: [{ value: '+', label: "a + b" }, { value: '-', label: "a − b" }], show: (v) => v.mode === 'sum' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Values like 1/2, sqrt(3)/2 and angles like 5pi/6 are fine."
      resultLabel={(a) => `Principal value (${a.degrees})`}
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={a.answer} /></div>}
    />
  );
}
