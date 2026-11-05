'use client';
// The live PPF calculator. The maths is in src/app/utils/engines/ppf.js; the rate in src/app/data/rates/in.js.
import React from 'react';
import SavingsCalculator from '@/app/components/method/SavingsCalculator';
import RatesBadge from '@/app/components/method/RatesBadge';
import { solve, ppfRule } from '@/app/utils/engines/ppf';

const RULE = ppfRule();
const START = { deposit: '150000', rate: String(RULE.data.rate), years: '15', timing: 'start' };
const EXAMPLES = [
  { label: '₹1.5 lakh a year (the maximum)', input: {} },
  { label: '₹5,000 a month = ₹60,000 a year', input: { deposit: '60000' } },
  { label: 'Extended to 25 years', input: { deposit: '100000', years: '25' } },
];

export default function PpfCalculator() {
  return (
    <SavingsCalculator
      id="ppf" title="PPF Engine" start={START} examples={EXAMPLES} currencyPicker={false}
      fields={[
        { key: 'timing', label: 'When do you deposit?', kind: 'choice', options: [{ value: 'start', label: 'By 5 April (start of the year)' }, { value: 'end', label: 'In March (end of the year)' }] },
        { key: 'deposit', label: 'Yearly deposit (₹500 to ₹1,50,000)' },
        { key: 'rate', label: 'Interest rate (% a year)' },
        { key: 'years', label: 'Years (15, 20, 25, …)' },
      ]}
      solve={(s) => solve({ ...s, currency: 'INR', rule: RULE })}
      below={(s) => <RatesBadge rule={RULE} custom={Number(s.rate) !== RULE.data.rate} />}
    />
  );
}
