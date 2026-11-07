'use client';
// The live US income tax calculator. The maths is in src/app/utils/engines/us-income-tax.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import RatesBadge from '@/app/components/method/RatesBadge';
import { solve } from '@/app/utils/engines/us-income-tax';

const EXAMPLES = [
  {
    label: "$85,000 single, 5% state",
    input: {
      wages: "85000",
      status: "single",
      year: "2026",
      pretax: "5000",
      itemized: "",
      state: "5"
    }
  },
  {
    label: "$150,000 married jointly",
    input: {
      wages: "150000",
      status: "mfj",
      year: "2026",
      pretax: "10000",
      itemized: "",
      state: ""
    }
  },
  {
    label: "$250,000 single (extra Medicare)",
    input: {
      wages: "250000",
      status: "single",
      year: "2026",
      pretax: "",
      itemized: "",
      state: ""
    }
  },
  {
    label: "tax year 2025",
    input: {
      wages: "85000",
      status: "single",
      year: "2025",
      pretax: "5000",
      itemized: "",
      state: "5"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="us-income-tax" unit={11} title="US Tax Engine" button="Work Out Take-Home"
      start={{
  wages: "85000",
  status: "single",
  year: "2026",
  pretax: "5000",
  itemized: "",
  state: "5"
}}
      fields={[
        { key: 'status', label: 'Filing status', kind: 'select', options: [{ value: 'single', label: "Single" }, { value: 'mfj', label: "Married filing jointly" }, { value: 'hoh', label: "Head of household" }] },
        { key: 'year', label: 'Tax year', kind: 'select', options: [{ value: '2026', label: "2026" }, { value: '2025', label: "2025" }] },
        { key: 'wages', label: 'Wages ($ a year)' }, { key: 'pretax', label: 'Pre-tax 401(k), HSA … ($)' },
        { key: 'itemized', label: 'Itemised deductions ($, optional)' }, { key: 'state', label: 'State tax rate % (optional)' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Federal brackets apply to taxable income, after the deduction."
      resultLabel="Take-home pay"
      renderResult={(a) => <p className="text-xl sm:text-2xl font-black font-mono break-words">{a.answer}</p>}
      renderSteps={(a) => (<div className="space-y-4">{a.rows && a.rows.length > 0 && <StepTable columns={a.columns} rows={a.rows} />}<RatesBadge rule={a.rule} /></div>)}
    />
  );
}
