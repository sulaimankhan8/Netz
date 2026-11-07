'use client';
// The live two-variable maxima/minima calculator. The maths is in src/app/utils/engines/maxima-minima-2var.js.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import ContourPlot from '@/app/components/method/ContourPlot';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/maxima-minima-2var';

const EXAMPLES = [
  { label: 'x³ + y³ − 3xy', input: { f: 'x^3 + y^3 - 3xy' } },
  { label: 'x³ + y³ − 63(x + y) + 12xy', input: { f: 'x^3 + y^3 - 63(x + y) + 12xy' } },
  { label: 'x² + y² − 2x + 4y', input: { f: 'x^2 + y^2 - 2x + 4y' } },
  { label: 'x⁴ + y⁴ − 2(x − y)²', input: { f: 'x^4 + y^4 - 2(x - y)^2' } },
  { label: 'xy(3 − x − y)', input: { f: 'xy(3 - x - y)' } },
];
const M = ({ t }) => <InlineMath math={t} />;

export default function MaximaMinima2VarCalculator() {
  return (
    <SymbolicCalculator
      id="maxima-minima-2var" unit={6} title="Extrema Engine" button="Find Maxima & Minima"
      start={{ f: 'x^3 + y^3 - 3xy' }}
      fields={[{ key: 'f', label: 'f(x, y)', placeholder: 'e.g. x^3 + y^3 - 3xy', wide: true }]}
      examples={EXAMPLES} solve={solve}
      hint="Write xy for x times y. Critical points are searched for between −6 and 6."
      resultLabel={(a) => `${a.points.length} critical point${a.points.length === 1 ? '' : 's'}`}
      renderResult={(a) => (
        <div className="space-y-3 min-w-0">
          <div className="overflow-x-auto"><BlockMath math={`f = ${a.f}`} /></div>
          {a.points.length === 0 && <p className="text-sm">No critical points between −6 and 6.</p>}
          <ul className="space-y-1 text-sm">
            {a.points.map((p) => (
              <li key={`${p.x},${p.y}`}><strong>{p.nature}</strong> at <M t={`(${p.xTex}, ${p.yTex})`} />{p.kind !== 'saddle' && p.kind !== 'unknown' && <>, f = <M t={p.fTex} /></>}</li>
            ))}
          </ul>
          {a.points.length > 0 && (
            <ContourPlot f={a.fAt} view={a.view} title="Level curves of f" points={a.points.map((p) => ({ x: p.x, y: p.y, kind: p.kind }))} />
          )}
        </div>
      )}
      renderSteps={(a) => a.points.length > 0 && (
        <StepTable
          columns={[{ key: 'pt', label: 'Point', bold: true }, { key: 'r', label: 'r' }, { key: 's', label: 's' }, { key: 't', label: 't' }, { key: 'D', label: 'rt − s²' }, { key: 'n', label: 'Nature', highlight: true }]}
          rows={a.points.map((p) => ({ pt: <M t={`(${p.xTex}, ${p.yTex})`} />, r: <M t={p.rTex} />, s: <M t={p.sTex} />, t: <M t={p.tTex} />, D: <M t={p.DTex} />, n: p.nature }))}
        />
      )}
    />
  );
}
