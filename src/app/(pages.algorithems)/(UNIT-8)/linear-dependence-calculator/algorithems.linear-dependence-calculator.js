'use client';
// The live linear dependence calculator. The maths is in src/app/utils/engines/linear-dependence.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MatrixMethodCalculator from '@/app/components/method/MatrixMethodCalculator';
import { solve } from '@/app/utils/engines/linear-dependence';

const EXAMPLES = [
  { label: '(1,2,3), (4,5,6), (7,8,9)', cells: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] },
  { label: 'standard basis', cells: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] },
  { label: 'three in ℝ²', cells: [[1, 1], [2, 3], [4, 5]] },
];

export default function LinearDependenceCalculator() {
  return (
    <MatrixMethodCalculator
      id="linear-dependence" title="Linear Dependence Engine" label="vectors" button="Test"
      start={[['1', '2', '1'], ['2', '1', '0'], ['3', '3', '1']]} examples={EXAMPLES} solve={solve} max={6}
      hint="One vector per row. The engine puts them as columns and row-reduces."
      resultLabel="Dependent or independent?" opsTitle="Row reduction of the matrix with the vectors as columns"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <p className="font-bold text-black dark:text-white">{a.independent ? 'Linearly independent' : 'Linearly dependent'} (rank {a.rank}, {a.k} vectors)</p>
          {a.relation && <div className="overflow-x-auto text-lg"><BlockMath math={a.relation} /></div>}
        </div>
      )}
    />
  );
}
