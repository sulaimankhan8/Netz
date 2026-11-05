'use client';
// The live SIP calculator (with step-up). The maths is in src/app/utils/engines/sip.js.
import React from 'react';
import SavingsCalculator from '@/app/components/method/SavingsCalculator';
import { solve } from '@/app/utils/engines/sip';

const START = { monthly: '10000', rate: '12', years: '10', stepUp: '0' };
const EXAMPLES = [
  { label: '₹10,000 a month, 12%, 10 years', input: {} },
  { label: 'With a 10% yearly step-up', input: { stepUp: '10' } },
  { label: '₹500 a month for 20 years', input: { monthly: '500', years: '20' } },
];

export default function SipCalculator() {
  return (
    <SavingsCalculator
      id="sip" title="SIP Engine" start={START} examples={EXAMPLES}
      fields={[
        { key: 'monthly', label: 'Monthly investment' },
        { key: 'rate', label: 'Expected return (% a year)' },
        { key: 'years', label: 'Years' },
        { key: 'stepUp', label: 'Yearly step-up (%)', placeholder: '0 for a flat SIP' },
      ]}
      solve={(s, currency) => solve({ ...s, currency })}
    />
  );
}
