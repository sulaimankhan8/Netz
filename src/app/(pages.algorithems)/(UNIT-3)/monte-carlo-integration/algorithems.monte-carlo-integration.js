'use client';
// The live Monte Carlo integration calculator. The maths is in src/app/utils/engines/monte-carlo-integration.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/monte-carlo-integration';

const EXAMPLES = [
  {
    label: "∫₀¹ x² dx",
    input: {
      mode: "mean",
      f: "x^2",
      a: "0",
      b: "1",
      N: "1000",
      seed: "1"
    }
  },
  {
    label: "π/4 by hit or miss",
    input: {
      mode: "hit",
      f: "sqrt(1 - x^2)",
      a: "0",
      b: "1",
      N: "10000",
      seed: "1"
    }
  },
  {
    label: "∫₀² e^(−x²) dx",
    input: {
      mode: "mean",
      f: "e^(-x^2)",
      a: "0",
      b: "2",
      N: "5000",
      seed: "7"
    }
  },
  {
    label: "∫₀^π sin x dx",
    input: {
      mode: "mean",
      f: "sin(x)",
      a: "0",
      b: "pi",
      N: "2000",
      seed: "3"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="monte-carlo-integration" unit={3} title="Monte Carlo Engine" button="Estimate"
      start={{
  mode: "mean",
  f: "x^2",
  a: "0",
  b: "1",
  N: "1000",
  seed: "1"
}}
      fields={[
        { key: 'mode', label: 'Method', kind: 'choice', options: [{ value: 'mean', label: "Sample mean" }, { value: 'hit', label: "Hit or miss" }] },
        { key: 'f', label: 'f(x)', placeholder: 'x^2', wide: true },
        { key: 'a', label: 'a', placeholder: '0' }, { key: 'b', label: 'b', placeholder: '1' },
        { key: 'N', label: 'Samples N', placeholder: '1000' }, { key: 'seed', label: 'Seed', placeholder: '1' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"The same seed always gives the same random numbers."}
      resultLabel="Estimate"
      renderResult={(a) => (<div className="space-y-1 min-w-0"><div className="overflow-x-auto"><BlockMath math={`I \\approx ${a.estimate} \\pm ${a.se}`} /></div><div className="overflow-x-auto"><BlockMath math={`\\text{exact: } ${a.exact}, \\quad \\text{error} = ${a.error}`} /></div></div>)}
      renderSteps={(a) => (<div className="space-y-4"><StepTable columns={a.table.columns} rows={a.table.rows} />{a.mode === 'hit' && a.plot.view && <div className="max-w-sm"><CoordPlot points={a.plot.points} fn={a.plot.fn} view={a.plot.view} /><p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-1">The first 200 random points and the curve; the estimate uses the share below it.</p></div>}</div>)}
    />
  );
}
