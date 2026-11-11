'use client';
// The live wave equation calculator. The maths is in src/app/utils/engines/wave-equation.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/wave-equation';

const EXAMPLES = [
  {
    label: "u(x, 0) = x(4 − x)",
    input: {
      f: "x(4 - x)",
      g: "0",
      L: "4",
      c: "1",
      h: "1",
      k: "",
      steps: "4"
    }
  },
  {
    label: "u(x, 0) = sin πx, h = 0.25",
    input: {
      f: "sin(pi x)",
      g: "0",
      L: "1",
      c: "1",
      h: "0.25",
      k: "",
      steps: "4"
    }
  },
  {
    label: "Struck string: g = x(1 − x)",
    input: {
      f: "0",
      g: "x(1 - x)",
      L: "1",
      c: "1",
      h: "0.2",
      k: "",
      steps: "5"
    }
  },
  {
    label: "Unstable: r = 2",
    input: {
      f: "x(4 - x)",
      g: "0",
      L: "4",
      c: "1",
      h: "1",
      k: "2",
      steps: "4"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="wave-equation" unit={4} title="Wave Equation Engine" button="Solve"
      start={{
  f: "x(4 - x)",
  g: "0",
  L: "4",
  c: "1",
  h: "1",
  k: "",
  steps: "4"
}}
      fields={[
        { key: 'f', label: 'u(x, 0) = f(x)', placeholder: 'x(4 - x)', wide: true },
        { key: 'g', label: 'u_t(x, 0) = g(x)', placeholder: '0', wide: true },
        { key: 'L', label: 'Length L', placeholder: '4' }, { key: 'c', label: 'c', placeholder: '1' },
        { key: 'h', label: 'Step h', placeholder: '1' }, { key: 'k', label: 'Step k (empty: h/c)', placeholder: '' },
        { key: 'steps', label: 'Time steps', placeholder: '4' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Ends fixed at u = 0."}
      resultLabel="Grid values"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`h = ${a.h}, \\quad k = ${a.k}, \\quad r = \\frac{ck}{h} = ${a.r}`} /></div>}
      renderSteps={(a) => <StepTable columns={a.columns} rows={a.rows} />}
    />
  );
}
