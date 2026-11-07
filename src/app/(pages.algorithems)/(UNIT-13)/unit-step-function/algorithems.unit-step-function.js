'use client';
// The live unit step / periodic function calculator. The maths is in src/app/utils/engines/unit-step.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/unit-step';

const MODES = [{ value: 'piecewise', label: 'Piecewise f(t)' }, { value: 'steps', label: 'With u(t − a), δ(t − a)' }, { value: 'periodic', label: 'Periodic' }];
const EXAMPLES = [
  { label: 't for 0<t<1, 1 for t>1', input: { mode: 'piecewise', pieces: 't for 0 < t < 1; 1 for t > 1' } },
  { label: 'sin t for 0<t<π, 0 after', input: { mode: 'piecewise', pieces: 'sin(t) for 0 < t < pi; 0 for t > pi' } },
  { label: 'e^(-t) u(t - 2)', input: { mode: 'steps', f: 'e^(-t) u(t - 2)' } },
  { label: 'δ(t − 3) + u(t − 1)', input: { mode: 'steps', f: 'delta(t - 3) + u(t - 1)' } },
  { label: 'square wave, period 2', input: { mode: 'periodic', pieces: '1 for 0 < t < 1; -1 for 1 < t < 2', period: '2' } },
  { label: 'sawtooth t, period 1', input: { mode: 'periodic', pieces: 't for 0 < t < 1', period: '1' } },
];

export default function UnitStepCalculator() {
  return (
    <SymbolicCalculator
      id="unit-step" unit={13} title="Unit Step Engine" button="Transform"
      start={{ mode: 'piecewise', pieces: 't for 0 < t < 1; 1 for t > 1', f: 'e^(-t) u(t - 2)', period: '2' }}
      fields={[
        { key: 'mode', label: 'The function is', kind: 'choice', options: MODES },
        { key: 'pieces', label: 'Pieces (separated by ;)', placeholder: 't for 0 < t < 1; 1 for t > 1', wide: true, show: (v) => v.mode !== 'steps' },
        { key: 'period', label: 'Period T', placeholder: 'e.g. 2 or 2pi', show: (v) => v.mode === 'periodic' },
        { key: 'f', label: 'f(t) with u(t − a) and δ(t − a)', placeholder: 'e.g. t^2 u(t - 1)', wide: true, show: (v) => v.mode === 'steps' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Write each piece as 'expression for a < t < b', or 'expression for t > a' for the last one."
      resultLabel="Laplace transform"
      renderResult={(a) => (
        <div className="space-y-1 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={a.f} /></div>
          <div className="overflow-x-auto text-lg"><BlockMath math={`F(s) = ${a.F}`} /></div>
        </div>
      )}
    />
  );
}
