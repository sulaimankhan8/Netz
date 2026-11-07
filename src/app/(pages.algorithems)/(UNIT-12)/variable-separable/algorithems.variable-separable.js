'use client';
// The live calculator for /variable-separable. The maths is in src/app/utils/engines/variable-separable.js (src/app/utils/symbolic/ode.js).
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/variable-separable';

const EXAMPLES = [
  { label: "dy/dx = x y", input: { eq: "dy/dx = x y", ics: "" } },
  { label: "dy/dx = (1 + y^2)/(1 + x^2)", input: { eq: "dy/dx = (1 + y^2)/(1 + x^2)", ics: "" } },
  { label: "dy/dx = e^(x - y)", input: { eq: "dy/dx = e^(x - y)", ics: "" } },
  { label: "x dy/dx = y", input: { eq: "x dy/dx = y", ics: "" } },
  { label: "y' = y^2 cos(x)", input: { eq: "y' = y^2 cos(x)", ics: "" } },
];

export default function VariableSeparableCalculator() {
  return (
    <SymbolicCalculator
      id="variable-separable" unit={12} title="Variable Separable Engine" button="Solve"
      start={{ eq: "dy/dx = x y", ics: '' }}
      fields={[
        { key: 'eq', label: 'Differential equation', placeholder: "e.g. dy/dx = x y", wide: true },
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
