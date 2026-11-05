'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import CanadaSalesTaxCalculator from './algorithems.canada-sales-tax-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>A $100 purchase is made in Quebec. Find the GST, the QST and the total.</ExampleProblem>
        <ExampleStep n={1} title="EACH PART"><MathPanel><BlockMath math="\text{GST} = 100 \times 5\% = 5.00, \qquad \text{QST} = 100 \times 9.975\% = 9.975" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="TOTAL"><MathPanel><BlockMath math="100 + 5.00 + 9.975 = 114.975 \approx 114.98" /></MathPanel><StepText>In Ontario the same purchase would cost $113.00 with 13% HST.</StepText></ExampleStep>
        <Conclusion result="Total $114.98 in Quebec" math={<BlockMath math="c = 5\% + 9.975\% = 14.975\%" />}>Choose Quebec in the calculator below to check.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Canada Sales Tax Calculator"><CanadaSalesTaxCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['sales-tax', 'gst', 'vat']} />
    </MethodPage>
  );
}
