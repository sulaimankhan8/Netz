'use client';
// The live errors and approximations calculator. The maths is in src/app/utils/engines/errors-approximations.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/errors-approximations';

const EXAMPLES = [
  {
    label: "√25.3",
    input: {
      mode: "approx",
      f: "sqrt(x)",
      x0: "25",
      dx: "0.3"
    }
  },
  {
    label: "∛0.009 (from 0.008)",
    input: {
      mode: "approx",
      f: "x^(1/3)",
      x0: "0.008",
      dx: "0.001"
    }
  },
  {
    label: "(3.02)⁴",
    input: {
      mode: "approx",
      f: "x^4",
      x0: "3",
      dx: "0.02"
    }
  },
  {
    label: "area of a circle, r = 10 ± 0.1",
    input: {
      mode: "error",
      f: "pi r^2",
      x0: "10",
      dx: "0.1"
    }
  },
  {
    label: "volume of a cube, x = 5 ± 0.02",
    input: {
      mode: "error",
      f: "x^3",
      x0: "5",
      dx: "0.02"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="errors-approximations" unit={6} title="Differentials Engine" button="Work It Out"
      start={{mode:"approx",f:"sqrt(x)",x0:"25",dx:"0.3"}}
      fields={[
        { key: 'mode', label: 'Find', kind: 'choice', options: [{ value: 'approx', label: 'An approximate value' }, { value: 'error', label: 'An error (dy)' }] },
        { key: 'f', label: 'y = f(x)', placeholder: 'e.g. sqrt(x)', wide: true },
        { key: 'x0', label: 'x', placeholder: '25' },
        { key: 'dx', label: 'Δx (or the error in x)', placeholder: '0.3' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="dy = f′(x) Δx. Any one letter works (r for a radius)."
      resultLabel="Result"
      renderResult={(a) => <div className="overflow-x-auto text-lg min-w-0"><BlockMath math={a.result} /></div>}
    />
  );
}
