'use client';
// The live Lagrange multipliers calculator. The maths is in src/app/utils/engines/lagrange-multipliers.js.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import ContourPlot from '@/app/components/method/ContourPlot';
import { solve } from '@/app/utils/engines/lagrange-multipliers';

const EXAMPLES = [
  { label: 'x + y on x² + y² = 1', input: { f: 'x + y', g: 'x^2 + y^2 = 1' } },
  { label: 'xy on x + y = 10', input: { f: 'xy', g: 'x + y = 10' } },
  { label: 'x² + y² on x + 2y = 5', input: { f: 'x^2 + y^2', g: 'x + 2y = 5' } },
  { label: 'xyz on x + y + z = 3', input: { f: 'xyz', g: 'x + y + z = 3' } },
  { label: 'x² + y² + z² on xyz = 8', input: { f: 'x^2 + y^2 + z^2', g: 'xyz = 8' } },
];
const LABEL = { max: 'largest', min: 'smallest', other: '', same: '' };

export default function LagrangeCalculator() {
  return (
    <SymbolicCalculator
      id="lagrange-multipliers" unit={6} title="Lagrange Engine" button="Solve"
      start={{ f: 'x + y', g: 'x^2 + y^2 = 1' }}
      fields={[
        { key: 'f', label: 'Function to maximise / minimise', placeholder: 'e.g. x y' },
        { key: 'g', label: 'Constraint', placeholder: 'e.g. x + y = 10' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Two or three variables. Write xy for x times y."
      resultLabel={(a) => `${a.cands.length} candidate point${a.cands.length === 1 ? '' : 's'}`}
      renderResult={(a) => (
        <div className="space-y-3 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={`f = ${a.f}, \\qquad ${a.phi} = 0`} /></div>
          <ul className="space-y-1 text-sm">
            {a.cands.map((c) => (
              <li key={c.tex.join()}>
                <InlineMath math={`(${a.vars.join(', ')}) = (${c.tex.join(', ')})`} />: <InlineMath math={`f = ${c.fTex}`} />
                {LABEL[c.kind] && <strong> ({LABEL[c.kind]})</strong>}
              </li>
            ))}
          </ul>
          {a.view && a.cands.length > 0 && (
            <ContourPlot f={a.fAt} curve={a.gAt} view={a.view} title="Level curves of f with the constraint" points={a.cands.map((c) => ({ x: c.values[0], y: c.values[1], kind: c.kind === 'max' ? 'max' : c.kind === 'min' ? 'min' : 'point' }))} />
          )}
        </div>
      )}
    />
  );
}
