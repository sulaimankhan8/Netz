'use client';
// The live two-variable Taylor series calculator. The maths is in src/app/utils/engines/taylor-2var.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/taylor-2var';

const ORDERS = ['1', '2', '3', '4'].map((v) => ({ value: v, label: v === '1' ? 'Degree 1' : `Degree ${v}` }));
const EXAMPLES = [
  { label: 'eˣ sin y about (0, 0)', input: { f: 'e^x sin(y)', a: '0', b: '0', order: '3' } },
  { label: 'eˣ cos y about (1, π/4)', input: { f: 'e^x cos(y)', a: '1', b: 'pi/4', order: '2' } },
  { label: 'x²y + 3y − 2 about (1, −2)', input: { f: 'x^2 y + 3y - 2', a: '1', b: '-2', order: '3' } },
  { label: 'tan⁻¹(y/x) about (1, 1)', input: { f: 'atan(y/x)', a: '1', b: '1', order: '2' } },
  { label: 'eˣ log(1 + y) about (0, 0)', input: { f: 'e^x log(1 + y)', a: '0', b: '0', order: '3' } },
];

export default function Taylor2VarCalculator() {
  return (
    <SymbolicCalculator
      id="taylor-2var" unit={6} title="Taylor Series Engine" button="Expand"
      start={{ f: 'e^x sin(y)', a: '0', b: '0', order: '3' }}
      fields={[
        { key: 'f', label: 'f(x, y)', placeholder: 'e.g. e^x sin(y)', wide: true },
        { key: 'a', label: 'About x = a', placeholder: '0' },
        { key: 'b', label: 'About y = b', placeholder: '0' },
        { key: 'order', label: 'Up to', kind: 'select', options: ORDERS },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="About (0, 0) this is the Maclaurin series. Use pi for π."
      resultLabel={(a) => `Taylor polynomial of degree ${a.order} about (${a.a.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\\pi/g, 'π')}, ${a.b.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\\pi/g, 'π')})`}
      renderResult={(a) => (
        <div className="overflow-x-auto text-lg min-w-0"><BlockMath math={`${a.f} \\approx ${a.series}`} /></div>
      )}
    />
  );
}
