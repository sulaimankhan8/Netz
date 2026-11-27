'use client';
// The live product-rule calculator. The maths is in src/app/utils/engines/diff-rules.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/product-rule';
import { sig } from '@/app/utils/numberFormat';

const EXAMPLES = [
  { label: 'x² · sin x', input: { u: 'x^2', v: 'sin(x)', at: '' } },
  { label: 'x · eˣ', input: { u: 'x', v: 'e^x', at: '' } },
  { label: '(x² + 1) · ln x', input: { u: 'x^2 + 1', v: 'ln(x)', at: '' } },
  { label: '√x · cos x', input: { u: 'sqrt(x)', v: 'cos(x)', at: '' } },
  { label: '(2x + 3)(x² − 1)', input: { u: '2x + 3', v: 'x^2 - 1', at: '' } },
  { label: 'eˣ · sin x', input: { u: 'e^x', v: 'sin(x)', at: '' } },
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="product-rule" unit={6} title="Product Rule Engine" button="Differentiate"
      start={{ u: 'x^2', v: 'sin(x)', at: '' }}
      fields={[
        { key: 'u', label: 'First factor, u(x) =', placeholder: 'e.g. x^2', maths: true },
        { key: 'v', label: 'Second factor, v(x) =', placeholder: 'e.g. sin(x)', maths: true },
        { key: 'at', label: 'Slope at x = (optional)', placeholder: 'e.g. 1' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Type the two factors in separate boxes. NETZ multiplies them, then differentiates using the product rule."
      resultLabel="Derivative of u · v"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`\\frac{d}{d${a.variable}}\\left[\\left(${a.u}\\right)\\left(${a.v}\\right)\\right] = ${a.answer}`} /></div>
          {a.point && <p className="text-sm font-mono">At {a.variable} = {sig(a.point.a, 6)}: slope = {sig(a.point.slope, 8)}</p>}
        </div>
      )}
    />
  );
}
