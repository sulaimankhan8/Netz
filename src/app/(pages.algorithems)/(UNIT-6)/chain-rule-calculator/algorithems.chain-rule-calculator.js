'use client';
// The live chain-rule calculator. The maths is in src/app/utils/engines/diff-rules.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/chain-rule';
import { sig } from '@/app/utils/numberFormat';

const EXAMPLES = [
  { label: 'sin(x²)', input: { f: 'sin(x^2)', at: '' } },
  { label: '(3x + 1)⁵', input: { f: '(3x + 1)^5', at: '' } },
  { label: 'e^(2x)', input: { f: 'e^(2x)', at: '' } },
  { label: '√(x² + 1)', input: { f: 'sqrt(x^2 + 1)', at: '' } },
  { label: 'ln(sin x)', input: { f: 'ln(sin(x))', at: '' } },
  { label: 'sin(cos(x²))', input: { f: 'sin(cos(x^2))', at: '' } },
  { label: '5 cos(3x − 2)', input: { f: '5 cos(3x - 2)', at: '' } },
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="chain-rule" unit={6} title="Chain Rule Engine" button="Differentiate"
      start={{ f: 'sin(x^2)', at: '' }}
      fields={[
        { key: 'f', label: 'f(x) = a function inside a function', placeholder: 'e.g. sin(x^2)', wide: true, maths: true },
        { key: 'at', label: 'Slope at x = (optional)', placeholder: 'e.g. 1' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Works on one function inside another (up to four layers), with an optional number in front: 3 sin(2x), (x^2 + 1)^4, e^(x^2), ln(cos(x))."
      resultLabel="Derivative by the chain rule"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-sm">
            {a.layers.map((L, i) => <BlockMath key={i} math={`${L.outer} \\qquad ${L.name} = ${L.inner}`} />)}
          </div>
          <div className="overflow-x-auto text-lg"><BlockMath math={`\\frac{d}{d${a.variable}}\\left[${a.f}\\right] = ${a.answer}`} /></div>
          {a.point && <p className="text-sm font-mono">At {a.variable} = {sig(a.point.a, 6)}: slope = {sig(a.point.slope, 8)}</p>}
        </div>
      )}
    />
  );
}
