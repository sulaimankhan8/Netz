'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.tds-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Is TDS an extra tax?", a: <>No. It is advance tax collected by the payer. The receiver claims it against their final tax, or gets a refund.</> },
  { q: "What happens without a PAN?", a: <>Section 206AA makes the rate at least 20%.</> },
  { q: "Why can I type my own rate?", a: <>TDS rates and limits depend on the exact payment and change with budgets; a lower-deduction certificate can also set a special rate.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 11 • TAXES" title="TDS Calculator" subtitle="Tax Deducted at Source, Net Payment and the No-PAN Rate">
        <strong>Tax deducted at source</strong> is taken out by the payer before you are paid, and credited to your income tax. Type the rate (or pick a common section), and see the TDS and what reaches the receiver.
      </MethodHeader>
      <FormulaBox label="THE CALCULATION" tag="AT SOURCE">
        <Formula math={"\\text{TDS} = \\text{payment} \\times \\text{rate}, \\qquad \\text{net} = \\text{payment} - \\text{TDS}, \\qquad \\text{no PAN: rate} = \\max(\\text{rate}, 20\\%)"} />
        <FormulaSteps steps={[
          { title: "1. Limit", text: <>Below it, no TDS.</> },
          { title: "2. Rate", text: <>The section rate, or 20% without PAN.</> },
          { title: "3. Deduct", text: <>Pay the rest.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>A professional is paid ₹1,00,000 under section 194J (10%). Find the TDS.</ExampleProblem>
        <ExampleStep n={1} title="TDS"><MathPanel><BlockMath math={"1{,}00{,}000 \\times 10\\% = 10{,}000"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="NET"><MathPanel><BlockMath math={"1{,}00{,}000 - 10{,}000 = 90{,}000"} /></MathPanel><StepText>The ₹10,000 appears in the receiver&apos;s Form 26AS and counts towards their tax.</StepText></ExampleStep>
        <Conclusion result="TDS ₹10,000" math={<BlockMath math={"\\text{TDS} = 10{,}000"} />}>The calculator below opens on this payment.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive TDS Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["income-tax","hra-exemption","gst"]} />
    </MethodPage>
  );
}
