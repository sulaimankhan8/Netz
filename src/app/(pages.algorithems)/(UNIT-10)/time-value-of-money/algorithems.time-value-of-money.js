'use client';
// The live time value of money calculator. The maths is in src/app/utils/engines/tvm.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import { solve } from '@/app/utils/engines/tvm';

const EXAMPLES = [
  {
    label: "PV of ₹10,000 a year, 5 years, 8%",
    input: {
      mode: "pva",
      pmt: "10000",
      rate: "8",
      n: "5",
      freq: "1",
      due: "no"
    }
  },
  {
    label: "FV of ₹2,000 a month, 10 years, 12%",
    input: {
      mode: "fva",
      pmt: "2000",
      rate: "12",
      n: "10",
      freq: "12",
      due: "no"
    }
  },
  {
    label: "annuity due",
    input: {
      mode: "pva",
      pmt: "10000",
      rate: "8",
      n: "5",
      freq: "1",
      due: "yes"
    }
  },
  {
    label: "perpetuity ₹5,000 at 10%",
    input: {
      mode: "perpetuity",
      pmt: "5000",
      rate: "10",
      freq: "1",
      growth: ""
    }
  },
  {
    label: "sinking fund for ₹1 lakh in 5 years",
    input: {
      mode: "sinking",
      fv: "100000",
      rate: "8",
      n: "5",
      freq: "1"
    }
  },
  {
    label: "bond: 10% coupon, 8% yield, 5 years",
    input: {
      mode: "bond",
      face: "1000",
      coupon: "10",
      rate: "8",
      n: "5",
      freq: "1"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="tvm" unit={10} title="Time Value Engine" button="Calculate"
      start={{
  mode: "pva",
  pmt: "10000",
  rate: "8",
  n: "5",
  freq: "1",
  due: "no",
  fv: "100000",
  growth: "",
  face: "1000",
  coupon: "10"
}}
      fields={[
        { key: 'mode', label: 'Find', kind: 'select', options: [['pva', 'Present value of an annuity'], ['fva', 'Future value of an annuity'], ['perpetuity', 'Perpetuity'], ['sinking', 'Sinking fund payment'], ['bond', 'Bond price']].map(([value, label]) => ({ value, label })) },
        { key: 'pmt', label: 'Payment per period', show: (v) => ['pva', 'fva', 'perpetuity'].includes(v.mode) },
        { key: 'fv', label: 'Target amount', show: (v) => v.mode === 'sinking' },
        { key: 'face', label: 'Face value', show: (v) => v.mode === 'bond' }, { key: 'coupon', label: 'Coupon rate (% a year)', show: (v) => v.mode === 'bond' },
        { key: 'rate', label: 'Interest rate / yield (% a year)' },
        { key: 'n', label: 'Years', show: (v) => v.mode !== 'perpetuity' },
        { key: 'growth', label: 'Growth rate (% a year, optional)', show: (v) => v.mode === 'perpetuity' },
        { key: 'freq', label: 'Payments per year', kind: 'select', options: [{ value: '1', label: 'Yearly' }, { value: '2', label: 'Half-yearly' }, { value: '4', label: 'Quarterly' }, { value: '12', label: 'Monthly' }] },
        { key: 'due', label: 'Payments at', kind: 'choice', options: [{ value: 'no', label: 'End of each period' }, { value: 'yes', label: 'Start (annuity due)' }], show: (v) => ['pva', 'fva'].includes(v.mode) },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="The rate per period is the yearly rate ÷ payments per year."
      resultLabel="Result"
      renderResult={(a) => <p className="text-2xl font-black font-mono">{a.answer}</p>}
      renderSteps={(a) => a.rows.length > 0 && <StepTable columns={a.columns} rows={a.rows} />}
    />
  );
}
