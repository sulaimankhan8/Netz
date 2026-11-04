'use client';
// The live descriptive statistics calculator. The maths is in src/app/utils/engines/descriptive-statistics.js.
import React from 'react';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method/StepTable';
import { solve } from '@/app/utils/engines/descriptive-statistics';

const MODES = [{ value: 'raw', label: 'Raw data' }, { value: 'discrete', label: 'Frequency table' }, { value: 'grouped', label: 'Grouped (classes)' }];
const EXAMPLES = [
  { label: '2, 4, 4, 4, 5, 5, 7, 9', input: { mode: 'raw', data: '2, 4, 4, 4, 5, 5, 7, 9' } },
  { label: 'frequency table', input: { mode: 'discrete', x: '1, 2, 3, 4, 5', f: '3, 7, 12, 6, 2' } },
  { label: 'grouped 0–50', input: { mode: 'grouped', classes: '0-10, 10-20, 20-30, 30-40, 40-50', f: '5, 8, 15, 12, 10' } },
];
export const tableOf = (a) => (a.table ? <StepTable columns={a.table.columns} rows={a.table.rows} /> : null);

export default function DescriptiveCalculator() {
  return (
    <SymbolicCalculator
      id="descriptive-statistics" unit={5} title="Statistics Engine" button="Calculate"
      start={{ mode: 'raw', data: '12, 15, 11, 18, 15, 20, 15, 13', x: '', f: '', classes: '' }}
      fields={[
        { key: 'mode', label: 'Data type', kind: 'choice', options: MODES },
        { key: 'data', label: 'Data (commas)', placeholder: 'e.g. 12, 15, 11, 18', show: (v) => v.mode === 'raw', wide: true },
        { key: 'x', label: 'Values x', placeholder: 'e.g. 1, 2, 3, 4', show: (v) => v.mode === 'discrete' },
        { key: 'classes', label: 'Classes', placeholder: 'e.g. 0-10, 10-20, 20-30', show: (v) => v.mode === 'grouped' },
        { key: 'f', label: 'Frequencies f', placeholder: 'e.g. 3, 7, 12, 6', show: (v) => v.mode !== 'raw' },
      ]}
      examples={EXAMPLES} solve={solve}
      resultLabel="Summary"
      renderResult={(a) => (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-black dark:text-white">
            <tbody>
              {a.summary.map(([k, val]) => (
                <tr key={k} className="border-b border-black/10 dark:border-neutral-700 last:border-0">
                  <td className="py-1.5 pr-3 text-neutral-700 dark:text-neutral-300">{k}</td>
                  <td className="py-1.5 font-mono font-bold text-right">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      renderSteps={tableOf}
    />
  );
}
