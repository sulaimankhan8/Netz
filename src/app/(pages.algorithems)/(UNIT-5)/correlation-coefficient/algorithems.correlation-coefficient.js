'use client';
// The live correlation calculator. The maths is in src/app/utils/engines/correlation.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method/StepTable';
import CoordPlot from '@/app/components/method/CoordPlot';
import { dataView } from '@/app/components/method/plotView';
import { solve } from '@/app/utils/engines/correlation';

const METHODS = [{ value: 'pearson', label: "Karl Pearson's r" }, { value: 'spearman', label: "Spearman's rank ρ" }];
const EXAMPLES = [
  { label: 'marks in two subjects', input: { method: 'pearson', x: '65, 66, 67, 67, 68, 69, 70, 72', y: '67, 68, 65, 68, 72, 72, 69, 71' } },
  { label: 'ranks with ties', input: { method: 'spearman', x: '68, 64, 75, 50, 64, 80, 75, 40, 55, 64', y: '62, 58, 68, 45, 81, 60, 68, 48, 50, 70' } },
  { label: 'perfect negative', input: { method: 'pearson', x: '1, 2, 3, 4', y: '8, 6, 4, 2' } },
];

export default function CorrelationCalculator() {
  return (
    <SymbolicCalculator
      id="correlation" unit={5} title="Correlation Engine" button="Find r"
      start={{ method: 'pearson', x: '1, 2, 3, 4, 5', y: '2, 4, 5, 4, 5' }}
      fields={[
        { key: 'method', label: 'Method', kind: 'choice', options: METHODS },
        { key: 'x', label: 'x values', placeholder: 'e.g. 1, 2, 3, 4, 5' },
        { key: 'y', label: 'y values', placeholder: 'e.g. 2, 4, 5, 4, 5' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Enter the pairs in the same order: the 1st x goes with the 1st y."
      resultLabel={(a) => (a.method === 'pearson' ? "Karl Pearson's coefficient" : "Spearman's rank correlation")}
      renderResult={(a) => (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
          <div className="space-y-2 min-w-0">
            <div className="overflow-x-auto text-lg"><BlockMath math={`${a.method === 'pearson' ? 'r' : '\\rho'} = ${a.rTex}`} /></div>
            <p className="font-bold text-black dark:text-white capitalize">{a.interpretation}</p>
          </div>
          <div className="flex justify-center"><CoordPlot points={a.points.map((p) => ({ ...p, label: null }))} view={dataView(a.points)} /></div>
        </div>
      )}
      renderSteps={(a) => <StepTable columns={a.table.columns} rows={a.table.rows} />}
    />
  );
}
