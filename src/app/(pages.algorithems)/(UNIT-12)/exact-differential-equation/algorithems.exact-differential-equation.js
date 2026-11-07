'use client';
// The live calculator for /exact-differential-equation. The maths is in src/app/utils/engines/exact-ode.js (src/app/utils/symbolic/ode.js).
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/exact-ode';

const EXAMPLES = [
  { label: "(2xy + 3) dx + (x^2 - 1) dy = 0", input: { eq: "(2xy + 3) dx + (x^2 - 1) dy = 0", ics: "" } },
  { label: "(x^2 + y^2) dx + 2xy dy = 0", input: { eq: "(x^2 + y^2) dx + 2xy dy = 0", ics: "" } },
  { label: "(y cos(x) + 2x) dx + sin(x) dy = 0", input: { eq: "(y cos(x) + 2x) dx + sin(x) dy = 0", ics: "" } },
  { label: "(x^2 + y^2 + x) dx + x y dy = 0", input: { eq: "(x^2 + y^2 + x) dx + x y dy = 0", ics: "" } },
  { label: "(e^y + 1) cos(x) dx + e^y sin(x) dy = 0", input: { eq: "(e^y + 1) cos(x) dx + e^y sin(x) dy = 0", ics: "" } },
];

export default function ExactDifferentialEquationCalculator() {
  return (
    <SymbolicCalculator
      id="exact-ode" unit={12} title="Exact Equation Engine" button="Solve"
      start={{ eq: "(2xy + 3) dx + (x^2 - 1) dy = 0", ics: '' }}
      fields={[
        { key: 'eq', label: 'Differential equation', placeholder: "e.g. (2xy + 3) dx + (x^2 - 1) dy = 0", wide: true },
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
