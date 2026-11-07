'use client';
// The live DFT/FFT calculator. The maths is in src/app/utils/engines/dft-fft.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import ButterflyDiagram from '@/app/components/method/ButterflyDiagram';
import { solve } from '@/app/utils/engines/dft-fft';

const MODES = [{ value: 'fft', label: 'FFT (radix-2)' }, { value: 'dft', label: 'DFT' }, { value: 'idft', label: 'Inverse DFT' }];
const EXAMPLES = [
  { label: 'FFT of 1, 2, 3, 4', input: { mode: 'fft', x: '1, 2, 3, 4' } },
  { label: 'FFT of 8 points', input: { mode: 'fft', x: '1, 1, 1, 1, 0, 0, 0, 0' } },
  { label: 'DFT of 1, 0, -1, 0', input: { mode: 'dft', x: '1, 0, -1, 0' } },
  { label: 'DFT of 3 points', input: { mode: 'dft', x: '1, 2, 3' } },
  { label: 'IDFT of 10, -2+2i, -2, -2-2i', input: { mode: 'idft', x: '10, -2+2i, -2, -2-2i' } },
];

export default function DftFftCalculator() {
  return (
    <SymbolicCalculator
      id="dft-fft" unit={13} title="DFT / FFT Engine" button="Compute"
      start={{ mode: 'fft', x: '1, 2, 3, 4' }}
      fields={[
        { key: 'mode', label: 'Transform', kind: 'choice', options: MODES },
        { key: 'x', label: 'Values (comma separated)', placeholder: 'e.g. 1, 2, 3, 4', wide: true },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="The FFT needs 2, 4, 8 or 16 values. Complex values like 1-2i are fine."
      resultLabel={(a) => `${a.mode === 'idft' ? 'x(n)' : 'X(k)'}, N = ${a.N}`}
      renderResult={(a) => (
        <div className="space-y-3 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={`${a.mode === 'idft' ? 'x' : 'X'} = \\left(${a.X.join(',\\ ')}\\right)`} /></div>
          {a.fft && <ButterflyDiagram fft={a.fft} />}
        </div>
      )}
    />
  );
}
