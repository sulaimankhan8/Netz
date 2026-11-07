'use client';
// The live golden section search calculator. The maths is in src/app/utils/engines/golden-section.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/golden-section';

const EXAMPLES = [
  {
    label: "min of x² − 4x + 5 on [0, 5]",
    input: {
      f: "x^2 - 4x + 5",
      a: "0",
      b: "5",
      goal: "min"
    }
  },
  {
    label: "max of x e^(−x) on [0, 3]",
    input: {
      f: "x e^(-x)",
      a: "0",
      b: "3",
      goal: "max"
    }
  },
  {
    label: "min of x⁴ − 3x on [0, 2]",
    input: {
      f: "x^4 - 3x",
      a: "0",
      b: "2",
      goal: "min"
    }
  },
  {
    label: "max of sin x on [0, 3]",
    input: {
      f: "sin(x)",
      a: "0",
      b: "3",
      goal: "max"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="golden-section" unit={1} title="Golden Section Engine" button="Search"
      start={{
  f: "x^2 - 4x + 5",
  a: "0",
  b: "5",
  tol: "0.001",
  goal: "min"
}}
      fields={[
        { key: 'goal', label: 'Find the', kind: 'choice', options: [{ value: 'min', label: 'Minimum' }, { value: 'max', label: 'Maximum' }] },
        { key: 'f', label: 'f(x)', placeholder: 'e.g. x^2 - 4x + 5', wide: true },
        { key: 'a', label: 'a', placeholder: '0' }, { key: 'b', label: 'b', placeholder: '5' },
        { key: 'tol', label: 'Stop when b − a <', placeholder: '0.001' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="f should have a single minimum (or maximum) between a and b."
      resultLabel={(a) => `${a.goal === 'max' ? 'Maximum' : 'Minimum'} after ${a.iterations} steps`}
      renderResult={(a) => (<div className="space-y-2 min-w-0"><div className="overflow-x-auto text-lg"><BlockMath math={`x^* \\approx ${a.x}, \\quad f(x^*) \\approx ${a.fx}`} /></div><CoordPlot fn={a.plot.fn} points={a.plot.points} view={a.plot.view} /></div>)}
      renderSteps={(a) => <StepTable columns={a.columns} rows={a.rows} />}
    />
  );
}
