'use client';
// The live UK income tax calculator. The maths is in src/app/utils/engines/uk-income-tax.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import RatesBadge from '@/app/components/method/RatesBadge';
import { solve } from '@/app/utils/engines/uk-income-tax';

const EXAMPLES = [
  {
    label: "£45,000 with 5% pension",
    input: {
      salary: "45000",
      region: "ruk",
      year: "2026",
      pension: "5"
    }
  },
  {
    label: "£30,000",
    input: {
      salary: "30000",
      region: "ruk",
      year: "2026",
      pension: ""
    }
  },
  {
    label: "£110,000 (allowance tapered)",
    input: {
      salary: "110000",
      region: "ruk",
      year: "2026",
      pension: ""
    }
  },
  {
    label: "£45,000 in Scotland",
    input: {
      salary: "45000",
      region: "scotland",
      year: "2026",
      pension: "5"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="uk-income-tax" unit={11} title="UK Tax Engine" button="Work Out Take-Home"
      start={{
  salary: "45000",
  region: "ruk",
  year: "2026",
  pension: "5"
}}
      fields={[
        { key: 'region', label: 'Where you live', kind: 'choice', options: [{ value: 'ruk', label: "England, Wales, NI" }, { value: 'scotland', label: "Scotland" }] },
        { key: 'year', label: 'Tax year', kind: 'select', options: [{ value: '2026', label: "2026/27" }, { value: '2025', label: "2025/26" }] },
        { key: 'salary', label: 'Salary (£ a year)' }, { key: 'pension', label: 'Pension, salary sacrifice (%)' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Assumes the standard 1257L tax code."
      resultLabel="Take-home pay"
      renderResult={(a) => <p className="text-xl sm:text-2xl font-black font-mono break-words">{a.answer}</p>}
      renderSteps={(a) => (<div className="space-y-4">{a.rows && a.rows.length > 0 && <StepTable columns={a.columns} rows={a.rows} />}<RatesBadge rule={a.rule} /></div>)}
    />
  );
}
