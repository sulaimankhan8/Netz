'use client';
// The live complex number calculator. The maths is in src/app/utils/engines/complex-numbers.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/complex-numbers';

const OPS = [
  { value: 'add', label: 'z₁ + z₂' }, { value: 'subtract', label: 'z₁ − z₂' }, { value: 'multiply', label: 'z₁ × z₂' }, { value: 'divide', label: 'z₁ ÷ z₂' },
  { value: 'modulus', label: '|z|' }, { value: 'conjugate', label: 'conjugate' }, { value: 'polar', label: 'polar form' }, { value: 'power', label: 'zⁿ' }, { value: 'sqrt', label: '√z' },
];
const TWO = ['add', 'subtract', 'multiply', 'divide'];
const SYMBOL = { add: '+', subtract: '-', multiply: '\\times', divide: '\\div' };
const EXAMPLES = [
  { label: '(3 + 4i) ÷ (1 − 2i)', input: { op: 'divide', z1: '3 + 4i', z2: '1 - 2i' } },
  { label: 'polar form of −1 + √3 i', input: { op: 'polar', z1: '-1 + sqrt(3)i' } },
  { label: '(1 + i)⁸', input: { op: 'power', z1: '1 + i', n: '8' } },
  { label: '√(3 + 4i)', input: { op: 'sqrt', z1: '3 + 4i' } },
];

export default function ComplexCalculator() {
  return (
    <SymbolicCalculator
      id="complex-numbers" unit={7} title="Complex Number Engine" button="Calculate"
      start={{ op: 'multiply', z1: '3 + 4i', z2: '1 - 2i', n: '3' }}
      fields={[
        { key: 'op', label: 'Operation', kind: 'choice', options: OPS },
        { key: 'z1', label: 'z₁ (or z)', placeholder: 'e.g. 3 + 4i' },
        { key: 'z2', label: 'z₂', placeholder: 'e.g. 1 - 2i', show: (v) => TWO.includes(v.op) },
        { key: 'n', label: 'Power n', show: (v) => v.op === 'power' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Write numbers as a + bi, e.g. 3 + 4i, 2 - i, -5i. sqrt(3) is allowed."
      resultLabel="Result"
      renderResult={(a) => {
        const xs = a.points.map((p) => p.x), ys = a.points.map((p) => p.y);
        const m = Math.max(1, ...xs.map(Math.abs), ...ys.map(Math.abs)) * 1.3;
        const left = TWO.includes(a.op) ? `\\left(${a.z}\\right) ${SYMBOL[a.op]} \\left(${a.w}\\right)` : a.op === 'modulus' ? `\\left|${a.z}\\right|` : a.op === 'conjugate' ? `\\overline{${a.z}}` : a.op === 'power' ? `\\left(${a.z}\\right)^{${a.n}}` : a.op === 'sqrt' ? `\\sqrt{${a.z}}` : a.z;
        return (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
            <div className="space-y-2 min-w-0">
              <div className="overflow-x-auto text-lg"><BlockMath math={`${left} = ${a.answer}`} /></div>
              {a.op === 'polar' && <p className="text-sm font-mono">θ = {Number(a.argument.toPrecision(8))} rad = {Number(a.degrees.toFixed(6))}°</p>}
            </div>
            <div className="flex justify-center">
              <CoordPlot points={a.points.map((p) => ({ ...p }))} segments={a.points.map((p) => [{ x: 0, y: 0 }, p])} view={{ x0: -m, x1: m, y0: -m, y1: m }} />
            </div>
          </div>
        );
      }}
    />
  );
}
