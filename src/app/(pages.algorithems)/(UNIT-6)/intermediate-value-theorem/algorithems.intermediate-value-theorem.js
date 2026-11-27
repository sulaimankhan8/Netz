'use client';
// The live Intermediate Value Theorem calculator. The maths is in src/app/utils/engines/intermediate-value-theorem.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/intermediate-value-theorem';
import { sig } from '@/app/utils/numberFormat';

const EXAMPLES = [
  { label: 'root of x³ − x − 1 on [1, 2]', input: { f: 'x^3 - x - 1', a: '1', b: '2', y: '' } },
  { label: 'x² = 4 on [0, 3]', input: { f: 'x^2', a: '0', b: '3', y: '4' } },
  { label: 'cos x = x on [0, 1]', input: { f: 'cos(x) - x', a: '0', b: '1', y: '' } },
  { label: 'eˣ = 5 on [1, 2]', input: { f: 'e^x', a: '1', b: '2', y: '5' } },
  { label: 'x² = 5 on [0, 1] (no guarantee)', input: { f: 'x^2', a: '0', b: '1', y: '5' } },
  { label: '1/x on [−1, 1] (not continuous)', input: { f: '1/x', a: '-1', b: '1', y: '0' } },
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="ivt" unit={6} title="Intermediate Value Engine" button="Check the Theorem"
      start={{ f: 'x^3 - x - 1', a: '1', b: '2', y: '' }}
      fields={[
        { key: 'f', label: 'f(x) =', placeholder: 'e.g. x^3 - x - 1', wide: true, maths: true },
        { key: 'a', label: 'Left end, a =', placeholder: 'e.g. 1' },
        { key: 'b', label: 'Right end, b =', placeholder: 'e.g. 2' },
        { key: 'y', label: 'Target value N (empty = look for a root)', placeholder: 'e.g. 4 (or leave empty)' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Leave N empty to ask: does f have a root between a and b? Type a number to ask: does f ever equal N between a and b?"
      resultLabel={(a) => (a.applies ? 'The theorem applies: such a c exists' : 'The theorem does not apply')}
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={a.applies ? `f(c) = ${a.N} \\ \\text{for some } c \\in (${a.a}, ${a.b})` : `\\text{No guarantee that } f(c) = ${a.N}`} /></div>
          {a.c !== null && <p className="text-sm font-mono">c ≈ {sig(a.c, 8)}, f(c) ≈ {sig(a.fc, 6)}</p>}
          {a.plot && <CoordPlot fn={a.plot.fn} lines={a.plot.lines} points={a.plot.points} view={a.plot.view} />}
        </div>
      )}
    />
  );
}
