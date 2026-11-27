'use client';
// The live Fundamental Theorem of Calculus calculator. The maths is in src/app/utils/engines/fundamental-theorem.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/fundamental-theorem';

const EXAMPLES = [
  { label: 'area: x² from 0 to 3', input: { mode: 'evaluate', f: 'x^2', a: '0', b: '3' } },
  { label: 'area: sin x from 0 to π', input: { mode: 'evaluate', f: 'sin(x)', a: '0', b: 'pi' } },
  { label: 'area: 1/x from 1 to e', input: { mode: 'evaluate', f: '1/x', a: '1', b: 'e' } },
  { label: 'd/dx ∫₀ˣ t² dt', input: { mode: 'derivative', h: 't^2', lo: '0', up: 'x' } },
  { label: 'd/dx ∫₀^(x²) √(1 + t²) dt', input: { mode: 'derivative', h: 'sqrt(1 + t^2)', lo: '0', up: 'x^2' } },
  { label: 'd/dx ∫ from x to x³ of sin t dt', input: { mode: 'derivative', h: 'sin(t)', lo: 'x', up: 'x^3' } },
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="fundamental-theorem" unit={6} title="Fundamental Theorem Engine" button="Apply the Theorem"
      start={{ mode: 'evaluate', f: 'x^2', a: '0', b: '3', h: 't^2', lo: '0', up: 'x' }}
      fields={[
        { key: 'mode', label: 'What do you want to do?', kind: 'choice', options: [{ value: 'evaluate', label: 'Find an area (Part 2)' }, { value: 'derivative', label: 'Differentiate an integral (Part 1)' }] },
        { key: 'f', label: 'f(x) =', placeholder: 'e.g. x^2', wide: true, maths: true, show: (v) => v.mode === 'evaluate' },
        { key: 'a', label: 'From x = a', placeholder: 'e.g. 0', show: (v) => v.mode === 'evaluate' },
        { key: 'b', label: 'To x = b', placeholder: 'e.g. 3', show: (v) => v.mode === 'evaluate' },
        { key: 'h', label: 'Integrand h(t) =', placeholder: 'e.g. sqrt(1 + t^2)', wide: true, maths: true, show: (v) => v.mode === 'derivative' },
        { key: 'lo', label: 'Lower limit (a number or in x)', placeholder: 'e.g. 0', show: (v) => v.mode === 'derivative' },
        { key: 'up', label: 'Upper limit (in x)', placeholder: 'e.g. x^2', show: (v) => v.mode === 'derivative' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Part 2 turns an integral into F(b) − F(a). Part 1 differentiates an integral whose limits contain x: write the integrand in t and the limits in x."
      resultLabel={(a) => (a.mode === 'evaluate' ? 'Value of the integral' : 'Derivative of the integral')}
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          {a.mode === 'evaluate'
            ? <div className="overflow-x-auto text-lg"><BlockMath math={`\\int_{${a.a}}^{${a.b}} ${a.f}\\,d${a.variable} = ${a.valueTex}`} /></div>
            : <div className="overflow-x-auto text-lg"><BlockMath math={`\\frac{d}{dx}\\int h(t)\\,dt = ${a.answer}`} /></div>}
        </div>
      )}
    />
  );
}
