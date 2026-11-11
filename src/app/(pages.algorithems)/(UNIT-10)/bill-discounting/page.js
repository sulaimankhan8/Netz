'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.bill-discounting';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What are days of grace?", a: <>Three extra days allowed after the nominal due date of a bill; the legally due date is used for the discount.</> },
  { q: "Why is the banker's discount bigger?", a: <>It charges interest on the whole face value, while the true discount charges it only on the present worth, which is smaller.</> },
  { q: "What does the bank pay?", a: <>The face value minus the banker&apos;s discount (the discounted value).</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 10 • COMMERCIAL MATHS" title="Bill Discounting Calculator: Banker's Discount and True Discount" subtitle="Banker's Gain, Present Worth and Days of Grace">
        When a bill is cashed at a bank before it is due, the bank deducts the <strong>banker&apos;s discount</strong>: simple interest on the face value. The <strong>true discount</strong> is interest on the present worth only, so the bank gains a little: the <strong>banker&apos;s gain</strong>.
      </MethodHeader>
      <FormulaBox label="THE THREE DISCOUNTS" tag="t IN YEARS">
        <Formula math={"BD = Frt, \\qquad TD = \\frac{Frt}{1 + rt}, \\qquad BG = BD - TD = TD\\cdot rt"} />
        <FormulaSteps steps={[
          { title: "1. Time", text: <>Days to the legally due date, over 365.</> },
          { title: "2. Discounts", text: <>BD and TD.</> },
          { title: "3. Gain", text: <>BG = BD − TD.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>A bill for ₹7,300 is discounted at 10% per annum 73 days before it is due. Find BD, TD and BG.</ExampleProblem>
        <ExampleStep n={1} title="TIME"><MathPanel><BlockMath math={"t = \\frac{73}{365} = \\frac15"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="BANKER'S DISCOUNT"><MathPanel><BlockMath math={"BD = 7300 \\times 0.10 \\times \\tfrac15 = 146"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="TRUE DISCOUNT"><MathPanel><BlockMath math={"TD = \\frac{146}{1 + 0.02} = 143.14, \\quad BG = 146 - 143.14 = 2.86"} /></MathPanel></ExampleStep>
        <Conclusion result="BD ₹146, TD ₹143.14, BG ₹2.86" math={<BlockMath math={"BD = 146, \\ TD = 143.14, \\ BG = 2.86"} />}>The calculator below opens on this bill.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Bill Discounting Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["compound-interest","percentage","tvm"]} />
    </MethodPage>
  );
}
