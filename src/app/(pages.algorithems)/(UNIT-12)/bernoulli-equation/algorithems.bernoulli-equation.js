'use client';
// The live calculator for /bernoulli-equation. The maths is in src/app/utils/engines/bernoulli.js (src/app/utils/symbolic/ode.js).
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/bernoulli';

const EXAMPLES = [
  { label: "dy/dx + y/x = x^2 y^6", input: { eq: "dy/dx + y/x = x^2 y^6", ics: "" } },
  { label: "dy/dx + y = x y^3", input: { eq: "dy/dx + y = x y^3", ics: "" } },
  { label: "dy/dx - y = e^x y^2", input: { eq: "dy/dx - y = e^x y^2", ics: "" } },
  { label: "dy/dx + y/x = y^2", input: { eq: "dy/dx + y/x = y^2", ics: "" } },
];

export default function BernoulliEquationCalculator() {
  return (
    <SymbolicCalculator
      id="bernoulli" unit={12} title="Bernoulli Equation Engine" button="Solve"
      start={{ eq: "dy/dx + y/x = x^2 y^6", ics: '' }}
      fields={[
        { key: 'eq', label: 'Differential equation', placeholder: "e.g. dy/dx + y/x = x^2 y^6", wide: true },
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
