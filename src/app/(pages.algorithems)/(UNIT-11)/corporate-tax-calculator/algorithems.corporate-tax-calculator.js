'use client';
// The live corporate tax calculator. The maths is in src/app/utils/engines/corporate-tax-calculator.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import RatesBadge from '@/app/components/method/RatesBadge';
import { solve } from '@/app/utils/engines/corporate-tax-calculator';

const EXAMPLES = [
  {
    label: "India, ₹5 crore, 115BAA",
    input: {
      country: "in",
      income: "50000000",
      regime: "115BAA"
    }
  },
  {
    label: "India, normal with MAT",
    input: {
      country: "in",
      income: "200000000",
      regime: "normal",
      turnover: "3000000000",
      bookProfit: "400000000"
    }
  },
  {
    label: "UK, £100,000 (marginal relief)",
    input: {
      country: "uk",
      income: "100000",
      associates: "0"
    }
  },
  {
    label: "UK, £300,000",
    input: {
      country: "uk",
      income: "300000",
      associates: "0"
    }
  },
  {
    label: "US, $1m with 6% state",
    input: {
      country: "us",
      income: "1000000",
      stateRate: "6"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="corporate-tax-calculator" unit={11} title="Corporate Tax Engine" button="Calculate"
      start={{
  country: "in",
  income: "50000000",
  regime: "115BAA",
  turnover: "",
  bookProfit: "",
  associates: "0",
  stateRate: "",
  date: ""
}}
      fields={[
        { key: 'country', label: 'Country', kind: 'choice', options: [{ value: 'in', label: "India" }, { value: 'uk', label: "UK" }, { value: 'us', label: "US" }] },
        { key: 'income', label: 'Taxable profit', placeholder: '50000000' },
        { key: 'regime', label: 'Regime', kind: 'select', options: [{ value: '115BAA', label: "Section 115BAA (22%)" }, { value: '115BAB', label: "Section 115BAB (15%)" }, { value: 'normal', label: "Normal provisions" }], show: (v) => v.country === 'in' },
        { key: 'turnover', label: 'Turnover (for the 25% rate)', placeholder: '3000000000', show: (v) => v.country === 'in' && v.regime === 'normal' },
        { key: 'bookProfit', label: 'Book profit (for MAT, optional)', placeholder: '', show: (v) => v.country === 'in' && v.regime === 'normal' },
        { key: 'associates', label: 'Associated companies', placeholder: '0', show: (v) => v.country === 'uk' },
        { key: 'stateRate', label: 'State rate % (optional)', placeholder: '6', show: (v) => v.country === 'us' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"Profits in the local currency (₹, £ or $)."}
      resultLabel="Tax payable"
      renderResult={(a) => <p className="font-mono text-lg">Tax payable <strong>{a.total}</strong> (effective rate {a.effective}%)</p>}
      renderSteps={(a) => <RatesBadge rule={a.rule} />}
    />
  );
}
