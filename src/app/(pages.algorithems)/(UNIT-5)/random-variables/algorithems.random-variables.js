'use client';
// The live random variables calculator. The maths is in src/app/utils/engines/random-variables.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method/StepTable';
import ProbabilityBars from '@/app/components/method/ProbabilityBars';
import CoordPlot from '@/app/components/method/CoordPlot';
import { plotView } from '@/app/components/method/plotView';
import { solve } from '@/app/utils/engines/random-variables';

const KINDS = [{ value: 'discrete', label: 'Discrete (table)' }, { value: 'continuous', label: 'Continuous (density)' }];
const EXAMPLES = [
  { label: 'heads in 3 tosses', input: { kind: 'discrete', x: '0, 1, 2, 3', p: '1/8, 3/8, 3/8, 1/8' } },
  { label: 'a fair die', input: { kind: 'discrete', x: '1, 2, 3, 4, 5, 6', p: '1/6, 1/6, 1/6, 1/6, 1/6, 1/6' } },
  { label: 'f(x) = 2x on [0, 1]', input: { kind: 'continuous', f: '2x', a: '0', b: '1', c: '0', d: '1/2' } },
  { label: 'f(x) = 3x²/8 on [0, 2]', input: { kind: 'continuous', f: '3x^2/8', a: '0', b: '2', c: '1', d: '2' } },
];

export default function RandomVariableCalculator() {
  return (
    <SymbolicCalculator
      id="random-variables" unit={5} title="Random Variable Engine" button="Calculate"
      start={{ kind: 'discrete', x: '0, 1, 2', p: '0.25, 0.5, 0.25', f: '2x', a: '0', b: '1', c: '', d: '' }}
      fields={[
        { key: 'kind', label: 'Type', kind: 'choice', options: KINDS },
        { key: 'x', label: 'Values x', placeholder: 'e.g. 0, 1, 2', show: (v) => v.kind === 'discrete' },
        { key: 'p', label: 'P(X = x)', placeholder: 'e.g. 1/4, 1/2, 1/4', show: (v) => v.kind === 'discrete' },
        { key: 'f', label: 'Density f(x)', placeholder: 'e.g. 2x', show: (v) => v.kind === 'continuous', wide: true },
        { key: 'a', label: 'From a', show: (v) => v.kind === 'continuous' },
        { key: 'b', label: 'To b', show: (v) => v.kind === 'continuous' },
        { key: 'c', label: 'P(c < X < d): c (optional)', show: (v) => v.kind === 'continuous' },
        { key: 'd', label: 'd (optional)', show: (v) => v.kind === 'continuous' },
      ]}
      examples={EXAMPLES} solve={solve}
      resultLabel="Mean and variance"
      renderResult={(a) => (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
          <div className="space-y-2 min-w-0">
            <div className="overflow-x-auto"><BlockMath math={`E(X) = ${a.meanTex}, \\quad \\text{Var}(X) = ${a.varianceTex}, \\quad \\sigma = ${Number(a.sd.toPrecision(6))}`} /></div>
            {a.prob !== null && a.prob !== undefined && <p className="text-sm font-mono">Probability in the chosen range: {Number(a.prob.toPrecision(6))}</p>}
          </div>
          <div className="flex justify-center">
            {a.kind === 'discrete' ? <ProbabilityBars bars={a.bars} label="P(X = x)" /> : <CoordPlot fn={a.fAt} view={plotView([a.fAt], a.a, a.b)} shade={{ a: a.a, b: a.b }} />}
          </div>
        </div>
      )}
      renderSteps={(a) => (a.table ? <StepTable columns={a.table.columns} rows={a.table.rows} /> : null)}
    />
  );
}
