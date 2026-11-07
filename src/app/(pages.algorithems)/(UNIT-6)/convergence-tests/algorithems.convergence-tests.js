'use client';
// The live series convergence calculator. The maths is in src/app/utils/engines/convergence-tests.js.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/convergence-tests';

const EXAMPLES = ['1/n^2', '1/n', 'n/2^n', 'n!/n^n', '(-1)^n/n', '(2/3)^n', 'n/(n + 1)', '1/(n^2 + 1)', '3^n/n!', '(-1)^n/sqrt(n)']
  .map((a) => ({ label: a, input: { a, n0: '1' } }));
const VERDICT = { converges: 'Converges', 'converges absolutely': 'Converges absolutely', 'converges conditionally': 'Converges conditionally', diverges: 'Diverges', inconclusive: 'No decision' };

export default function ConvergenceCalculator() {
  return (
    <SymbolicCalculator
      id="convergence-tests" unit={6} title="Convergence Test Engine" button="Test"
      start={{ a: 'n!/n^n', n0: '1' }}
      fields={[
        { key: 'a', label: 'The nth term aₙ', placeholder: 'e.g. n/2^n', wide: true },
        { key: 'n0', label: 'Start at n =', placeholder: '1' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Use n for the index; n! for factorial; (-1)^n for alternating signs."
      resultLabel={(a) => VERDICT[a.verdict] || a.verdict}
      renderResult={(a) => (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={a.series} /></div>
          <p className="text-sm"><strong>{VERDICT[a.verdict]}</strong>{a.by ? <> by the {a.by}.</> : '.'}{a.sum && <> Sum: <InlineMath math={a.sum} />.</>}</p>
          {a.sums.length > 0 && <p className="text-sm font-mono">{a.sums.map((s) => `S${s.N} ≈ ${Number(s.S.toPrecision(8))}`).join(' · ')}</p>}
        </div>
      )}
    />
  );
}
