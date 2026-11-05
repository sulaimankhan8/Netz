'use client';
// The live RD calculator. The maths is in src/app/utils/engines/rd.js.
import React from 'react';
import SavingsCalculator from '@/app/components/method/SavingsCalculator';
import { solve } from '@/app/utils/engines/rd';

const START = { instalment: '5000', rate: '6.8', years: '5', months: '' };
const EXAMPLES = [
  { label: '₹5,000 a month, 5 years', input: {} },
  { label: '₹1,000 a month, 1 year at 7%', input: { instalment: '1000', rate: '7', years: '1' } },
  { label: '₹2,500 a month, 27 months', input: { instalment: '2500', rate: '7.1', years: '', months: '27' } },
];

export default function RdCalculator() {
  return (
    <SavingsCalculator
      id="rd" title="RD Engine" start={START} examples={EXAMPLES}
      fields={[
        { key: 'instalment', label: 'Monthly instalment' },
        { key: 'rate', label: 'Interest rate (% a year)' },
        { key: 'years', label: 'Years', placeholder: '0' },
        { key: 'months', label: 'Months', placeholder: '0' },
      ]}
      solve={(s, currency) => solve({ ...s, currency })}
    />
  );
}
