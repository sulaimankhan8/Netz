'use client';
// The live rational expressions calculator. The maths is in src/app/utils/engines/rational-expressions.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/rational-expressions';

const EXAMPLES = ['(x^2 - 5x + 6)/(x^2 - 9)', '1/(x - 1) + 1/(x + 1)', '2/(x^2 - 4) - 1/(x - 2)', 'x/(x - 3) * (x^2 - 9)/x^2', '(x^3 - 8)/(x - 2)'].map((expr) => ({ label: expr, input: { expr } }));

export default function RationalExpressionsCalculator() {
  return (
    <SymbolicCalculator
      id="rational-expressions" unit={7} title="Rational Expressions Engine" button="Simplify"
      start={{ expr: '(x^2 - 1)/(x^2 + 2x + 1)' }}
      fields={[{ key: 'expr', label: 'Expression', placeholder: 'e.g. (x^2 - 1)/(x^2 + 2x + 1)' }]}
      examples={EXAMPLES} solve={solve}
      hint="Use brackets around each top and bottom. You can add, subtract, multiply and divide fractions."
      resultLabel="Simplified"
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={a.input} /></div>
          <div className="overflow-x-auto text-lg"><BlockMath math={`= ${a.answer}`} /></div>
          {a.restrictions.length > 0 && <div className="overflow-x-auto"><BlockMath math={`${a.variable} \\neq ${a.restrictions.join(', \\ ')}`} /></div>}
        </div>
      )}
    />
  );
}
