'use client';
// The live logarithm calculator. The maths is in src/app/utils/engines/logarithms.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/logarithms';

const MODES = [{ value: 'evaluate', label: 'Evaluate log_b x' }, { value: 'solve', label: 'Solve an equation' }, { value: 'expand', label: 'Expand with log laws' }];
const EXAMPLES = [
  { label: 'log₉ 3', input: { mode: 'evaluate', b: '9', x: '3' } },
  { label: '3·2^(x−1) + 5 = 29', input: { mode: 'solve', eq: '3*2^(x-1) + 5 = 29' } },
  { label: '5^x = 20', input: { mode: 'solve', eq: '5^x = 20' } },
  { label: 'log_2(x − 3) = 5', input: { mode: 'solve', eq: 'log_2(x - 3) = 5' } },
  { label: 'expand log(x²y/z³)', input: { mode: 'expand', expr: 'x^2 y / z^3', b: '10' } },
];

export default function LogarithmCalculator() {
  return (
    <SymbolicCalculator
      id="logarithms" unit={7} title="Logarithm Engine" button="Go"
      start={{ mode: 'evaluate', b: '2', x: '8', eq: '2^(x+1) = 8', expr: 'x^2 y / z^3' }}
      fields={[
        { key: 'mode', label: 'What to do', kind: 'choice', options: MODES },
        { key: 'b', label: 'Base b', placeholder: '10, 2, e …', show: (v) => v.mode !== 'solve' },
        { key: 'x', label: 'Number x', placeholder: 'e.g. 8', show: (v) => v.mode === 'evaluate' },
        { key: 'eq', label: 'Equation', placeholder: 'e.g. 2^(x+1) = 8', show: (v) => v.mode === 'solve', wide: true },
        { key: 'expr', label: 'Inside the log', placeholder: 'e.g. x^2 y / z^3', show: (v) => v.mode === 'expand' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="log means base 10, ln means base e, and log_2(…) is base 2."
      resultLabel={(a) => MODES.find((m) => m.value === a.mode)?.label ?? 'Answer'}
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          {a.mode === 'solve' ? (
            <>
              <div className="overflow-x-auto"><BlockMath math={a.question} /></div>
              <div className="overflow-x-auto text-lg"><BlockMath math={a.answer} /></div>
            </>
          ) : (
            <div className="overflow-x-auto text-lg"><BlockMath math={`${a.question} = ${a.answer}`} /></div>
          )}
        </div>
      )}
    />
  );
}
