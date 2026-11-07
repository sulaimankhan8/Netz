'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.us-income-tax-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Wages $85,000 (single, 2026), $5,000 into a 401(k), 5% state tax. Find the take-home pay.</ExampleProblem>
        <ExampleStep n={1} title="TAXABLE"><MathPanel><BlockMath math={"85{,}000 - 5{,}000 - 16{,}100 = 63{,}900"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="FEDERAL"><MathPanel><BlockMath math={"1{,}240 + 4{,}560 + 2{,}970 = 8{,}770"} /></MathPanel><StepText>10% on the first $12,400, 12% up to $50,400, 22% on the rest.</StepText></ExampleStep>
        <ExampleStep n={3} title="FICA AND STATE"><MathPanel><BlockMath math={"5{,}270 + 1{,}232.50 = 6{,}502.50, \\quad 5\\% \\times 80{,}000 = 4{,}000"} /></MathPanel></ExampleStep>
        <Conclusion result="$60,727.50 a year" math={<BlockMath math={"85{,}000 - 5{,}000 - 8{,}770 - 6{,}502.50 - 4{,}000 = 60{,}727.50"} />}>The calculator below opens on this paycheck.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive US Income Tax Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["uk-income-tax","sales-tax","percentage"]} />
    </MethodPage>
  );
}
