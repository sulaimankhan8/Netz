'use client';
// The live calculator for /homogeneous-differential-equation. The maths is in src/app/utils/engines/homogeneous-ode.js (src/app/utils/symbolic/ode.js).
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/homogeneous-ode';

const EXAMPLES = [
  { label: "dy/dx = (x + y)/x", input: { eq: "dy/dx = (x + y)/x", ics: "" } },
  { label: "dy/dx = (x^2 + y^2)/(2xy)", input: { eq: "dy/dx = (x^2 + y^2)/(2xy)", ics: "" } },
  { label: "dy/dx = (x - y)/(x + y)", input: { eq: "dy/dx = (x - y)/(x + y)", ics: "" } },
  { label: "x dy/dx = y + x", input: { eq: "x dy/dx = y + x", ics: "" } },
];

export default function HomogeneousDifferentialEquationCalculator() {
  return (
    <SymbolicCalculator
      id="homogeneous-ode" unit={12} title="Homogeneous Equation Engine" button="Solve"
      start={{ eq: "dy/dx = (x + y)/x", ics: '' }}
      fields={[
        { key: 'eq', label: 'Differential equation', placeholder: "e.g. dy/dx = (x + y)/x", wide: true },
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
