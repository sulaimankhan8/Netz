'use client';
// The live lump sum calculator. The maths is in src/app/utils/engines/lumpsum.js.
import React from 'react';
import SavingsCalculator from '@/app/components/method/SavingsCalculator';
import { solve } from '@/app/utils/engines/lumpsum';

const START = { amount: '100000', rate: '12', years: '10', inflation: '' };
const EXAMPLES = [
  { label: '₹1 lakh, 12%, 10 years', input: {} },
  { label: 'After 6% inflation', input: { inflation: '6' } },
  { label: '₹5 lakh, 8% for 25 years', input: { amount: '500000', rate: '8', years: '25' } },
];

export default function LumpsumCalculator() {
  return (
    <SavingsCalculator
      id="lumpsum" title="Lump Sum Engine" start={START} examples={EXAMPLES}
      fields={[
        { key: 'amount', label: 'Amount invested' },
        { key: 'rate', label: 'Expected return (% a year)' },
        { key: 'years', label: 'Years' },
        { key: 'inflation', label: 'Inflation (% a year, optional)', placeholder: 'e.g. 6' },
      ]}
      solve={(s, currency) => solve({ ...s, currency })}
    />
  );
}
