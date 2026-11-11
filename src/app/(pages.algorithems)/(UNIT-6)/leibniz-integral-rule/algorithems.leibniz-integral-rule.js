'use client';
// The live Leibniz integral rule calculator. The maths is in src/app/utils/engines/leibniz-integral-rule.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/leibniz-integral-rule';

const EXAMPLES = [
  {
    label: "∫₀¹ (xᵃ − 1)/ln x dx",
    input: {
      mode: "evaluate",
      f: "(x^a - 1)/log(x)",
      lo: "0",
      hi: "1",
      a0: ""
    }
  },
  {
    label: "∫₀^∞ e^(−ax) sin x / x dx",
    input: {
      mode: "evaluate",
      f: "e^(-a x) sin(x)/x",
      lo: "0",
      hi: "inf",
      a0: "inf"
    }
  },
  {
    label: "F′ for ∫ₐ^{a²} sin(ax)/x dx",
    input: {
      mode: "derivative",
      f: "sin(a x)/x",
      lo: "a",
      hi: "a^2",
      a0: ""
    }
  },
  {
    label: "F′ for ∫₀ᵃ ax² dx",
    input: {
      mode: "derivative",
      f: "x^2 a",
      lo: "0",
      hi: "a",
      a0: ""
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="leibniz-integral-rule" unit={6} title="Leibniz Rule Engine" button="Solve"
      start={{
  mode: "evaluate",
  f: "(x^a - 1)/log(x)",
  lo: "0",
  hi: "1",
  a0: ""
}}
      fields={[
        { key: 'mode', label: 'Do', kind: 'choice', options: [{ value: 'evaluate', label: "Evaluate F(a) using F′(a)" }, { value: 'derivative', label: "Find F′(a)" }] },
        { key: 'f', label: 'f(x, a)', placeholder: '(x^a - 1)/log(x)', wide: true },
        { key: 'lo', label: 'From', placeholder: '0' }, { key: 'hi', label: 'To (inf allowed when evaluating)', placeholder: '1' },
        { key: 'a0', label: 'Where F is known (optional: 0, 1 or inf)', placeholder: 'inf', show: (v) => v.mode === 'evaluate' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"The parameter is a. In \"Find F′(a)\" the limits may depend on a."}
      resultLabel={(a) => (a.mode === 'evaluate' ? 'F(a)' : "F′(a)")}
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={a.mode === 'evaluate' ? `F(a) = ${a.F}` : `F'(a) = ${a.Fp || '\\\\text{see the steps}'}`} /></div>}
    />
  );
}
