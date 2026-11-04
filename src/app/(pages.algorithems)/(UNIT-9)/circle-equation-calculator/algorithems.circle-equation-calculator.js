'use client';
// The live circle equation calculator. The maths is in src/app/utils/engines/circles.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/circles';

const FROM = [{ value: 'centre', label: 'Centre & radius' }, { value: 'general', label: 'Equation' }, { value: 'three', label: 'Three points' }, { value: 'diameter', label: 'Diameter ends' }];
const EXAMPLES = [
  { label: 'x² + y² − 4x + 6y − 12 = 0, tangent at (5, 1)', input: { from: 'general', eq: 'x^2 + y^2 - 4x + 6y - 12 = 0', px: '5', py: '1' } },
  { label: 'through (0,0), (4,0), (0,6)', input: { from: 'three', x1: '0', y1: '0', x2: '4', y2: '0', x3: '0', y3: '6', px: '', py: '' } },
  { label: 'diameter (−2, 3) to (4, −5)', input: { from: 'diameter', x1: '-2', y1: '3', x2: '4', y2: '-5', px: '', py: '' } },
];

/** The circle as short segments, the centre, P, and the tangent at P; equal scales so it looks round. */
function graph(a) {
  const segs = [];
  for (let i = 0; i < 96; i++) {
    const t0 = (i / 96) * 2 * Math.PI, t1 = ((i + 1) / 96) * 2 * Math.PI;
    segs.push([{ x: a.h + a.r * Math.cos(t0), y: a.k + a.r * Math.sin(t0) }, { x: a.h + a.r * Math.cos(t1), y: a.k + a.r * Math.sin(t1) }]);
  }
  const pts = [{ x: a.h, y: a.k, label: 'C' }];
  if (a.point) pts.push({ x: a.point.x, y: a.point.y, label: 'P' });
  let span = a.r * 1.3;
  if (a.point) span = Math.max(span, Math.abs(a.point.x - a.h) * 1.15, Math.abs(a.point.y - a.k) * 1.15);
  const lines = a.point?.tangent ? [{ a: a.point.x + a.g, b: a.point.y + a.f, c: a.g * a.point.x + a.f * a.point.y + a.c }] : [];
  return { segs, pts, lines, view: { x0: a.h - span, x1: a.h + span, y0: a.k - span / 1.25, y1: a.k + span / 1.25 } };
}

export default function CircleCalculator() {
  return (
    <SymbolicCalculator
      id="circles" unit={9} title="Circle Engine" button="Find the Circle"
      start={{ from: 'centre', h: '2', k: '-3', r: '5', eq: '', x1: '', y1: '', x2: '', y2: '', x3: '', y3: '', px: '', py: '' }}
      fields={[
        { key: 'from', label: 'Given', kind: 'choice', options: FROM },
        { key: 'h', label: 'Centre h', show: (v) => v.from === 'centre' },
        { key: 'k', label: 'Centre k', show: (v) => v.from === 'centre' },
        { key: 'r', label: 'Radius r', show: (v) => v.from === 'centre' },
        { key: 'eq', label: 'Equation', placeholder: 'x^2 + y^2 - 4x + 6y - 12 = 0', show: (v) => v.from === 'general', wide: true },
        { key: 'x1', label: 'x₁', show: (v) => v.from === 'three' || v.from === 'diameter' },
        { key: 'y1', label: 'y₁', show: (v) => v.from === 'three' || v.from === 'diameter' },
        { key: 'x2', label: 'x₂', show: (v) => v.from === 'three' || v.from === 'diameter' },
        { key: 'y2', label: 'y₂', show: (v) => v.from === 'three' || v.from === 'diameter' },
        { key: 'x3', label: 'x₃', show: (v) => v.from === 'three' },
        { key: 'y3', label: 'y₃', show: (v) => v.from === 'three' },
        { key: 'px', label: 'Point P: x (optional)' },
        { key: 'py', label: 'Point P: y (optional)' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Add a point P to see whether it is inside, on or outside, with the tangent (or tangent length)."
      resultLabel="The circle"
      renderResult={(a) => {
        const g = graph(a);
        return (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
            <div className="space-y-2 min-w-0">
              <div className="overflow-x-auto"><BlockMath math={a.standard} /></div>
              <div className="overflow-x-auto"><BlockMath math={a.general} /></div>
              <div className="overflow-x-auto"><BlockMath math={`\\text{Centre } ${a.centreTex}, \\quad r = ${a.radiusTex}`} /></div>
              {a.point && <p className="text-sm font-bold text-black dark:text-white">P is {a.point.where} the circle{a.point.where === 'on' ? '' : '.'}</p>}
              {a.point?.tangent && <div className="overflow-x-auto"><BlockMath math={`\\text{Tangent at P: } ${a.point.tangent}`} /></div>}
            </div>
            <div className="flex justify-center"><CoordPlot segments={g.segs} points={g.pts} lines={g.lines} view={g.view} /></div>
          </div>
        );
      }}
    />
  );
}
