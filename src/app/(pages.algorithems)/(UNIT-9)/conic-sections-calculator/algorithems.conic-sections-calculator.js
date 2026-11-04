'use client';
// The live conic sections calculator. The maths is in src/app/utils/engines/conics.js.
import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import CoordPlot from '@/app/components/method/CoordPlot';
import { solve } from '@/app/utils/engines/conics';

const EXAMPLES = [
  { label: 'y² = 12x', input: { eq: 'y^2 = 12x' } },
  { label: 'x²/25 + y²/9 = 1', input: { eq: 'x^2/25 + y^2/9 = 1' } },
  { label: 'x²/16 − y²/9 = 1', input: { eq: 'x^2/16 - y^2/9 = 1' } },
  { label: '9x² + 4y² − 18x + 16y − 11 = 0', input: { eq: '9x^2 + 4y^2 - 18x + 16y - 11 = 0' } },
];

function graph(a) {
  const segments = a.branches.flatMap((b) => b.slice(1).map((p, i) => [b[i], p]));
  const all = [...a.branches.flat(), ...a.points];
  const xs = all.map((p) => p.x), ys = all.map((p) => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * 0.6 + 0.5;
  return { segments, view: { x0: cx - span, x1: cx + span, y0: cy - span / 1.25, y1: cy + span / 1.25 } };
}

export default function ConicCalculator() {
  return (
    <SymbolicCalculator
      id="conics" unit={9} title="Conic Sections Engine" button="Analyse"
      start={{ eq: '4x^2 + 9y^2 = 36' }}
      fields={[{ key: 'eq', label: 'Equation in x and y', placeholder: 'e.g. x^2/16 - y^2/9 = 1', wide: true }]}
      examples={EXAMPLES} solve={solve}
      hint="Any parabola, ellipse or hyperbola with axes parallel to x and y (no xy term). Fractions like x^2/25 are fine."
      resultLabel={(a) => a.type[0].toUpperCase() + a.type.slice(1)}
      renderResult={(a) => {
        const g = graph(a);
        return (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
            <div className="space-y-2 min-w-0">
              <div className="overflow-x-auto text-lg"><BlockMath math={a.standard} /></div>
              <table className="w-full text-sm text-black dark:text-white">
                <tbody>
                  {a.facts.map(([k, v]) => (
                    <tr key={k} className="border-b border-black/10 dark:border-neutral-700 last:border-0">
                      <td className="py-1.5 pr-3 text-neutral-700 dark:text-neutral-300">{k}</td>
                      <td className="py-1.5 text-right"><InlineMath math={v} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">S marks a focus; the red lines are the {a.type === 'hyperbola' ? 'asymptotes' : a.type === 'parabola' ? 'directrix' : 'directrices'}.</p>
            </div>
            <div className="flex justify-center"><CoordPlot segments={g.segments} points={a.points} lines={a.lines} view={g.view} /></div>
          </div>
        );
      }}
    />
  );
}
