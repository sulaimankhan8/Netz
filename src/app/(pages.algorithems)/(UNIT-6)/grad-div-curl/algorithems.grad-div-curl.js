'use client';
// The live grad, div and curl calculator. The maths is in src/app/utils/engines/grad-div-curl.js.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/grad-div-curl';

const MODES = [{ value: 'grad', label: 'grad φ' }, { value: 'div', label: 'div F' }, { value: 'curl', label: 'curl F' }, { value: 'potential', label: 'Scalar potential' }];
const EXAMPLES = [
  { label: 'grad of x²y + yz³, directional', input: { mode: 'grad', phi: 'x^2 y + y z^3', point: '1, -1, 1', dir: '2, 1, -2' } },
  { label: 'unit normal to x² + y² − z = 1', input: { mode: 'grad', phi: 'x^2 + y^2 - z', point: '1, 1, 1', dir: '' } },
  { label: 'div of (x²y, yz, xz²)', input: { mode: 'div', P: 'x^2 y', Q: 'y z', R: 'x z^2', point: '1, 2, 3' } },
  { label: 'curl of (xy, yz, zx)', input: { mode: 'curl', P: 'x y', Q: 'y z', R: 'z x', point: '' } },
  { label: 'potential of (2xy + z³, x², 3xz²)', input: { mode: 'potential', P: '2x y + z^3', Q: 'x^2', R: '3x z^2' } },
];

export default function GradDivCurlCalculator() {
  return (
    <SymbolicCalculator
      id="grad-div-curl" unit={6} title="Vector Calculus Engine" button="Compute"
      start={{ mode: 'grad', phi: 'x^2 y + y z^3', P: 'x^2 y', Q: 'y z', R: 'x z^2', point: '1, -1, 1', dir: '2, 1, -2' }}
      fields={[
        { key: 'mode', label: 'Find', kind: 'choice', options: MODES },
        { key: 'phi', label: 'φ(x, y, z)', placeholder: 'e.g. x^2 y z', wide: true, show: (v) => v.mode === 'grad' },
        { key: 'P', label: 'P (the i part)', placeholder: 'e.g. x^2 y', show: (v) => v.mode !== 'grad' },
        { key: 'Q', label: 'Q (the j part)', placeholder: 'e.g. y z', show: (v) => v.mode !== 'grad' },
        { key: 'R', label: 'R (the k part)', placeholder: 'e.g. x z^2', show: (v) => v.mode !== 'grad' },
        { key: 'point', label: 'At the point (optional)', placeholder: 'e.g. 1, -1, 1', show: (v) => v.mode !== 'potential' },
        { key: 'dir', label: 'Direction (optional)', placeholder: 'e.g. 2, 1, -2', show: (v) => v.mode === 'grad' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Write xy for x times y. F = P i + Q j + R k."
      resultLabel="Result"
      renderResult={(a) => (
        <div className="space-y-1 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={a.phi ? `\\phi = ${a.phi}` : `\\vec F = ${a.F}`} /></div>
          <div className="overflow-x-auto text-lg"><BlockMath math={a.result} /></div>
          {a.atPoint && <div className="overflow-x-auto"><BlockMath math={a.atPoint} /></div>}
          {a.directional && <div className="overflow-x-auto"><BlockMath math={`D_{\\hat a}\\phi = ${a.directional}`} /></div>}
        </div>
      )}
    />
  );
}
