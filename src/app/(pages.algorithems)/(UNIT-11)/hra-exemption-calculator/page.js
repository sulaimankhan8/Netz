'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.hra-exemption-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Basic ₹50,000 a month, HRA ₹20,000, rent ₹18,000, in Mumbai. Find the exempt HRA for the year.</ExampleProblem>
        <ExampleStep n={1} title="YEARLY"><MathPanel><BlockMath math={"\\text{salary} = 6{,}00{,}000, \\ \\text{HRA} = 2{,}40{,}000, \\ \\text{rent} = 2{,}16{,}000"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="THREE AMOUNTS"><MathPanel><BlockMath math={"(a)\\ 2{,}40{,}000 \\quad (b)\\ 2{,}16{,}000 - 60{,}000 = 1{,}56{,}000 \\quad (c)\\ 3{,}00{,}000"} /></MathPanel><StepText>The least is (b).</StepText></ExampleStep>
        <Conclusion result="₹1,56,000 exempt" math={<BlockMath math={"\\text{exempt} = 1{,}56{,}000, \\quad \\text{taxable} = 84{,}000"} />}>The calculator below opens on this salary.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive HRA Exemption Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["income-tax","tds","percentage"]} />
    </MethodPage>
  );
}
