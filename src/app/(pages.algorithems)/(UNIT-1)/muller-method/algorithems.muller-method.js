'use client';
// The live Muller's method calculator. The maths is in src/app/utils/engines/muller-method.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/muller-method';

const EXAMPLES = [
  {
    label: "x³ − x − 1",
    input: {
      f: "x^3 - x - 1",
      x0: "0",
      x1: "1",
      x2: "2",
      tol: "1e-6",
      max: "20"
    }
  },
  {
    label: "Complex root of x² + 1",
    input: {
      f: "x^2 + 1",
      x0: "0",
      x1: "1",
      x2: "2",
      tol: "1e-8",
      max: "20"
    }
  },
  {
    label: "x³ − 2x − 5",
    input: {
      f: "x^3 - 2x - 5",
      x0: "1",
      x1: "2",
      x2: "3",
      tol: "1e-6",
      max: "20"
    }
  },
  {
    label: "cos x − x",
    input: {
      f: "cos(x) - x",
      x0: "0",
      x1: "0.5",
      x2: "1",
      tol: "1e-8",
      max: "20"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="muller-method" unit={1} title="Muller's Method Engine" button="Find Root"
      start={{
  f: "x^3 - x - 1",
  x0: "0",
  x1: "1",
  x2: "2",
  tol: "1e-6",
  max: "20"
}}
      fields={[
        { key: 'f', label: 'f(x)', placeholder: 'x^3 - x - 1', wide: true },
        { key: 'x0', label: 'x₀', placeholder: '0' }, { key: 'x1', label: 'x₁', placeholder: '1' }, { key: 'x2', label: 'x₂', placeholder: '2' },
        { key: 'tol', label: 'Tolerance', placeholder: '1e-6' }, { key: 'max', label: 'Max iterations', placeholder: '20' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Three different starting points. Complex roots are allowed."}
      resultLabel="Root"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`x \\approx ${a.root}`} /></div>}
      renderSteps={(a) => a.table && <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
