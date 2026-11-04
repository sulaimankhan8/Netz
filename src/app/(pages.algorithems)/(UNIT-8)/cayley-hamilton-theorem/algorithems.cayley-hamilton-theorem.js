'use client';
// The live Cayley–Hamilton calculator. The maths is in src/app/utils/engines/cayley-hamilton.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MatrixMethodCalculator from '@/app/components/method/MatrixMethodCalculator';
import { matrixTex } from '@/app/components/method/Matrix';
import { solve } from '@/app/utils/engines/cayley-hamilton';

const EXAMPLES = [
  { label: '[[1,2],[3,4]]', cells: [[1, 2], [3, 4]] },
  { label: '[[1,0,2],[0,2,1],[2,0,3]]', cells: [[1, 0, 2], [0, 2, 1], [2, 0, 3]] },
  { label: 'singular', cells: [[1, 2], [2, 4]] },
];

export default function CayleyHamiltonCalculator() {
  return (
    <MatrixMethodCalculator
      id="cayley-hamilton" title="Cayley–Hamilton Engine" button="Verify & Find A⁻¹" square min={2} max={4}
      start={[['2', '-1', '1'], ['-1', '2', '-1'], ['1', '-1', '2']]} examples={EXAMPLES} solve={solve}
      hint="A square matrix, 2×2 to 4×4."
      resultLabel="Cayley–Hamilton theorem"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={a.charTex} /></div>
          <p className="font-bold text-black dark:text-white">{a.satisfied ? 'A satisfies its characteristic equation: p(A) = O ✓' : 'p(A) is not zero: please check the matrix.'}</p>
          {a.inverse ? <div className="overflow-x-auto"><BlockMath math={`A^{-1} = ${matrixTex(a.inverse)}`} /></div> : <p className="text-sm">|A| = 0, so A has no inverse.</p>}
        </div>
      )}
    />
  );
}
