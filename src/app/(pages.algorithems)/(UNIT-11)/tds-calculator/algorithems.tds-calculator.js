'use client';
// The live TDS calculator. The maths is in src/app/utils/engines/tds.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { StepTable } from '@/app/components/method';
import RatesBadge from '@/app/components/method/RatesBadge';
import { solve } from '@/app/utils/engines/tds';

const EXAMPLES = [
  {
    label: "₹1 lakh professional fee",
    input: {
      amount: "100000",
      section: "194J-prof",
      rate: "",
      pan: "yes",
      yearTotal: ""
    }
  },
  {
    label: "contract ₹25,000 (below limit)",
    input: {
      amount: "25000",
      section: "194C-ind",
      rate: "",
      pan: "yes",
      yearTotal: ""
    }
  },
  {
    label: "no PAN",
    input: {
      amount: "100000",
      section: "194J-prof",
      rate: "",
      pan: "no",
      yearTotal: ""
    }
  },
  {
    label: "my own rate 5%",
    input: {
      amount: "200000",
      section: "custom",
      rate: "5",
      pan: "yes",
      yearTotal: ""
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="tds" unit={11} title="TDS Engine" button="Work Out TDS"
      start={{
  amount: "100000",
  section: "194J-prof",
  rate: "",
  pan: "yes",
  yearTotal: ""
}}
      fields={[
        { key: 'section', label: 'Section (or type your own rate)', kind: 'select', options: [{ value: 'custom', label: "My own rate" }, { value: '194J-prof', label: "194J professional fees (10%)" }, { value: '194J-tech', label: "194J technical services (2%)" }, { value: '194C-ind', label: "194C contractor, individual (1%)" }, { value: '194C-oth', label: "194C contractor, others (2%)" }, { value: '194I-land', label: "194I rent of land / building (10%)" }, { value: '194I-plant', label: "194I rent of machinery (2%)" }, { value: '194H', label: "194H commission (2%)" }, { value: '194A-bank', label: "194A bank interest (10%)" }, { value: '194A-senior', label: "194A bank interest, senior (10%)" }], wide: true },
        { key: 'amount', label: 'Payment (₹)' }, { key: 'rate', label: 'Rate % (blank = the section rate)' },
        { key: 'yearTotal', label: 'Total paid in the period (₹, for the limit)', show: (v) => v.section !== 'custom' },
        { key: 'pan', label: 'Receiver has a PAN?', kind: 'choice', options: [{ value: 'yes', label: "Yes" }, { value: 'no', label: "No PAN" }] },
      ]}
      examples={EXAMPLES} solve={solve}
      hint="Always check the rate for your exact case."
      resultLabel="TDS"
      renderResult={(a) => <p className="text-xl sm:text-2xl font-black font-mono break-words">{a.answer}</p>}
      renderSteps={(a) => (<div className="space-y-4">{a.rows && a.rows.length > 0 && <StepTable columns={a.columns} rows={a.rows} />}<RatesBadge rule={a.rule} /></div>)}
    />
  );
}
