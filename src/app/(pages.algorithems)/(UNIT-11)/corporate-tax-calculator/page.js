'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.corporate-tax-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Are these rates current?", a: <>They come from the rates files with the date they were checked, shown under the steps. Check them against the official sources for your year.</> },
  { q: "What is MAT?", a: <>Minimum alternate tax in India: under the normal provisions a company pays at least 15% of its book profit (plus surcharge and cess).</> },
  { q: "Why divide the UK limits?", a: <>With associated companies, the £50,000 and £250,000 limits are shared: each is divided by 1 + the number of associates.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 11 • TAXES" title="Corporate Tax Calculator: India, UK and US" subtitle="Company Tax with Surcharge, Cess, Marginal Relief and State Tax">
        <strong>Corporate tax</strong> is charged on a company&apos;s taxable profit. India adds a surcharge and cess (and MAT as a floor), the UK has a small-profits rate with <strong>marginal relief</strong>, and the US charges a flat federal rate with state taxes on top.
      </MethodHeader>
      <FormulaBox label="THE RULES" tag="RATES FROM THE RATES FILES">
        <Formula math={"\\text{India: } T(1 + s)(1.04); \\qquad \\text{UK: } 25\\% - \\tfrac{3}{200}(250{,}000 - P); \\qquad \\text{US: } s + 21\\%(1 - s)"} />
        <FormulaSteps steps={[
          { title: "1. Rate", text: <>The regime or band that applies.</> },
          { title: "2. Add-ons", text: <>Surcharge and cess, or marginal relief, or state tax.</> },
          { title: "3. Total", text: <>And the effective rate.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>A UK company has profits of £100,000 (no associated companies). Find its corporation tax.</ExampleProblem>
        <ExampleStep n={1} title="MAIN RATE"><MathPanel><BlockMath math={"25\\% \\times 100{,}000 = 25{,}000"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="MARGINAL RELIEF"><MathPanel><BlockMath math={"\\tfrac{3}{200}(250{,}000 - 100{,}000) = 2{,}250"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="TAX"><MathPanel><BlockMath math={"25{,}000 - 2{,}250 = 22{,}750 \\ (22.75\\%)"} /></MathPanel></ExampleStep>
        <Conclusion result="£22,750" math={<BlockMath math={"\\text{tax} = £22{,}750"} />}>The calculator below opens on an Indian company.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Corporate Tax Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["income-tax","gst","uk-income-tax"]} />
    </MethodPage>
  );
}
