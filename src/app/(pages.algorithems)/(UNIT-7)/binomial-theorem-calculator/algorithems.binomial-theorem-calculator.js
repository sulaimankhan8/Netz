'use client';
// The live binomial theorem calculator. The maths is in src/app/utils/engines/binomial-theorem.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/binomial-theorem';

const MODES = [
  { value: 'expand', label: 'Expand' },
  { value: 'term', label: 'A term' },
  { value: 'coef', label: 'Coefficient of xᵏ' },
  { value: 'constant', label: 'Constant term' },
  { value: 'middle', label: 'Middle term' },
];
const EXAMPLES = [
  { label: '(2x − 3)⁵', input: { a: '2x', b: '-3', n: '5', mode: 'expand' } },
  { label: '(x + y)⁴', input: { a: 'x', b: 'y', n: '4', mode: 'expand' } },
  { label: 'constant in (x² − 1/x)⁹', input: { a: 'x^2', b: '-1/x', n: '9', mode: 'constant' } },
  { label: 'x⁴ in (2x + 3)⁷', input: { a: '2x', b: '3', n: '7', mode: 'coef', k: '4' } },
  { label: 'middle of (x + 2)⁸', input: { a: 'x', b: '2', n: '8', mode: 'middle' } },
];

export default function BinomialCalculator() {
  return (
    <SymbolicCalculator
      id="binomial-theorem" unit={7} title="Binomial Theorem Engine" button="Find"
      start={{ a: 'x', b: '2', n: '4', mode: 'expand', r: '3', k: '2' }}
      fields={[
        { key: 'mode', label: 'Find', kind: 'choice', options: MODES },
        { key: 'a', label: 'First term a', placeholder: 'e.g. 2x' },
        { key: 'b', label: 'Second term b', placeholder: 'e.g. -3 or 1/x' },
        { key: 'n', label: 'Power n (0 to 15)', placeholder: 'e.g. 5' },
        { key: 'r', label: 'Which term (1st, 2nd …)', show: (v) => v.mode === 'term' },
        { key: 'k', label: 'Power k of x', show: (v) => v.mode === 'coef' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="a and b are single terms such as 2x, -3, x^2 or 1/x."
      resultLabel={(a) => MODES.find((m) => m.value === a.mode)?.label ?? 'Answer'}
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={`\\left(${a.a} ${a.bShown}\\right)^{${a.n}}`} /></div>
          <div className="overflow-x-auto text-lg"><BlockMath math={a.mode === 'expand' ? `= ${a.answer}` : a.answer} /></div>
        </div>
      )}
    />
  );
}
