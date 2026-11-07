'use client';
// The live inverse Laplace transform calculator. The maths is in src/app/utils/engines/inverse-laplace.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/inverse-laplace';

const EXAMPLES = [
  { label: '1/(s^2 - 3s + 2)', input: { mode: 'partial', F: '1/(s^2 - 3s + 2)' } },
  { label: '(s + 3)/(s^2 + 4s + 13)', input: { mode: 'partial', F: '(s + 3)/(s^2 + 4s + 13)' } },
  { label: '1/(s^2 (s + 1))', input: { mode: 'partial', F: '1/(s^2 (s + 1))' } },
  { label: 'e^(-2s)/(s^2 + 1)', input: { mode: 'partial', F: 'e^(-2s)/(s^2 + 1)' } },
  { label: 'log((s + 1)/(s - 1))', input: { mode: 'partial', F: 'log((s + 1)/(s - 1))' } },
  { label: 'convolution: (1/s)·1/(s^2 + 1)', input: { mode: 'convolution', F: '1/s', F2: '1/(s^2 + 1)' } },
];

export default function InverseLaplaceCalculator() {
  return (
    <SymbolicCalculator
      id="inverse-laplace" unit={13} title="Inverse Laplace Engine" button="Invert"
      start={{ mode: 'partial', F: '1/(s^2 - 3s + 2)', F2: '' }}
      fields={[
        { key: 'mode', label: 'Method', kind: 'choice', options: [{ value: 'partial', label: 'Partial fractions' }, { value: 'convolution', label: 'Convolution F₁·F₂' }] },
        { key: 'F', label: 'F(s)', placeholder: 'e.g. (s + 1)/(s^2 + 2s + 5)', wide: true },
        { key: 'F2', label: 'F₂(s)', placeholder: 'the second factor', wide: true, show: (v) => v.mode === 'convolution' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Use s as the variable. e^(-as) in front gives a delayed answer with u(t - a)."
      resultLabel="Inverse transform"
      renderResult={(a) => <div className="overflow-x-auto text-lg min-w-0"><BlockMath math={`\\mathcal{L}^{-1}\\left\\{${a.F}\\right\\} = ${a.f}`} /></div>}
    />
  );
}
