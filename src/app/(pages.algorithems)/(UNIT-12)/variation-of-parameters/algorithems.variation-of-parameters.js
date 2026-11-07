'use client';
// The live calculator for /variation-of-parameters. The maths is in src/app/utils/engines/variation-of-parameters.js (src/app/utils/symbolic/ode.js).
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/variation-of-parameters';

const EXAMPLES = [
  { label: "y'' + y = sec(x)", input: { eq: "y'' + y = sec(x)", ics: "" } },
  { label: "y'' + y = tan(x)", input: { eq: "y'' + y = tan(x)", ics: "" } },
  { label: "y'' - 2y' + y = e^x / x", input: { eq: "y'' - 2y' + y = e^x / x", ics: "" } },
  { label: "y'' + 4y = sec(2x)", input: { eq: "y'' + 4y = sec(2x)", ics: "" } },
];

export default function VariationOfParametersCalculator() {
  return (
    <SymbolicCalculator
      id="variation-of-parameters" unit={12} title="Variation of Parameters Engine" button="Solve"
      start={{ eq: "y'' + y = sec(x)", ics: '' }}
      fields={[
        { key: 'eq', label: 'Differential equation', placeholder: "e.g. y'' + y = sec(x)", wide: true },
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
