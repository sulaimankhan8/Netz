'use client';
// The live limit-laws calculator. The maths is in src/app/utils/engines/limit-laws.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/limit-laws';

const EXAMPLES = [
  { label: 'x² + 3x at 2', input: { f: 'x^2 + 3x', a: '2' } },
  { label: '(x² + 1)/(x + 1) at 1', input: { f: '(x^2 + 1)/(x + 1)', a: '1' } },
  { label: '(2x + 1)·√(x + 4) at 5', input: { f: '(2x + 1)*sqrt(x + 4)', a: '5' } },
  { label: '3x² − 2x + 5 at −1', input: { f: '3x^2 - 2x + 5', a: '-1' } },
  { label: '(x + 2)³ at 1', input: { f: '(x + 2)^3', a: '1' } },
  { label: '(x² − 1)/(x − 1) at 1 (laws fail)', input: { f: '(x^2 - 1)/(x - 1)', a: '1' } },
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="limit-laws" unit={6} title="Limit Laws Engine" button="Find the Limit"
      start={{ f: 'x^2 + 3x', a: '2' }}
      fields={[
        { key: 'f', label: 'f(x) =', placeholder: 'e.g. (x^2 + 1)/(x + 1)', wide: true, maths: true },
        { key: 'a', label: 'x approaches', placeholder: 'e.g. 2' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="For x → a where a is a number. If a law cannot be used (for example a bottom that tends to 0), NETZ says so and finishes with the usual limit methods."
      resultLabel={(a) => (a.usedLaws ? 'Limit (found with the laws)' : 'Limit (the laws could not finish this one)')}
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`\\lim_{${a.variable}\\to ${a.a}} ${a.f} = ${a.valueTex}`} /></div>
          {a.usedLaws && <p className="text-sm">Laws used: {a.lawsUsed.join(', ')}.</p>}
        </div>
      )}
    />
  );
}
