'use client';
// The live calculator for /ode-constant-coefficients. The maths is in src/app/utils/engines/ode-cc.js (src/app/utils/symbolic/ode.js).
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/ode-cc';

const EXAMPLES = [
  { label: "y'' - 3y' + 2y = e^(3x)", input: { eq: "y'' - 3y' + 2y = e^(3x)", ics: "" } },
  { label: "(D^2 + 4)y = sin(2x)", input: { eq: "(D^2 + 4)y = sin(2x)", ics: "" } },
  { label: "y'' + 2y' + y = x^2", input: { eq: "y'' + 2y' + y = x^2", ics: "" } },
  { label: "y'' - 4y = e^(2x)", input: { eq: "y'' - 4y = e^(2x)", ics: "" } },
  { label: "y''' - y = 0", input: { eq: "y''' - y = 0", ics: "" } },
  { label: "y'' + y = 0, y(0) = 0, y'(0) = 1", input: { eq: "y'' + y = 0", ics: "y(0) = 0, y'(0) = 1" } },
];

export default function OdeConstantCoefficientsCalculator() {
  return (
    <SymbolicCalculator
      id="ode-cc" unit={12} title="CF + PI Engine" button="Solve"
      start={{ eq: "y'' - 3y' + 2y = e^(3x)", ics: '' }}
      fields={[
        { key: 'eq', label: 'Differential equation', placeholder: "e.g. y'' - 3y' + 2y = e^(3x)", wide: true },
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
