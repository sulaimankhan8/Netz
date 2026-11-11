'use client';
// The live reduction formula calculator. The maths is in src/app/utils/engines/reduction-formula.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/reduction-formula';

const EXAMPLES = [
  {
    label: "∫ sin⁴x dx",
    input: {
      kind: "sin",
      n: "4",
      wallis: "no"
    }
  },
  {
    label: "∫ cos⁵x dx",
    input: {
      kind: "cos",
      n: "5",
      wallis: "no"
    }
  },
  {
    label: "∫ tan⁵x dx",
    input: {
      kind: "tan",
      n: "5"
    }
  },
  {
    label: "∫ sec³x dx",
    input: {
      kind: "sec",
      n: "3"
    }
  },
  {
    label: "∫ x³e²ˣ dx",
    input: {
      kind: "xexp",
      n: "3",
      a: "2"
    }
  },
  {
    label: "∫ (ln x)³ dx",
    input: {
      kind: "log",
      n: "3"
    }
  },
  {
    label: "Wallis: ∫₀^{π/2} sin⁶x",
    input: {
      kind: "sin",
      n: "6",
      wallis: "yes"
    }
  },
  {
    label: "Wallis: ∫₀^{π/2} cos⁷x",
    input: {
      kind: "cos",
      n: "7",
      wallis: "yes"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="reduction-formula" unit={6} title="Reduction Formula Engine" button="Reduce"
      start={{
  kind: "sin",
  n: "4",
  a: "1",
  wallis: "no"
}}
      fields={[
        { key: 'kind', label: 'Integral', kind: 'select', options: [{ value: 'sin', label: "∫ sinⁿx dx" }, { value: 'cos', label: "∫ cosⁿx dx" }, { value: 'tan', label: "∫ tanⁿx dx" }, { value: 'sec', label: "∫ secⁿx dx" }, { value: 'xexp', label: "∫ xⁿeᵃˣ dx" }, { value: 'log', label: "∫ (ln x)ⁿ dx" }] },
        { key: 'n', label: 'n', placeholder: '4' },
        { key: 'a', label: 'a', placeholder: '1', show: (v) => v.kind === 'xexp' },
        { key: 'wallis', label: 'Limits', kind: 'choice', options: [{ value: 'no', label: "Indefinite" }, { value: 'yes', label: "0 to π/2 (Wallis)" }], show: (v) => v.kind === 'sin' || v.kind === 'cos' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"n from 0 to 12."}
      resultLabel="Result"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={a.value} /></div>}
    />
  );
}
