'use client';
// The live vector calculator. The maths is in src/app/utils/engines/vectors.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/vectors';

const OPS = [
  { value: 'magnitude', label: '|a| and â' }, { value: 'dot', label: 'a · b and angle' }, { value: 'cross', label: 'a × b and area' },
  { value: 'projection', label: 'projection of a on b' }, { value: 'triple', label: '[a b c]' },
];
const EXAMPLES = [
  { label: 'angle between i + j and j + k', input: { op: 'dot', a: 'i + j', b: 'j + k' } },
  { label: '(2i − j + k) × (i + 3j − 2k)', input: { op: 'cross', a: '2i - j + k', b: 'i + 3j - 2k' } },
  { label: 'unit vector of 2i − j + 3k', input: { op: 'magnitude', a: '2i - j + 3k' } },
  { label: 'coplanar?', input: { op: 'triple', a: 'i', b: 'j', c: 'i + j' } },
];

export default function VectorCalculator() {
  return (
    <SymbolicCalculator
      id="vectors" unit={8} title="Vector Engine" button="Calculate"
      start={{ op: 'dot', a: '(1, 2, 2)', b: '(2, -2, 1)', c: 'i + 2j - k' }}
      fields={[
        { key: 'op', label: 'Find', kind: 'choice', options: OPS },
        { key: 'a', label: 'Vector a', placeholder: '2i - j + 3k or (2, -1, 3)' },
        { key: 'b', label: 'Vector b', placeholder: 'i + 3j - 2k', show: (v) => v.op !== 'magnitude' },
        { key: 'c', label: 'Vector c', placeholder: 'i + 2j - k', show: (v) => v.op === 'triple' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Write vectors as 2i - j + 3k or as (2, -1, 3). 2D vectors like (3, 4) work too."
      resultLabel="Result"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={[`\\vec a = ${a.a}`, a.b && `\\vec b = ${a.b}`, a.c && `\\vec c = ${a.c}`].filter(Boolean).join(', \\quad ')} /></div>
          <div className="overflow-x-auto text-lg"><BlockMath math={a.answer} /></div>
          {a.degrees !== undefined && <p className="text-sm font-mono">θ = {Number(a.degrees.toFixed(4))}°</p>}
        </div>
      )}
    />
  );
}
