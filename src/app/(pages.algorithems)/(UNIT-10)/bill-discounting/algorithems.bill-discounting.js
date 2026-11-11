'use client';
// The live bill discounting calculator. The maths is in src/app/utils/engines/bill-discounting.js.
import React from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SymbolicCalculator from '@/app/components/method/SymbolicCalculator';
import { solve } from '@/app/utils/engines/bill-discounting';

const EXAMPLES = [
  {
    label: "₹7,300, 10%, 73 days",
    input: {
      mode: "days",
      face: "7300",
      rate: "10",
      days: "73"
    }
  },
  {
    label: "Drawn 15 Jan, 4 months",
    input: {
      mode: "dates",
      face: "5050",
      rate: "8",
      drawn: "2026-01-15",
      months: "4",
      discounted: "2026-03-10",
      grace: "yes"
    }
  },
  {
    label: "₹10,000, 12%, 146 days",
    input: {
      mode: "days",
      face: "10000",
      rate: "12",
      days: "146"
    }
  },
  {
    label: "₹2,040, 6%, 120 days",
    input: {
      mode: "days",
      face: "2040",
      rate: "6",
      days: "120"
    }
  }
];

export default function Calculator() {
  return (
    <SymbolicCalculator
      id="bill-discounting" unit={10} title="Bill Discounting Engine" button="Discount"
      start={{
  mode: "days",
  face: "7300",
  rate: "10",
  days: "73",
  drawn: "2026-01-15",
  months: "4",
  discounted: "2026-03-10",
  grace: "yes",
  currency: "INR"
}}
      fields={[
        { key: 'mode', label: 'Time given as', kind: 'choice', options: [{ value: 'days', label: "Days to run" }, { value: 'dates', label: "Dates" }] },
        { key: 'face', label: 'Face value F', placeholder: '7300' }, { key: 'rate', label: 'Rate % per year', placeholder: '10' },
        { key: 'days', label: 'Days still to run', placeholder: '73', show: (v) => v.mode === 'days' },
        { key: 'drawn', label: 'Date drawn', kind: 'date', show: (v) => v.mode === 'dates' }, { key: 'months', label: 'Term (months)', placeholder: '4', show: (v) => v.mode === 'dates' },
        { key: 'discounted', label: 'Date discounted', kind: 'date', show: (v) => v.mode === 'dates' },
        { key: 'grace', label: 'Days of grace', kind: 'choice', options: [{ value: 'yes', label: "Add 3 days" }, { value: 'no', label: "None" }], show: (v) => v.mode === 'dates' },
      ]}
      examples={EXAMPLES} solve={solve}
      hint={"A 365-day year; dates as on the bill."}
      resultLabel="Discounts"
      renderResult={(a) => (<div className="space-y-1 min-w-0 font-mono text-sm"><p>Banker’s discount: <strong>{a.bd}</strong></p><p>True discount: <strong>{a.td}</strong></p><p>Banker’s gain: <strong>{a.bg}</strong></p><p>The bank pays: <strong>{a.paid}</strong> (present worth {a.pw})</p></div>)}
    />
  );
}
