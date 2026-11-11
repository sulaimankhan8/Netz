'use client';
// The live inverse interpolation calculator. The maths is in src/app/utils/engines/inverse-interpolation.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/inverse-interpolation';

const EXAMPLES = [
  {
    label: "sin x table: y = 0.390",
    input: {
      method: "lagrange",
      x: "20 25 30 35",
      y: "0.342 0.423 0.5 0.574",
      target: "0.390"
    }
  },
  {
    label: "Iteration (equal spacing)",
    input: {
      method: "iteration",
      x: "10 15 20 25",
      y: "1754 2648 3564 4504",
      target: "3000"
    }
  },
  {
    label: "y = x³: find x for y = 10",
    input: {
      method: "lagrange",
      x: "1 2 3 4",
      y: "1 8 27 64",
      target: "10"
    }
  },
  {
    label: "Iteration on y = x²",
    input: {
      method: "iteration",
      x: "1 2 3 4",
      y: "1 4 9 16",
      target: "7"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="inverse-interpolation" unit={2} title="Inverse Interpolation Engine" button="Find x"
      start={{
  method: "lagrange",
  x: "20 25 30 35",
  y: "0.342 0.423 0.5 0.574",
  target: "0.390"
}}
      fields={[
        { key: 'method', label: 'Method', kind: 'choice', options: [{ value: 'lagrange', label: "Inverse Lagrange" }, { value: 'iteration', label: "Successive approximation" }] },
        { key: 'x', label: 'x', placeholder: '20 25 30 35', wide: true }, { key: 'y', label: 'y', placeholder: '0.342 0.423 0.5 0.574', wide: true },
        { key: 'target', label: 'Find x where y =', placeholder: '0.390' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"The iteration method needs equally spaced x."}
      resultLabel="x"
      renderResult={(a) => <div className="overflow-x-auto"><BlockMath math={`x \\approx ${a.x}`} /></div>}
      renderSteps={(a) => a.table && <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
