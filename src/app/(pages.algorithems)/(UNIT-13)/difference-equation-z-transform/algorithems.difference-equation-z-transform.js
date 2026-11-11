'use client';
// The live difference equation calculator. The maths is in src/app/utils/engines/difference-equation-z.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/difference-equation-z';

const EXAMPLES = [
  {
    label: "y(n+2) − 3y(n+1) + 2y(n) = 0",
    input: {
      eq: "y(n+2) - 3y(n+1) + 2y(n) = 0",
      ics: "y(0) = 0, y(1) = 1"
    }
  },
  {
    label: "y(n+2) + 6y(n+1) + 9y(n) = 2ⁿ",
    input: {
      eq: "y(n+2) + 6y(n+1) + 9y(n) = 2^n",
      ics: "y(0) = 0, y(1) = 0"
    }
  },
  {
    label: "y(n+1) − 2y(n) = 3ⁿ",
    input: {
      eq: "y(n+1) - 2y(n) = 3^n",
      ics: "y(0) = 1"
    }
  },
  {
    label: "yₙ₊₂ − 2yₙ₊₁ + yₙ = 3n + 5",
    input: {
      eq: "y_{n+2} - 2y_{n+1} + y_n = 3n + 5",
      ics: "y_0 = 0, y_1 = 0"
    }
  },
  {
    label: "Fibonacci",
    input: {
      eq: "y(n) - y(n-1) - y(n-2) = 0",
      ics: "y(0) = 0, y(1) = 1"
    }
  },
  {
    label: "y(n+2) + y(n) = 0",
    input: {
      eq: "y(n+2) + y(n) = 0",
      ics: "y(0) = 1, y(1) = 0"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="difference-equation-z" unit={13} title="Difference Equation Engine" button="Solve"
      start={{
  eq: "y(n+2) + 6y(n+1) + 9y(n) = 2^n",
  ics: "y(0) = 0, y(1) = 0"
}}
      fields={[
        { key: 'eq', label: 'Equation', placeholder: 'y(n+2) - 3y(n+1) + 2y(n) = 0', wide: true },
        { key: 'ics', label: 'Starting values', placeholder: 'y(0) = 0, y(1) = 1', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Write y(n+1) or y_{n+1}. The right side may use 2^n, n, cos(n pi/2) …"}
      resultLabel="y(n)"
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`Y(z) = ${a.Ytex}`} /></div><div className="overflow-x-auto"><BlockMath math={`y(n) = ${a.yTex}`} /></div></div>)}
      renderSteps={(a) => a.table && <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
