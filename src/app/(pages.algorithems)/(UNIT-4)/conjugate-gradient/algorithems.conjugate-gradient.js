'use client';
// The live conjugate gradient calculator. The maths is in src/app/utils/engines/conjugate-gradient.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/conjugate-gradient';

const EXAMPLES = [
  {
    label: "2 × 2: [4 1; 1 3]",
    input: {
      A: "4 1; 1 3",
      b: "1 2",
      x0: "",
      tol: "1e-10"
    }
  },
  {
    label: "3 × 3 tridiagonal",
    input: {
      A: "4 -1 0; -1 4 -1; 0 -1 4",
      b: "15 10 10",
      x0: "",
      tol: "1e-10"
    }
  },
  {
    label: "3 × 3 with x₀",
    input: {
      A: "2 -1 0; -1 2 -1; 0 -1 2",
      b: "1 0 1",
      x0: "1 1 1",
      tol: "1e-10"
    }
  },
  {
    label: "4 × 4",
    input: {
      A: "10 1 2 0; 1 8 1 1; 2 1 9 2; 0 1 2 7",
      b: "13 11 14 10",
      x0: "",
      tol: "1e-10"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="conjugate-gradient" unit={4} title="Conjugate Gradient Engine" button="Solve"
      start={{
  A: "4 1; 1 3",
  b: "1 2",
  x0: "",
  tol: "1e-10"
}}
      fields={[
        { key: 'A', label: 'A (symmetric, rows separated by ;)', placeholder: '4 1; 1 3', wide: true },
        { key: 'b', label: 'b', placeholder: '1 2' }, { key: 'x0', label: 'x₀ (empty: 0)', placeholder: '0 0' },
        { key: 'tol', label: 'Tolerance', placeholder: '1e-10' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"A must be symmetric and positive definite."}
      resultLabel="x"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`\\mathbf{x} = (${a.x.join(', ')}) \\quad (${a.iterations} \\text{ steps})`} /></div>}
      renderSteps={(a) => <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
