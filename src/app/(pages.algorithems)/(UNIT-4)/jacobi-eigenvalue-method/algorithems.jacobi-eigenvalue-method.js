'use client';
// The live Jacobi eigenvalue calculator. The maths is in src/app/utils/engines/jacobi-eigen.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MatrixMethodCalculator from '@/app/components/method/MatrixMethodCalculator';
import { StepTable } from '@/app/components/method/StepTable';
import { solve } from '@/app/utils/engines/jacobi-eigen';

const EXAMPLES = [
  { label: '[[2,1],[1,2]] (one rotation)', cells: [[2, 1], [1, 2]] },
  { label: '[[6,−2,2],[−2,3,−1],[2,−1,3]]', cells: [[6, -2, 2], [-2, 3, -1], [2, -1, 3]] },
  { label: '4 × 4 symmetric', cells: [[4, -1, 0, 1], [-1, 4, -1, 0], [0, -1, 4, -1], [1, 0, -1, 4]] },
];

export default function JacobiEigenCalculator() {
  return (
    <MatrixMethodCalculator
      id="jacobi-eigen" unit={4} title="Jacobi Rotation Engine" button="Find Eigenvalues" square min={2} max={6}
      start={[['6', '-2', '2'], ['-2', '3', '-1'], ['2', '-1', '3']]} examples={EXAMPLES} solve={solve}
      extraFields={[{ key: 'tol', label: 'Stop when off-diagonal entries are below', placeholder: '1e-6' }]} extraStart={{ tol: '1e-6' }}
      hint="A must be symmetric (aᵢⱼ = aⱼᵢ)."
      resultLabel="Eigenvalues and eigenvectors"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          {a.valuesTex.map((v, i) => <div key={i} className="overflow-x-auto"><BlockMath math={`\\lambda_{${i + 1}} = ${v}: \\quad X = ${a.vectorsTex[i]}`} /></div>)}
          <p className="text-sm font-mono">{a.rotations} rotation{a.rotations === 1 ? '' : 's'}.</p>
        </div>
      )}
      renderSteps={(a) => <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
