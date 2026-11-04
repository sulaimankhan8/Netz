'use client';
// The live consistency (rank test) calculator. The maths is in src/app/utils/engines/consistency.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MatrixMethodCalculator from '@/app/components/method/MatrixMethodCalculator';
import { texNumber } from '@/app/components/method/Matrix';
import { solve } from '@/app/utils/engines/consistency';

const EXAMPLES = [
  { label: 'unique solution', cells: [[1, 1, 1, 6], [1, 2, 3, 14], [1, 4, 9, 36]] },
  { label: 'infinitely many', cells: [[1, 1, 1, 6], [1, 2, 3, 14], [2, 3, 4, 20]] },
  { label: 'no solution', cells: [[1, 1, 1, 6], [1, 2, 3, 14], [2, 3, 4, 21]] },
  { label: 'homogeneous', cells: [[1, 2, -1, 0], [2, 4, -2, 0], [1, 1, 1, 0]] },
];
const VERDICT = { one: 'Consistent: one unique solution', many: 'Consistent: infinitely many solutions', none: 'Inconsistent: no solution' };

export default function ConsistencyCalculator() {
  return (
    <MatrixMethodCalculator
      id="consistency" title="Consistency Engine" label="[A | B]" divider button="Test Consistency"
      start={EXAMPLES[0].cells.map((r) => r.map(String))} examples={EXAMPLES} solve={solve} min={1} max={6}
      hint="Enter the augmented matrix: the coefficients of each equation, then its constant in the last column."
      resultLabel="Rank test"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={`\\rho(A) = ${a.rankA}, \\quad \\rho([A|B]) = ${a.rankAug}, \\quad n = ${a.n}`} /></div>
          <p className="font-bold text-black dark:text-white">{VERDICT[a.kind]}{a.homogeneous && a.kind === 'one' ? ' (only the trivial solution)' : ''}</p>
          {a.solution && <div className="overflow-x-auto"><BlockMath math={a.names.map((x, j) => `${x} = ${texNumber(a.solution[j])}`).join(', \\quad ')} /></div>}
          {a.general && <div className="overflow-x-auto"><BlockMath math={a.general.join(', \\quad ')} /></div>}
        </div>
      )}
    />
  );
}
