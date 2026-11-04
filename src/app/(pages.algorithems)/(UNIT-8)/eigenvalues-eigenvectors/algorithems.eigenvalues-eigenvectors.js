'use client';
// The live eigenvalue calculator. The maths is in src/app/utils/engines/eigenvalues.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MatrixMethodCalculator from '@/app/components/method/MatrixMethodCalculator';
import { solve } from '@/app/utils/engines/eigenvalues';

const EXAMPLES = [
  { label: '[[2,0,0],[0,3,4],[0,4,9]]', cells: [[2, 0, 0], [0, 3, 4], [0, 4, 9]] },
  { label: 'repeated λ (symmetric)', cells: [[6, -2, 2], [-2, 3, -1], [2, -1, 3]] },
  { label: 'complex λ (rotation)', cells: [[0, -1], [1, 0]] },
  { label: 'irrational λ', cells: [[1, 2], [3, 4]] },
];

export default function EigenvalueCalculator() {
  return (
    <MatrixMethodCalculator
      id="eigenvalues" title="Eigenvalue Engine" button="Find Eigenvalues" square min={2} max={4}
      start={[['4', '1'], ['2', '3']]} examples={EXAMPLES} solve={solve}
      hint="A square matrix, 2×2 to 4×4."
      resultLabel="Eigenvalues and eigenvectors"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={a.charTex} /></div>
          {a.pairs.map((p, i) => (
            <div key={i} className="overflow-x-auto"><BlockMath math={`\\lambda = ${p.lambdaTex}${p.algebraic > 1 ? `\\ (\\times ${p.algebraic})` : ''}: \\quad X = ${p.vectors.join(', \\ ')}`} /></div>
          ))}
          {a.complex.map((z, i) => <div key={`c${i}`} className="overflow-x-auto"><BlockMath math={`\\lambda = ${z.tex} \\ \\text{(complex)}`} /></div>)}
        </div>
      )}
    />
  );
}
