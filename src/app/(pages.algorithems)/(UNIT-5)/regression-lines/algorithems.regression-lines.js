'use client';
// The live regression lines calculator. The maths is in src/app/utils/engines/regression.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method/StepTable';
import CoordPlot from '@/app/components/method/CoordPlot';
import { dataView } from '@/app/components/method/plotView';
import { solve } from '@/app/utils/engines/regression';

const EXAMPLES = [
  { label: 'height and weight', input: { x: '150, 152, 155, 157, 160, 163', y: '52, 55, 56, 59, 61, 64', atX: '158', atY: '' } },
  { label: 'sales and advertising', input: { x: '1, 2, 3, 4, 5, 6', y: '20, 23, 25, 30, 32, 35', atX: '7', atY: '' } },
];

export default function RegressionCalculator() {
  return (
    <SymbolicCalculator
      id="regression" unit={5} title="Regression Engine" button="Find the Lines"
      start={{ x: '1, 2, 3, 4, 5', y: '2, 4, 5, 4, 5', atX: '6', atY: '' }}
      fields={[
        { key: 'x', label: 'x values', placeholder: 'e.g. 1, 2, 3, 4, 5' },
        { key: 'y', label: 'y values', placeholder: 'e.g. 2, 4, 5, 4, 5' },
        { key: 'atX', label: 'Estimate y at x = (optional)' },
        { key: 'atY', label: 'Estimate x at y = (optional)' },
      ]}
      examples={EXAMPLES} solve={solve}
      resultLabel="Lines of regression"
      renderResult={(a) => (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
          <div className="space-y-2 min-w-0">
            <div className="overflow-x-auto"><BlockMath math={`\\text{y on x: } ${a.yOnX}`} /></div>
            <div className="overflow-x-auto"><BlockMath math={`\\text{x on y: } ${a.xOnY}`} /></div>
            <div className="overflow-x-auto"><BlockMath math={`b_{yx} = ${a.byx.toFixed(4)}, \\ b_{xy} = ${a.bxy.toFixed(4)}, \\ r = ${a.r.toFixed(4)}`} /></div>
            {a.estY && <p className="text-sm font-mono">At x = {a.estY.x}: y ≈ {Number(a.estY.y.toFixed(4))}</p>}
            {a.estX && <p className="text-sm font-mono">At y = {a.estX.y}: x ≈ {Number(a.estX.x.toFixed(4))}</p>}
            <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Blue: y on x. Red: x on y. They cross at (x̄, ȳ).</p>
          </div>
          <div className="flex justify-center">
            <CoordPlot points={a.points.map((p) => ({ ...p, label: null }))} view={dataView(a.points)} fn={(x) => a.ayx + a.byx * x} lines={[{ a: 1, b: -a.bxy, c: -a.axy }]} />
          </div>
        </div>
      )}
      renderSteps={(a) => <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
