'use client';
// The live ODE-by-Laplace calculator. The maths is in src/app/utils/engines/laplace-ode.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/laplace-ode';

const EXAMPLES = [
  { label: "y'' + 3y' + 2y = e^(-3t)", input: { eq: "y'' + 3y' + 2y = e^(-3t)", ics: "y(0) = 1, y'(0) = 0" } },
  { label: "y'' + y = sin(2t)", input: { eq: "y'' + y = sin(2t)", ics: "y(0) = 0, y'(0) = 1" } },
  { label: "y' + 2y = 4", input: { eq: "y' + 2y = 4", ics: 'y(0) = 1' } },
  { label: "y'' - 2y' + y = e^t", input: { eq: "y'' - 2y' + y = e^t", ics: "y(0) = 2, y'(0) = -1" } },
  { label: "y'' + 4y = u(t - 1)", input: { eq: "y'' + 4y = u(t - 1)", ics: "y(0) = 0, y'(0) = 0" } },
];

export default function LaplaceOdeCalculator() {
  return (
    <SymbolicCalculator
      id="laplace-ode" unit={13} title="Laplace ODE Engine" button="Solve"
      start={{ eq: "y'' + 3y' + 2y = e^(-3t)", ics: "y(0) = 1, y'(0) = 0" }}
      fields={[
        { key: 'eq', label: 'Differential equation in t', placeholder: "e.g. y'' + 4y = sin(t)", wide: true },
        { key: 'ics', label: 'Initial conditions at t = 0', placeholder: "e.g. y(0) = 1, y'(0) = 0", wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Constant coefficients; the right side may use u(t - a) and delta(t - a). Missing initial values count as 0."
      resultLabel="Solution"
      renderResult={(a) => (
        <div className="space-y-1 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={`Y(s) = ${a.Y}`} /></div>
          <div className="overflow-x-auto text-lg"><BlockMath math={a.y} /></div>
        </div>
      )}
    />
  );
}
