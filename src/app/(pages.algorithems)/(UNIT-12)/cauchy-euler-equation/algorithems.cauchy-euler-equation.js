'use client';
// The live calculator for /cauchy-euler-equation. The maths is in src/app/utils/engines/cauchy-euler.js (src/app/utils/symbolic/ode.js).
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/cauchy-euler';

const EXAMPLES = [
  { label: "x^2 y'' - x y' + y = log(x)", input: { eq: "x^2 y'' - x y' + y = log(x)", ics: "" } },
  { label: "x^2 y'' + x y' + y = 0", input: { eq: "x^2 y'' + x y' + y = 0", ics: "" } },
  { label: "x^2 y'' - 2x y' + 2y = x^3", input: { eq: "x^2 y'' - 2x y' + 2y = x^3", ics: "" } },
  { label: "x^2 y'' + 4x y' + 2y = 0", input: { eq: "x^2 y'' + 4x y' + 2y = 0", ics: "" } },
  { label: "(2x + 3)^2 y'' - 2(2x + 3) y' - 12y = 6x", input: { eq: "(2x + 3)^2 y'' - 2(2x + 3) y' - 12y = 6x", ics: "" } },
];

export default function CauchyEulerEquationCalculator() {
  return (
    <SymbolicCalculator
      id="cauchy-euler" unit={12} title="Cauchy–Euler Engine" button="Solve"
      start={{ eq: "x^2 y'' - x y' + y = log(x)", ics: '' }}
      fields={[
        { key: 'eq', label: 'Differential equation', placeholder: "e.g. x^2 y'' - x y' + y = log(x)", wide: true },
        { key: 'ics', label: 'Initial conditions (optional)', placeholder: "e.g. y(0) = 1, y'(0) = 0", wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Write y' or dy/dx, y'' or d^2y/dx^2, xy for x times y, e^x, log(x) for ln x. Also M dx + N dy = 0 and (D^2 + 4)y = sin(2x)."
      resultLabel={(a) => `Solution (${a.methodName})`}
      renderResult={(a) => (
        <div className="space-y-1 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={a.eq} /></div>
          <div className="overflow-x-auto text-lg"><BlockMath math={a.answer} /></div>
        </div>
      )}
    />
  );
}
