'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.cagr-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why not just divide the total growth by the years?", a: <>Growth compounds: 16.5% a year for 6 years multiplies the money by 2.5, while 25% a year would multiply it by 3.8.</> },
  { q: "What does CAGR hide?", a: <>The ups and downs in between. Two investments with the same CAGR can have had very different journeys.</> },
  { q: "What is the real return?", a: <>The growth after removing inflation — how much more you can actually buy.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 10 • INTEREST & FINANCE" title="CAGR Calculator" subtitle="Compound Annual Growth Rate and Real Return">
        The <strong>compound annual growth rate</strong> is the steady yearly rate that turns the starting value into the final one: <InlineMath math={"\\text{CAGR} = (\\text{end}/\\text{start})^{1/n} - 1"} />. Subtract inflation for the real return.
      </MethodHeader>
      <FormulaBox label="THE FORMULA" tag="n YEARS">
        <Formula math={"\\text{CAGR} = \\left(\\frac{\\text{end}}{\\text{start}}\\right)^{1/n} - 1, \\qquad \\text{real} = \\frac{1 + \\text{CAGR}}{1 + \\text{inflation}} - 1"} />
        <FormulaSteps steps={[
          { title: "1. Ratio", text: <>End ÷ start.</> },
          { title: "2. Root", text: <>The nth root for n years.</> },
          { title: "3. Subtract 1", text: <>As a percentage.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>₹1,00,000 grew to ₹2,50,000 in 6 years. Find the CAGR.</ExampleProblem>
        <ExampleStep n={1} title="RATIO"><MathPanel><BlockMath math={"\\frac{2{,}50{,}000}{1{,}00{,}000} = 2.5"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="ROOT"><MathPanel><BlockMath math={"2.5^{1/6} - 1 = 1.1650 - 1 = 16.50\\%"} /></MathPanel><StepText>Not 150%/6 = 25%: growth compounds.</StepText></ExampleStep>
        <Conclusion result="≈ 16.5% a year" math={<BlockMath math={"\\text{CAGR} \\approx 16.50\\%"} />}>The calculator below opens on this example.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive CAGR Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["compound-interest","lumpsum","npv-irr"]} />
    </MethodPage>
  );
}
