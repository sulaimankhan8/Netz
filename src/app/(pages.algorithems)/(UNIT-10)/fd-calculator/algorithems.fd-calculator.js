'use client';
// The live FD calculator. The maths is in src/app/utils/engines/fd.js.
import React from 'react';
import SavingsCalculator from '@/app/components/method/SavingsCalculator';
import { solve, FD_FREQUENCIES } from '@/app/utils/engines/fd';

const START = { principal: '100000', rate: '7', years: '5', months: '', days: '', frequency: '4', payout: 'cumulative' };
const EXAMPLES = [
  { label: '₹1 lakh, 7%, 5 years', input: {} },
  { label: '₹50,000, 6.5%, 444 days', input: { principal: '50000', rate: '6.5', years: '', days: '444' } },
  { label: 'Monthly interest payout', input: { principal: '500000', rate: '7.25', years: '3', payout: 'monthly' } },
];

export default function FdCalculator() {
  return (
    <SavingsCalculator
      id="fd" title="FD Engine" start={START} examples={EXAMPLES}
      fields={[
        { key: 'payout', label: 'Interest', kind: 'choice', options: [{ value: 'cumulative', label: 'Added to the FD (cumulative)' }, { value: 'quarterly', label: 'Paid every quarter' }, { value: 'monthly', label: 'Paid every month' }] },
        { key: 'principal', label: 'Deposit amount' },
        { key: 'rate', label: 'Interest rate (% a year)' },
        { key: 'frequency', label: 'Compounded', kind: 'select', options: FD_FREQUENCIES.map((f) => ({ value: f.value, label: f.label })), show: (s) => s.payout === 'cumulative' },
        { key: 'years', label: 'Years', placeholder: '0' },
        { key: 'months', label: 'Months', placeholder: '0' },
        { key: 'days', label: 'Days', placeholder: '0' },
      ]}
      solve={(s, currency) => solve({ ...s, currency })}
    />
  );
}
