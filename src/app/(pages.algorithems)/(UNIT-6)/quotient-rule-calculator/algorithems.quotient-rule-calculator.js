'use client';
// The live quotient-rule calculator. The maths is in src/app/utils/engines/diff-rules.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/quotient-rule';
import { sig } from '@/app/utils/numberFormat';

const EXAMPLES = [
  { label: 'x / (x² + 1)', input: { u: 'x', v: 'x^2 + 1', at: '' } },
  { label: 'sin x / x', input: { u: 'sin(x)', v: 'x', at: '' } },
  { label: '(2x + 1) / (x − 3)', input: { u: '2x + 1', v: 'x - 3', at: '' } },
  { label: 'eˣ / x²', input: { u: 'e^x', v: 'x^2', at: '' } },
  { label: 'ln x / x', input: { u: 'ln(x)', v: 'x', at: '' } },
  { label: '(x² − 1) / (x² + 1)', input: { u: 'x^2 - 1', v: 'x^2 + 1', at: '' } },
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="quotient-rule" unit={6} title="Quotient Rule Engine" button="Differentiate"
      start={{ u: 'x', v: 'x^2 + 1', at: '' }}
      fields={[
        { key: 'u', label: 'Top, u(x) =', placeholder: 'e.g. x', maths: true },
        { key: 'v', label: 'Bottom, v(x) =', placeholder: 'e.g. x^2 + 1', maths: true },
        { key: 'at', label: 'Slope at x = (optional)', placeholder: 'e.g. 2' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Type the top and the bottom of the fraction in separate boxes. The bottom must not be 0."
      resultLabel="Derivative of u / v"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`\\frac{d}{d${a.variable}}\\left[\\frac{${a.u}}{${a.v}}\\right] = ${a.answer}`} /></div>
          {a.point && <p className="text-sm font-mono">At {a.variable} = {sig(a.point.a, 6)}: slope = {sig(a.point.slope, 8)}</p>}
        </div>
      )}
    />
  );
}
