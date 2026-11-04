'use client';
// The live Cholesky decomposition calculator. The maths is in src/app/utils/engines/cholesky.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MatrixMethodCalculator from '@/app/components/method/MatrixMethodCalculator';
import { solve } from '@/app/utils/engines/cholesky';

const EXAMPLES = [
  { label: 'with Ax = b', cells: [[4, 2, 14], [2, 17, -5], [14, -5, 83]], extra: { b: '14, -101, 155' } },
  { label: '[[4,12,−16],[12,37,−43],[−16,−43,98]]', cells: [[4, 12, -16], [12, 37, -43], [-16, -43, 98]], extra: { b: '' } },
  { label: 'surds: [[2,1],[1,2]]', cells: [[2, 1], [1, 2]], extra: { b: '' } },
];

export default function CholeskyCalculator() {
  return (
    <MatrixMethodCalculator
      id="cholesky" unit={4} title="Cholesky Engine" button="Decompose" square min={2} max={5}
      start={[['4', '2', '14'], ['2', '17', '-5'], ['14', '-5', '83']]} examples={EXAMPLES} solve={solve}
      extraFields={[{ key: 'b', label: 'b for Ax = b (optional)', placeholder: 'e.g. 14, -101, 155' }]} extraStart={{ b: '' }}
      hint="A must be symmetric and positive definite."
      resultLabel="A = LLᵀ"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={`L = ${a.LTex}`} /></div>
          {a.xTex && <div className="overflow-x-auto"><BlockMath math={`x = (${a.xTex.join(', ')})`} /></div>}
        </div>
      )}
    />
  );
}
