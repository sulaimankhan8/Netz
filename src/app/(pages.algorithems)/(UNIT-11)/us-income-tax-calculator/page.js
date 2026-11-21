'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.us-income-tax-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit11';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Does a raise into a higher bracket cut my pay?", a: <>No. Only the dollars above the bracket line are taxed at the higher rate.</> },
  { q: "Why does 401(k) not reduce FICA?", a: <>Traditional 401(k) contributions come out before income tax but Social Security and Medicare are still charged on them.</> },
  { q: "Why is state tax just a rate?", a: <>Every state has its own brackets, deductions and local taxes, so the page lets you type an average rate.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 11 • TAXES" title="US Income Tax Calculator" subtitle="Federal Tax, FICA and Take-Home Pay">
        See where an American paycheck goes: <strong>federal income tax</strong> by bracket after the standard deduction, <strong>FICA</strong> (Social Security and Medicare), an optional state rate, and the take-home pay that is left.
      </MethodHeader>
      <FormulaBox label="MARGINAL BRACKETS" tag="FEDERAL">
        <Formula math={"\\text{taxable} = \\text{wages} - \\text{pre-tax} - \\text{deduction}, \\qquad \\text{tax} = \\sum_{\\text{brackets}} \\text{income in bracket} \\times \\text{rate}"} />
        <FormulaSteps steps={[
          { title: "1. Taxable income", text: <>After pre-tax savings and the deduction.</> },
          { title: "2. Brackets", text: <>Each rate on its slice only.</> },
          { title: "3. FICA", text: <>6.2% + 1.45% of wages.</> },
        ]} />
        <SymbolKey rows={EX['us-income-tax-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['us-income-tax-calculator'].example} />
      <CommonMistakes items={EX['us-income-tax-calculator'].mistakes} />
      <Lab heading="Interactive US Income Tax Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["uk-income-tax","sales-tax","percentage"]} />
    </MethodPage>
  );
}
