'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import PpfCalculator from './algorithems.ppf-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit10';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why deposit before 5 April?', a: <>PPF interest is worked out on the lowest balance between the 5th and the last day of each month. Money paid by 5 April counts for all 12 months; money paid in March earns nothing that year.</> },
  { q: 'Can I keep a PPF after 15 years?', a: <>Yes. You can extend it in blocks of 5 years, with or without new deposits. Set the years to 20, 25 and so on to see the effect.</> },
  { q: 'How is the PPF rate set?', a: <>The government announces it every quarter for all small savings schemes. The calculator uses the rate stored with its date and source; you can type a different rate.</> },
];

export default function PpfPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 10 • INDIA SAVINGS" title="PPF Calculator" subtitle="Public Provident Fund Maturity, Year by Year">
        The <strong>Public Provident Fund</strong> takes up to ₹1.5 lakh a year for 15 years and adds tax-free interest once a year. Each yearly deposit grows like a small lump sum: <InlineMath math="D(1 + r)^{k}" />.
      </MethodHeader>
      <FormulaBox label="THE FORMULA" tag="ANNUITY DUE">
        <Formula math={'F = D \\times \\frac{(1 + r)^{n} - 1}{r} \\times (1 + r)'} />
        <FormulaSteps steps={[
          { title: '1. Deposit early', text: <>By 5 April, so each deposit earns a full year.</> },
          { title: '2. Interest yearly', text: <>(Opening balance + deposit) × r, added on 31 March.</> },
          { title: '3. 15 years', text: <>Then extend in blocks of 5 if you want.</> },
        ]} />
        <SymbolKey rows={EX['ppf-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['ppf-calculator'].example} />
      <CommonMistakes items={EX['ppf-calculator'].mistakes} />
      <Lab heading="Interactive PPF Calculator"><PpfCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['sip', 'fd', 'income-tax']} />
    </MethodPage>
  );
}
