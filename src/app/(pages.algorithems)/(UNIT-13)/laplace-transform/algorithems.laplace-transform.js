'use client';
// The live Laplace transform calculator. The maths is in src/app/utils/engines/laplace.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/laplace';

const EXAMPLES = ['t^2 + 3t + 2', 'e^(2t) sin(3t)', 't cos(2t)', 'sin(t)/t', 'sin(t)^2', 'cosh(3t) - 2e^(-t)', 't^3 e^(-2t)', '(t - 2) u(t - 2)']
  .map((f) => ({ label: f, input: { f } }));

export default function LaplaceCalculator() {
  return (
    <SymbolicCalculator
      id="laplace" unit={13} title="Laplace Transform Engine" button="Transform"
      start={{ f: 'e^(2t) sin(3t)' }}
      fields={[{ key: 'f', label: 'f(t)', placeholder: 'e.g. t^2 e^(-t) + cos(2t)', wide: true }]}
      examples={EXAMPLES} solve={solve}
      hint="Use t as the variable. u(t - a) is the unit step and delta(t - a) the impulse."
      resultLabel="Laplace transform"
      renderResult={(a) => <div className="overflow-x-auto text-lg min-w-0"><BlockMath math={`\\mathcal{L}\\{${a.f}\\} = ${a.F}`} /></div>}
    />
  );
}
