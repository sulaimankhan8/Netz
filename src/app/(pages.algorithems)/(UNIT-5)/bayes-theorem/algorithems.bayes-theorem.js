'use client';
// The live Bayes' theorem calculator. The maths is in src/app/utils/engines/bayes.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method/StepTable';
import { solve } from '@/app/utils/engines/bayes';

const EXAMPLES = [
  { label: 'three machines, a defective bolt', input: { priors: '0.25, 0.35, 0.40', likelihoods: '0.05, 0.04, 0.02', names: 'A, B, C' } },
  { label: 'three bags, a red ball', input: { priors: '1/3, 1/3, 1/3', likelihoods: '1/2, 2/3, 1/4', names: 'Bag 1, Bag 2, Bag 3' } },
  { label: 'medical test', input: { priors: '0.01, 0.99', likelihoods: '0.95, 0.05', names: 'ill, healthy' } },
];

export default function BayesCalculator() {
  return (
    <SymbolicCalculator
      id="bayes" unit={5} title="Bayes' Theorem Engine" button="Find Posteriors"
      start={{ priors: '0.5, 0.3, 0.2', likelihoods: '0.02, 0.03, 0.05', names: 'E1, E2, E3' }}
      fields={[
        { key: 'priors', label: 'P(Eᵢ) for each event', placeholder: 'e.g. 0.5, 0.3, 0.2', wide: true },
        { key: 'likelihoods', label: 'P(A | Eᵢ) for each event', placeholder: 'e.g. 0.02, 0.03, 0.05', wide: true },
        { key: 'names', label: 'Names (optional)', placeholder: 'e.g. A, B, C', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="The P(Eᵢ) must add up to 1. Fractions like 1/3 are fine."
      resultLabel="Probability of each cause, given A"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={`P(A) = ${a.PATex}`} /></div>
          {a.posteriorTex.map((t, i) => <div key={i} className="overflow-x-auto"><BlockMath math={`P(${a.labels[i]} \\mid A) = ${t}`} /></div>)}
        </div>
      )}
      renderSteps={(a) => <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
