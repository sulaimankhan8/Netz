'use client';
// The live QR decomposition calculator. The maths is in src/app/utils/engines/qr.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MatrixMethodCalculator from '@/app/components/method/MatrixMethodCalculator';
import { StepTable } from '@/app/components/method/StepTable';
import { solve } from '@/app/utils/engines/qr';

const EXAMPLES = [
  { label: '[[12,−51,4],[6,167,−68],[−4,24,−41]]', cells: [[12, -51, 4], [6, 167, -68], [-4, 24, -41]], extra: { mode: 'decompose' } },
  { label: '3 × 2 matrix', cells: [[3, -6], [4, -8], [0, 1]], extra: { mode: 'decompose' } },
  { label: 'eigenvalues by QR iteration', cells: [[4, 1, 0], [1, 3, 1], [0, 1, 2]], extra: { mode: 'eigen' } },
];

export default function QrCalculator() {
  return (
    <MatrixMethodCalculator
      id="qr" unit={4} title="QR Engine" button="Go" min={2} max={5}
      start={[['1', '1', '0'], ['1', '0', '1'], ['0', '1', '1']]} examples={EXAMPLES} solve={solve}
      extraFields={[{ key: 'mode', label: 'Find', kind: 'choice', options: [{ value: 'decompose', label: 'A = QR (Gram–Schmidt)' }, { value: 'eigen', label: 'Eigenvalues (QR algorithm)' }] }]}
      extraStart={{ mode: 'decompose' }}
      resultLabel="Result"
      renderResult={(a) => (a.mode === 'decompose' ? (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={`Q = ${a.QTex}`} /></div>
          <div className="overflow-x-auto"><BlockMath math={`R = ${a.RTex}`} /></div>
        </div>
      ) : (
        <div className="space-y-2 min-w-0">
          <div className="overflow-x-auto text-lg"><BlockMath math={`\\lambda = ${a.eigenvalues.map((v) => Number(v.toPrecision(8))).join(', \\ ')}`} /></div>
          <p className="text-sm font-mono">{a.converged ? `Converged after ${a.iterations} iterations.` : 'Did not fully converge.'}</p>
        </div>
      ))}
      renderSteps={(a) => (a.table ? <StepTable columns={a.table.columns} rows={a.table.rows} /> : null)}
    />
  );
}
