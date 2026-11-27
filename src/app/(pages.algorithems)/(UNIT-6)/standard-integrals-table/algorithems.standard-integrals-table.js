'use client';
// The live standard-integrals calculator: type an integrand and see which table formulas it uses.
// The maths is the integral engine's (src/app/utils/engines/integral.js), run on indefinite integrals.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve as integral } from '@/app/utils/engines/integral';

const solve = ({ f }) => integral({ f, kind: 'indefinite' });

const EXAMPLES = [
  { label: 'x⁵', input: { f: 'x^5' } },
  { label: '1/x', input: { f: '1/x' } },
  { label: 'e^(3x)', input: { f: 'e^(3x)' } },
  { label: 'sin(2x)', input: { f: 'sin(2x)' } },
  { label: '1/(1 + x²)', input: { f: '1/(1 + x^2)' } },
  { label: '1/√(1 − x²)', input: { f: '1/sqrt(1 - x^2)' } },
  { label: 'sec² x', input: { f: 'sec(x)^2' } },
  { label: '3x² + 2/x − cos x', input: { f: '3x^2 + 2/x - cos(x)' } },
  { label: '1/(4 + x²)', input: { f: '1/(4 + x^2)' } },
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="standard-integrals" unit={6} title="Standard Integrals Engine" button="Integrate"
      start={{ f: '3x^2 + 2/x - cos(x)' }}
      fields={[{ key: 'f', label: 'Integrand f(x) =', placeholder: 'e.g. 3x^2 + 2/x - cos(x)', wide: true, maths: true }]}
      examples={EXAMPLES} solve={solve}
      hint="Each step names the table formula used. Sums are done term by term, and a number in front comes outside."
      resultLabel="Integral"
      renderResult={(a) => (
        <div className="overflow-x-auto text-lg"><BlockMath math={`\\int ${a.f}\\,d${a.variable} = ${a.answer} + C`} /></div>
      )}
    />
  );
}
