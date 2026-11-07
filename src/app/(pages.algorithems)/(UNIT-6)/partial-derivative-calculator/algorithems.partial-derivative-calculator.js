'use client';
// The live partial derivative calculator. The maths is in src/app/utils/engines/partial-derivative.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/partial-derivative';

const MODES = [{ value: 'chain', label: 'One derivative' }, { value: 'all', label: 'All 1st & 2nd order' }, { value: 'total', label: 'Total derivative du/dt' }];
const EXAMPLES = [
  { label: '∂/∂x of x²y³ + sin(xy)', input: { mode: 'chain', f: 'x^2 y^3 + sin(xy)', order: 'x' } },
  { label: 'f_xy of eˣʸ', input: { mode: 'chain', f: 'e^(xy)', order: 'xy' } },
  { label: 'all of x³y + y log x', input: { mode: 'all', f: 'x^3 y + y log(x)' } },
  { label: 'u = x² + y², x = cos t, y = sin t', input: { mode: 'total', f: 'x^2 + y^2', xt: 'cos(t)', yt: 'sin(t)', zt: '' } },
  { label: 'f_xyz of x²y³z⁴', input: { mode: 'chain', f: 'x^2 y^3 z^4', order: 'xyz' } },
];

export default function PartialDerivativeCalculator() {
  return (
    <SymbolicCalculator
      id="partial-derivative" unit={6} title="Partial Derivative Engine" button="Differentiate"
      start={{ mode: 'chain', f: 'x^2 y^3 + sin(xy)', order: 'x', xt: 'cos(t)', yt: 'sin(t)', zt: '' }}
      fields={[
        { key: 'mode', label: 'What to find', kind: 'choice', options: MODES },
        { key: 'f', label: 'f(x, y) or f(x, y, z)', placeholder: 'e.g. x^2 y + e^(xy)', wide: true },
        { key: 'order', label: 'Differentiate by (in order)', placeholder: 'x, or xy for f_xy', show: (v) => v.mode === 'chain' },
        { key: 'xt', label: 'x(t)', placeholder: 'e.g. cos(t)', show: (v) => v.mode === 'total' },
        { key: 'yt', label: 'y(t)', placeholder: 'e.g. sin(t)', show: (v) => v.mode === 'total' },
        { key: 'zt', label: 'z(t) (only if f uses z)', placeholder: 'leave empty', show: (v) => v.mode === 'total' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Write xy for x times y and ^ for powers: x^2 y^3, e^(xy), sin(x + y). Order xy means first x, then y."
      resultLabel={(a) => (a.mode === 'all' ? 'All partial derivatives' : 'Answer')}
      renderResult={(a) => (
        <div className="space-y-1 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={`f = ${a.f}`} /></div>
          {a.items.map((it) => <div key={it.name} className="overflow-x-auto text-lg"><BlockMath math={`${it.name} = ${it.value}`} /></div>)}
        </div>
      )}
    />
  );
}
