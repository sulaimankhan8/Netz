'use client';
// The live normal distribution calculator. The maths is in src/app/utils/engines/normal.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/normal';

const QUERIES = [{ value: 'lt', label: 'P(X < a)' }, { value: 'gt', label: 'P(X > a)' }, { value: 'between', label: 'P(a < X < b)' }, { value: 'inverse', label: 'find x for p' }];
const EXAMPLES = [
  { label: 'P(Z < 1.96)', input: { mu: '0', sigma: '1', query: 'lt', a: '1.96' } },
  { label: 'marks: N(60, 10²), over 75', input: { mu: '60', sigma: '10', query: 'gt', a: '75' } },
  { label: 'between 45 and 70', input: { mu: '60', sigma: '10', query: 'between', a: '45', b: '70' } },
  { label: 'top 5% of IQ (N(100, 15²))', input: { mu: '100', sigma: '15', query: 'inverse', p: '0.95' } },
];

export default function NormalCalculator() {
  return (
    <SymbolicCalculator
      id="normal" unit={5} title="Normal Distribution Engine" button="Find"
      start={{ mu: '60', sigma: '10', query: 'between', a: '50', b: '75', p: '0.9' }}
      fields={[
        { key: 'query', label: 'Find', kind: 'choice', options: QUERIES },
        { key: 'mu', label: 'Mean μ' },
        { key: 'sigma', label: 'Standard deviation σ' },
        { key: 'a', label: 'a', show: (v) => v.query !== 'inverse' },
        { key: 'b', label: 'b', show: (v) => v.query === 'between' },
        { key: 'p', label: 'Probability p = P(X < x)', show: (v) => v.query === 'inverse' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="For the standard normal Z, use μ = 0 and σ = 1."
      resultLabel="Answer"
      renderResult={(a) => (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
          <div className="space-y-2 min-w-0">
            <div className="overflow-x-auto text-lg"><BlockMath math={a.answerTex} /></div>
            <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Shaded: the area that is the probability.</p>
          </div>
          <div className="flex justify-center">
            <CoordPlot fn={a.pdf} view={{ x0: a.mu - 4 * a.sigma, x1: a.mu + 4 * a.sigma, y0: 0, y1: a.pdf(a.mu) }} shade={a.shade} />
          </div>
        </div>
      )}
    />
  );
}
