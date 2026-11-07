'use client';
// The live calculator for /linear-differential-equation. The maths is in src/app/utils/engines/linear-ode.js (src/app/utils/symbolic/ode.js).
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/linear-ode';

const EXAMPLES = [
  { label: "dy/dx + y/x = x^2", input: { eq: "dy/dx + y/x = x^2", ics: "" } },
  { label: "y' + y = e^x", input: { eq: "y' + y = e^x", ics: "" } },
  { label: "dy/dx + 2y = 4x, y(0) = 1", input: { eq: "dy/dx + 2y = 4x", ics: "y(0) = 1" } },
  { label: "dy/dx + y tan(x) = sec(x)", input: { eq: "dy/dx + y tan(x) = sec(x)", ics: "" } },
  { label: "x dy/dx - 2y = x^3", input: { eq: "x dy/dx - 2y = x^3", ics: "" } },
];

export default function LinearDifferentialEquationCalculator() {
  return (
    <SymbolicCalculator
      id="linear-ode" unit={12} title="Linear Equation Engine" button="Solve"
      start={{ eq: "dy/dx + y/x = x^2", ics: '' }}
      fields={[
        { key: 'eq', label: 'Differential equation', placeholder: "e.g. dy/dx + y/x = x^2", wide: true },
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
