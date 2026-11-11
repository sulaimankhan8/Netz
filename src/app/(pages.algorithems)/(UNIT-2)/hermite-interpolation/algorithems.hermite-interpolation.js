'use client';
// The live Hermite interpolation calculator. The maths is in src/app/utils/engines/hermite-interpolation.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/hermite-interpolation';

const EXAMPLES = [
  {
    label: "Two points with slopes",
    input: {
      x: "0 1",
      y: "1 3",
      dy: "0 2",
      at: "0.5"
    }
  },
  {
    label: "x² from 3 points",
    input: {
      x: "-1 0 1",
      y: "1 0 1",
      dy: "-2 0 2",
      at: ""
    }
  },
  {
    label: "sin x at 0, π/2",
    input: {
      x: "0 1.5707963",
      y: "0 1",
      dy: "1 0",
      at: "0.785398"
    }
  },
  {
    label: "Three points",
    input: {
      x: "1 2 3",
      y: "2 3 5",
      dy: "1 1 3",
      at: "2.5"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="hermite-interpolation" unit={2} title="Hermite Interpolation Engine" button="Interpolate"
      start={{
  x: "0 1",
  y: "1 3",
  dy: "0 2",
  at: "0.5"
}}
      fields={[
        { key: 'x', label: 'x', placeholder: '0 1' }, { key: 'y', label: 'f(x)', placeholder: '1 3' }, { key: 'dy', label: "f′(x)", placeholder: '0 2' },
        { key: 'at', label: 'Evaluate at (optional)', placeholder: '0.5' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Same number of x, f(x) and f′(x)."}
      resultLabel="H(x)"
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`H(x) = ${a.poly}`} /></div>{a.value && <div className="overflow-x-auto"><BlockMath math={`\\text{value} = ${a.value}`} /></div>}</div>)}
      renderSteps={(a) => a.table && <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
