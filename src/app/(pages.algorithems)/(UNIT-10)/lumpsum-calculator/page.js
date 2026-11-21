'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import LumpsumCalculator from './algorithems.lumpsum-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit10';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Lump sum or SIP: which is better?', a: <>For the same total and a steady return, a lump sum grows more because all the money is invested from day one. A SIP spreads the risk of investing just before a fall, and suits money that comes in monthly.</> },
  { q: 'What does "in today\'s money" mean?', a: <>Prices rise with inflation, so ₹1 in 10 years buys less than ₹1 today. Dividing by <InlineMath math="(1 + f)^{T}" /> gives what the future amount is worth at today&apos;s prices.</> },
  { q: 'What is the rule of 72?', a: <>Money doubles in about 72 ÷ r years at r% a year: 6 years at 12%. The calculator shows it next to the exact answer.</> },
];

export default function LumpsumPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 10 • INDIA SAVINGS" title="Lump Sum Calculator" subtitle="One-Time Investment, With Inflation">
        A <strong>lump sum</strong> is invested once and left to grow: <InlineMath math="F = P(1 + r)^{T}" />. Add inflation to see what the result is worth in today&apos;s money.
      </MethodHeader>
      <FormulaBox label="THE FORMULA" tag="COMPOUND GROWTH">
        <Formula math={'F = P\\left(1 + \\frac{r}{100}\\right)^{T}, \\qquad \\text{today\'s value} = \\frac{F}{(1 + f/100)^{T}}'} />
        <FormulaSteps steps={[
          { title: '1. Growth factor', text: <>1 + r/100 for each year.</> },
          { title: '2. Power', text: <>Raise it to the number of years.</> },
          { title: '3. Inflation', text: <>Optional: divide by (1 + f/100)^T.</> },
        ]} />
        <SymbolKey rows={EX['lumpsum-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['lumpsum-calculator'].example} />
      <CommonMistakes items={EX['lumpsum-calculator'].mistakes} />
      <Lab heading="Interactive Lump Sum Calculator"><LumpsumCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['sip', 'compound-interest', 'fd']} />
    </MethodPage>
  );
}
