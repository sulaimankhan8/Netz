'use client';
// The live HRA exemption calculator. The maths is in src/app/utils/engines/hra-exemption.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import RatesBadge from '@/app/components/method/RatesBadge';
import { solve } from '@/app/utils/engines/hra-exemption';

const EXAMPLES = [
  {
    label: "₹50k basic, ₹20k HRA, ₹18k rent, metro",
    input: {
      basic: "50000",
      da: "",
      hra: "20000",
      rent: "18000",
      metro: "yes",
      period: "month"
    }
  },
  {
    label: "non-metro",
    input: {
      basic: "40000",
      da: "5000",
      hra: "16000",
      rent: "20000",
      metro: "no",
      period: "month"
    }
  },
  {
    label: "low rent",
    input: {
      basic: "60000",
      da: "",
      hra: "24000",
      rent: "8000",
      metro: "yes",
      period: "month"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="hra-exemption" unit={11} title="HRA Engine" button="Find the Exemption"
      start={{
  basic: "50000",
  da: "",
  hra: "20000",
  rent: "18000",
  metro: "yes",
  period: "month"
}}
      fields={[
        { key: 'period', label: 'Amounts are', kind: 'choice', options: [{ value: 'month', label: "Per month" }, { value: 'year', label: "Per year" }] },
        { key: 'metro', label: 'City', kind: 'choice', options: [{ value: 'yes', label: "Delhi, Mumbai, Kolkata, Chennai" }, { value: 'no', label: "Other city" }] },
        { key: 'basic', label: 'Basic salary (₹)' }, { key: 'da', label: 'DA (₹, optional)' },
        { key: 'hra', label: 'HRA received (₹)' }, { key: 'rent', label: 'Rent paid (₹)' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Salary here means basic + DA."
      resultLabel="Exempt HRA"
      renderResult={(a) => <p className="text-xl sm:text-2xl font-black font-mono break-words">{a.answer}</p>}
      renderSteps={(a) => (<div className="space-y-4">{a.rows && a.rows.length > 0 && <StepTable columns={a.columns} rows={a.rows} />}<RatesBadge rule={a.rule} /></div>)}
    />
  );
}
