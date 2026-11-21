'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import CanadaSalesTaxCalculator from './algorithems.canada-sales-tax-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit11';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What is the difference between GST, HST and PST?', a: <>GST is the 5% federal tax charged everywhere. HST combines GST with the provincial tax into one rate (13% in Ontario). In BC, Manitoba, Saskatchewan and Quebec, a separate provincial tax (PST, RST or QST) is charged next to the GST.</> },
  { q: 'Is QST charged on top of GST?', a: <>Not since 2013. Quebec&apos;s 9.975% QST is charged on the price before tax, like the GST, so the total rate is 14.975%.</> },
  { q: 'How do I take the tax out of a total?', a: <>Divide by <InlineMath math="1 + \frac{c}{100}" />: in Ontario, <InlineMath math="\$113 \div 1.13 = \$100" />.</> },
];

export default function CanadaSalesTaxPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 11 • TAXES" title="Canada GST/HST Calculator" subtitle="GST, HST and PST by Province">
        Canadian sales tax depends on the province: <strong>GST</strong> only, one <strong>HST</strong>, or GST plus a provincial <strong>PST</strong>. Every part is charged on the price before tax, so the rates simply add.
      </MethodHeader>
      <FormulaBox label="THE RULE" tag="CANADA">
        <Formula math={'\\text{Tax} = P \\times \\frac{\\text{GST} + \\text{PST}}{100} \\ \\text{ or } \\ P \\times \\frac{\\text{HST}}{100}, \\qquad P = \\frac{\\text{Total}}{1 + c/100}'} />
        <FormulaSteps steps={[
          { title: '1. Province', text: <>Find whether it uses GST, HST or GST + PST.</> },
          { title: '2. Each part', text: <>Rate × the price before tax.</> },
          { title: '3. Add up', text: <>Or divide by 1 + c/100 to remove the tax.</> },
        ]} />
        <SymbolKey rows={EX['canada-sales-tax-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['canada-sales-tax-calculator'].example} />
      <CommonMistakes items={EX['canada-sales-tax-calculator'].mistakes} />
      <Lab heading="Interactive Canada Sales Tax Calculator"><CanadaSalesTaxCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['sales-tax', 'gst', 'vat']} />
    </MethodPage>
  );
}
