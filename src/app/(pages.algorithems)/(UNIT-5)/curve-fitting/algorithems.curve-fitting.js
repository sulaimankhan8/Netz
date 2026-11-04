'use client';
// The live curve fitting calculator. The maths is in src/app/utils/engines/curve-fitting.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method/StepTable';
import CoordPlot from '@/app/components/method/CoordPlot';
import { dataView } from '@/app/components/method/plotView';
import { solve } from '@/app/utils/engines/curve-fitting';

const MODELS = [{ value: 'exponential', label: 'y = a e^(bx)' }, { value: 'base', label: 'y = a·bˣ' }, { value: 'power', label: 'y = a·xᵇ' }, { value: 'polynomial', label: 'polynomial' }];
const EXAMPLES = [
  { label: 'growth: y = a·bˣ', input: { model: 'base', x: '1, 2, 3, 4, 5', y: '6, 12, 24, 48, 96' } },
  { label: 'power: y = a·xᵇ', input: { model: 'power', x: '1, 2, 3, 4, 5', y: '1.2, 4.6, 10.4, 18.8, 30' } },
  { label: 'cubic', input: { model: 'polynomial', degree: '3', x: '-2, -1, 0, 1, 2, 3', y: '-7, 0, 1, 2, 9, 28' } },
];

export default function CurveFittingCalculator() {
  return (
    <SymbolicCalculator
      id="curve-fitting" unit={5} title="Curve Fitting Engine" button="Fit the Curve"
      start={{ model: 'exponential', x: '0, 1, 2, 3, 4', y: '2, 5.4, 14.8, 40.2, 109.2', degree: '2', at: '' }}
      fields={[
        { key: 'model', label: 'Curve', kind: 'choice', options: MODELS },
        { key: 'x', label: 'x values', placeholder: 'e.g. 0, 1, 2, 3' },
        { key: 'y', label: 'y values', placeholder: 'e.g. 2, 5.4, 14.8, 40.2' },
        { key: 'degree', label: 'Degree', kind: 'select', options: [{ value: '2', label: '2 (parabola)' }, { value: '3', label: '3 (cubic)' }], show: (v) => v.model === 'polynomial' },
        { key: 'at', label: 'Estimate y at x = (optional)' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="The log fits need every y positive (and every x positive for y = a·xᵇ)."
      resultLabel="Fitted curve"
      renderResult={(a) => (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
          <div className="space-y-2 min-w-0">
            <div className="overflow-x-auto text-lg"><BlockMath math={a.equation} /></div>
            {a.estimate && <p className="text-sm font-mono">At x = {a.estimate.x}: y ≈ {Number(a.estimate.y.toFixed(4))}</p>}
            <p className="text-sm font-mono">Sum of squared errors: {Number(a.sse.toPrecision(4))}</p>
          </div>
          <div className="flex justify-center"><CoordPlot points={a.points.map((p) => ({ ...p, label: null }))} view={dataView(a.points)} fn={a.fAt} /></div>
        </div>
      )}
      renderSteps={(a) => <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
