'use client';
// The live ANOVA calculator. The maths is in src/app/utils/engines/anova.js.
import React from 'react';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method/StepTable';
import { solve } from '@/app/utils/engines/anova';

const EXAMPLES = [
  { label: 'three fertilisers (one-way)', input: { kind: 'one', groups: '8, 10, 7, 14, 11; 7, 5, 10, 9, 9; 12, 9, 13, 12, 14' } },
  { label: 'five workers × three machines (two-way)', input: { kind: 'two', groups: '30, 26, 38; 24, 29, 28; 33, 24, 35; 36, 31, 30; 27, 35, 33' } },
];

export default function AnovaCalculator() {
  return (
    <SymbolicCalculator
      id="anova" unit={5} title="ANOVA Engine" button="Run ANOVA"
      start={{ kind: 'one', groups: '20, 23, 25, 22; 26, 28, 27, 30; 21, 19, 24, 20', alpha: '0.05' }}
      fields={[
        { key: 'kind', label: 'Design', kind: 'choice', options: [{ value: 'one', label: 'One-way' }, { value: 'two', label: 'Two-way (one value per cell)' }] },
        { key: 'groups', label: 'Data: groups (or rows) separated by ;', placeholder: 'e.g. 8, 10, 7; 7, 5, 10; 12, 9, 13', wide: true },
        { key: 'alpha', label: 'Significance level', kind: 'select', options: [{ value: '0.05', label: '5%' }, { value: '0.01', label: '1%' }, { value: '0.1', label: '10%' }] },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="One-way: each group's values, groups separated by semicolons. Two-way: each row's values (same count in every row)."
      resultLabel="ANOVA table"
      renderResult={(a) => (
        <div className="space-y-3 min-w-0">
          <StepTable columns={a.table.columns} rows={a.table.rows} />
          {a.tests.map((t) => (
            <p key={t.name} className="font-bold text-black dark:text-white">
              {a.kind === 'one' ? 'Treatments' : t.name[0].toUpperCase() + t.name.slice(1)}: F = {t.F.toFixed(4)} {t.reject ? '>' : '≤'} {t.crit} → {t.reject ? 'significant difference (reject H₀)' : 'no significant difference'} (p = {t.p.toFixed(4)})
            </p>
          ))}
        </div>
      )}
    />
  );
}
