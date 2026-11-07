'use client';
// The live harmonic analysis calculator. The maths is in src/app/utils/engines/harmonic-analysis.js.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/harmonic-analysis';

const EXAMPLES = [
  { label: 'Grewal: 6 values', input: { y: '1.98, 1.30, 1.05, 1.30, -0.88, -0.25', harmonics: '2' } },
  { label: '12 values (monthly)', input: { y: '1.80, 1.10, 0.30, 0.16, 0.50, 1.50, 2.16, 1.88, 1.25, 1.30, 1.76, 2.00', harmonics: '3' } },
  { label: '4 values', input: { y: '4, 8, 15, 7', harmonics: '2' } },
];

export default function HarmonicCalculator() {
  return (
    <SymbolicCalculator
      id="harmonic-analysis" unit={6} title="Harmonic Analysis Engine" button="Analyse"
      start={{ y: '1.98, 1.30, 1.05, 1.30, -0.88, -0.25', harmonics: '2' }}
      fields={[
        { key: 'y', label: 'Values of y over one period (equally spaced)', placeholder: 'e.g. 1.98, 1.30, 1.05, 1.30, -0.88, -0.25', wide: true },
        { key: 'harmonics', label: 'Harmonics', kind: 'select', options: ['1', '2', '3', '4'].map((v) => ({ value: v, label: v === '1' ? 'First only' : `Up to ${v}` })) },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Give one period's values, starting at θ = 0 and not repeating the last point (θ = 360°)."
      resultLabel="Fourier series from the table"
      renderResult={(a) => (
        <div className="space-y-1 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={a.series} /></div>
          <p className="text-sm">Amplitude of the first harmonic: <strong>{a.amplitude}</strong></p>
        </div>
      )}
      renderSteps={(a) => <StepTable columns={a.columns} rows={a.rows} />}
    />
  );
}
