'use client';
// The live Newton's method for systems calculator. The maths is in src/app/utils/engines/newton-system.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method/StepTable';
import { solve } from '@/app/utils/engines/newton-system';

const EXAMPLES = [
  { label: 'x² + y = 11, x + y² = 7', input: { f1: 'x^2 + y = 11', f2: 'x + y^2 = 7', f3: '', x0: '3.5', y0: '-1.8', z0: '' } },
  { label: 'circle and xy = 1', input: { f1: 'x^2 + y^2 = 4', f2: 'x*y = 1', f3: '', x0: '2', y0: '0.5', z0: '' } },
  { label: 'three equations', input: { f1: 'x^2 + y^2 + z^2 = 1', f2: '2x^2 + y^2 = 4z', f3: '3x^2 - 4y + z^2 = 0', x0: '0.5', y0: '0.5', z0: '0.5' } },
];

export default function NewtonSystemCalculator() {
  return (
    <SymbolicCalculator
      id="newton-system" unit={1} title="Newton System Engine" button="Solve"
      start={{ f1: 'x^2 + y^2 = 4', f2: 'x*y = 1', f3: '', x0: '2', y0: '0.5', z0: '', tol: '0.0001' }}
      fields={[
        { key: 'f1', label: 'Equation 1', placeholder: 'e.g. x^2 + y^2 = 4', wide: true },
        { key: 'f2', label: 'Equation 2', placeholder: 'e.g. x*y = 1', wide: true },
        { key: 'f3', label: 'Equation 3 (optional, uses z)', placeholder: 'leave empty for 2 equations', wide: true },
        { key: 'x0', label: 'Start x₀' },
        { key: 'y0', label: 'Start y₀' },
        { key: 'z0', label: 'Start z₀ (for 3 equations)' },
        { key: 'tol', label: 'Tolerance' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Write x*y for a product of two letters. Start close to the solution you want (a sketch helps)."
      resultLabel={(a) => (a.converged ? `Solution (${a.iterations} iterations)` : 'Not converged')}
      renderResult={(a) => <div className="overflow-x-auto text-lg"><BlockMath math={`(${a.names.join(', ')}) = (${a.solution.map((v) => Number(v.toFixed(6))).join(', ')})`} /></div>}
      renderSteps={(a) => <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
