'use client';
// The live power series calculator. The maths is in src/app/utils/engines/power-series.js.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/power-series';

const POWERS = [{ value: '1', label: '(x − a)ⁿ' }, { value: '2', label: '(x − a)²ⁿ' }, { value: '3', label: '(x − a)³ⁿ' }];
const EXAMPLES = [
  { label: 'Σ xⁿ/n', input: { c: '1/n', center: '0', power: '1' } },
  { label: 'Σ xⁿ/n!', input: { c: '1/n!', center: '0', power: '1' } },
  { label: 'Σ n(x − 2)ⁿ/3ⁿ', input: { c: 'n/3^n', center: '2', power: '1' } },
  { label: 'Σ (−1)ⁿx²ⁿ/4ⁿ', input: { c: '(-1)^n/4^n', center: '0', power: '2' } },
  { label: 'Σ n! xⁿ', input: { c: 'n!', center: '0', power: '1' } },
  { label: 'Σ (x + 1)ⁿ/n²', input: { c: '1/n^2', center: '-1', power: '1' } },
];

export default function PowerSeriesCalculator() {
  return (
    <SymbolicCalculator
      id="power-series" unit={6} title="Power Series Engine" button="Find R"
      start={{ c: 'n/3^n', center: '2', power: '1' }}
      fields={[
        { key: 'c', label: 'Coefficient cₙ', placeholder: 'e.g. 1/n!', wide: true },
        { key: 'center', label: 'Centre a', placeholder: '0' },
        { key: 'power', label: 'Each term has', kind: 'select', options: POWERS },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="The series is Σ cₙ (x − a)ⁿ. Write the coefficient only: for Σ n xⁿ/3ⁿ, cₙ = n/3^n."
      resultLabel="Radius and interval of convergence"
      renderResult={(a) => (
        <div className="space-y-1 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={a.series} /></div>
          <div className="overflow-x-auto text-lg"><BlockMath math={`R = ${a.R}, \\qquad \\text{interval } ${a.interval}`} /></div>
        </div>
      )}
    />
  );
}
