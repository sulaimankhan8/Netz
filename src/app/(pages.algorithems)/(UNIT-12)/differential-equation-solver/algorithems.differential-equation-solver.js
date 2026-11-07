'use client';
// The live calculator for /differential-equation-solver. The maths is in src/app/utils/engines/ode-solver.js (src/app/utils/symbolic/ode.js).
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/ode-solver';

const EXAMPLES = [
  { label: "dy/dx + y/x = x^2", input: { eq: "dy/dx + y/x = x^2", ics: "" } },
  { label: "dy/dx = (1 + y^2)/(1 + x^2)", input: { eq: "dy/dx = (1 + y^2)/(1 + x^2)", ics: "" } },
  { label: "(2xy + 3) dx + (x^2 - 1) dy = 0", input: { eq: "(2xy + 3) dx + (x^2 - 1) dy = 0", ics: "" } },
  { label: "y'' - 3y' + 2y = e^(3x)", input: { eq: "y'' - 3y' + 2y = e^(3x)", ics: "" } },
  { label: "y'' + y = 0, y(0) = 0, y'(0) = 1", input: { eq: "y'' + y = 0", ics: "y(0) = 0, y'(0) = 1" } },
  { label: "x^2 y'' - x y' + y = log(x)", input: { eq: "x^2 y'' - x y' + y = log(x)", ics: "" } },
];

export default function DifferentialEquationSolverCalculator() {
  return (
    <SymbolicCalculator
      id="ode-solver" unit={12} title="Differential Equation Engine" button="Solve"
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
