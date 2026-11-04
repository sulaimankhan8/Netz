'use client';
// The live Poisson distribution calculator. The maths is in src/app/utils/engines/poisson.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method/StepTable';
import ProbabilityBars from '@/app/components/method/ProbabilityBars';
import { queryFields } from '../binomial-distribution/algorithems.binomial-distribution';
import { solve } from '@/app/utils/engines/poisson';

const EXAMPLES = [
  { label: 'λ = 2, exactly 3', input: { source: 'lambda', lambda: '2', query: 'eq', k: '3' } },
  { label: 'λ = 3, at least 1', input: { source: 'lambda', lambda: '3', query: 'ge', k: '1' } },
  { label: 'n = 200, p = 0.01, at most 2', input: { source: 'binomial', n: '200', p: '0.01', query: 'le', k: '2' } },
];

export default function PoissonCalculator() {
  return (
    <SymbolicCalculator
      id="poisson" unit={5} title="Poisson Engine" button="Find Probability"
      start={{ source: 'lambda', lambda: '2', n: '200', p: '0.01', query: 'eq', k: '3', a: '1', b: '3' }}
      fields={[
        { key: 'source', label: 'Given', kind: 'choice', options: [{ value: 'lambda', label: 'the mean λ' }, { value: 'binomial', label: 'n and p (λ = np)' }] },
        { key: 'lambda', label: 'Mean λ', show: (v) => v.source === 'lambda' },
        { key: 'n', label: 'n', show: (v) => v.source === 'binomial' },
        { key: 'p', label: 'p', show: (v) => v.source === 'binomial' },
        ...queryFields,
      ]}
      examples={EXAMPLES} solve={solve}
      resultLabel="Probability"
      renderResult={(a) => (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
          <div className="space-y-2 min-w-0">
            <div className="overflow-x-auto text-lg"><BlockMath math={`${a.question} = ${a.valueTex}`} /></div>
            <div className="overflow-x-auto"><BlockMath math={`\\mu = \\sigma^2 = \\lambda = ${Number(a.lambda.toFixed(6))}`} /></div>
          </div>
          <div className="flex justify-center"><ProbabilityBars bars={a.bars} /></div>
        </div>
      )}
      renderSteps={(a) => <details className="rounded-xl border border-black/20 dark:border-neutral-700"><summary className="cursor-pointer px-4 py-3 min-h-[44px] text-xs font-mono font-bold uppercase text-black dark:text-white">Distribution table</summary><div className="p-3"><StepTable columns={a.table.columns} rows={a.table.rows} /></div></details>}
    />
  );
}
