'use client';
// The live binomial distribution calculator. The maths is in src/app/utils/engines/binomial.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method/StepTable';
import ProbabilityBars from '@/app/components/method/ProbabilityBars';
import { solve } from '@/app/utils/engines/binomial';

export const QUERY_OPTIONS = [
  { value: 'eq', label: 'P(X = k)' }, { value: 'le', label: 'P(X ≤ k)' }, { value: 'lt', label: 'P(X < k)' },
  { value: 'ge', label: 'P(X ≥ k)' }, { value: 'gt', label: 'P(X > k)' }, { value: 'between', label: 'P(a ≤ X ≤ b)' },
];
export const queryFields = [
  { key: 'query', label: 'Find', kind: 'choice', options: QUERY_OPTIONS },
  { key: 'k', label: 'k', show: (v) => v.query !== 'between' },
  { key: 'a', label: 'a', show: (v) => v.query === 'between' },
  { key: 'b', label: 'b', show: (v) => v.query === 'between' },
];
const EXAMPLES = [
  { label: '10 coins, exactly 5 heads', input: { n: '10', p: '1/2', query: 'eq', k: '5' } },
  { label: '6 coins, at least 1 head', input: { n: '6', p: '1/2', query: 'ge', k: '1' } },
  { label: '20 items, 10% faulty, 2 to 4', input: { n: '20', p: '0.1', query: 'between', a: '2', b: '4' } },
];

export default function BinomialCalculator() {
  return (
    <SymbolicCalculator
      id="binomial" unit={5} title="Binomial Engine" button="Find Probability"
      start={{ n: '10', p: '0.3', query: 'le', k: '2', a: '1', b: '3' }}
      fields={[{ key: 'n', label: 'Trials n' }, { key: 'p', label: 'Success probability p', placeholder: 'e.g. 0.3 or 1/6' }, ...queryFields]}
      examples={EXAMPLES} solve={solve}
      resultLabel="Probability"
      renderResult={(a) => (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
          <div className="space-y-2 min-w-0">
            <div className="overflow-x-auto text-lg"><BlockMath math={`${a.question} = ${a.valueTex}`} /></div>
            <div className="overflow-x-auto"><BlockMath math={`\\mu = np = ${Number(a.mean.toFixed(6))}, \\quad \\sigma^2 = npq = ${Number(a.variance.toFixed(6))}`} /></div>
          </div>
          <div className="flex justify-center"><ProbabilityBars bars={a.bars} /></div>
        </div>
      )}
      renderSteps={(a) => <details className="rounded-xl border border-black/20 dark:border-neutral-700"><summary className="cursor-pointer px-4 py-3 min-h-[44px] text-xs font-mono font-bold uppercase text-black dark:text-white">Full distribution table</summary><div className="p-3"><StepTable columns={a.table.columns} rows={a.table.rows} /></div></details>}
    />
  );
}
