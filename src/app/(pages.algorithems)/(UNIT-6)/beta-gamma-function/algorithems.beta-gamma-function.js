'use client';
// The live beta and gamma function calculator. The maths is in src/app/utils/engines/beta-gamma.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/beta-gamma';

const MODES = [
  { value: 'gamma', label: 'Γ(n)' }, { value: 'beta', label: 'B(m, n)' },
  { value: 'sincos', label: '∫ sinᵖθ cos^qθ, 0 to π/2' }, { value: 'xexp', label: '∫ xⁿ e^(−ax), 0 to ∞' },
];
const EXAMPLES = [
  { label: 'Γ(7/2)', input: { mode: 'gamma', n: '7/2' } },
  { label: 'Γ(−1/2)', input: { mode: 'gamma', n: '-1/2' } },
  { label: 'B(1/2, 1/2)', input: { mode: 'beta', m: '1/2', n: '1/2' } },
  { label: 'B(3, 5/2)', input: { mode: 'beta', m: '3', n: '5/2' } },
  { label: '∫ sin⁴θ cos²θ dθ', input: { mode: 'sincos', p: '4', q: '2' } },
  { label: '∫ √(sin θ) dθ', input: { mode: 'sincos', p: '1/2', q: '0' } },
  { label: '∫ x³ e^(−2x) dx', input: { mode: 'xexp', n: '3', a: '2' } },
];

export default function BetaGammaCalculator() {
  return (
    <SymbolicCalculator
      id="beta-gamma" unit={6} title="Beta & Gamma Engine" button="Evaluate"
      start={{ mode: 'gamma', n: '7/2', m: '3', p: '4', q: '2', a: '1' }}
      fields={[
        { key: 'mode', label: 'What to work out', kind: 'choice', options: MODES },
        { key: 'm', label: 'm', placeholder: 'e.g. 3', show: (v) => v.mode === 'beta' },
        { key: 'n', label: 'n', placeholder: 'e.g. 7/2', show: (v) => ['gamma', 'beta', 'xexp'].includes(v.mode) },
        { key: 'p', label: 'Power of sin θ (p)', placeholder: 'e.g. 4', show: (v) => v.mode === 'sincos' },
        { key: 'q', label: 'Power of cos θ (q)', placeholder: 'e.g. 2', show: (v) => v.mode === 'sincos' },
        { key: 'a', label: 'a in e^(−ax)', placeholder: '1', show: (v) => v.mode === 'xexp' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Fractions are fine: 7/2, -1/2. Whole and half-whole numbers give exact answers with √π."
      resultLabel="Value"
      renderResult={(a) => (
        <div className="space-y-1 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`${a.title} = ${a.resultTex}`} /></div>
          {!/^-?\d+$/.test(a.resultTex) && <p className="text-sm font-mono">≈ {Number(a.value.toPrecision(10))}</p>}
        </div>
      )}
    />
  );
}
