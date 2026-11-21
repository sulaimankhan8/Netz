'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.hra-exemption-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit11';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Can I claim HRA in the new regime?", a: <>No. The new regime has no HRA exemption, so all HRA is taxable there.</> },
  { q: "What counts as salary for HRA?", a: <>Basic pay plus dearness allowance if it counts for retirement benefits, plus commission fixed as a percentage of turnover. Not other allowances.</> },
  { q: "Which cities get 50%?", a: <>Delhi, Mumbai, Kolkata and Chennai. Everywhere else uses 40%.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 11 • TAXES" title="HRA Exemption Calculator" subtitle="The Least of Three Amounts, Section 10(13A)">
        If you live in a rented home, part of your <strong>house rent allowance</strong> is tax-free under the old regime. The exempt part is the <strong>least</strong> of three amounts; the rest of the HRA is taxed with your salary.
      </MethodHeader>
      <FormulaBox label="THE RULE" tag="LEAST OF THREE">
        <Formula math={"\\text{exempt} = \\min\\left(\\text{HRA},\\ \\text{rent} - 10\\%\\,\\text{salary},\\ 50\\% \\text{ or } 40\\%\\,\\text{salary}\\right)"} />
        <FormulaSteps steps={[
          { title: "1. Salary", text: <>Basic + DA.</> },
          { title: "2. Three amounts", text: <>HRA, rent − 10%, 50% or 40%.</> },
          { title: "3. Least", text: <>That much is exempt.</> },
        ]} />
        <SymbolKey rows={EX['hra-exemption-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['hra-exemption-calculator'].example} />
      <CommonMistakes items={EX['hra-exemption-calculator'].mistakes} />
      <Lab heading="Interactive HRA Exemption Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["income-tax","tds","percentage"]} />
    </MethodPage>
  );
}
