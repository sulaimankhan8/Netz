'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.npv-irr-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why is IRR \"Newton–Raphson on NPV\"?", a: <>IRR is the root of NPV(r) = 0. Newton&apos;s method uses NPV and its derivative to home in on that root in a few steps — exactly as for any equation in Unit 1.</> },
  { q: "NPV or IRR: which should I trust?", a: <>For a single project they agree. When ranking projects of different sizes, NPV is safer; IRR can mislead and can even have several values.</> },
  { q: "What is the payback period?", a: <>How long until the running total of cash flows turns positive. The discounted version uses present values.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 10 • INTEREST & FINANCE" title="NPV and IRR Calculator" subtitle="Net Present Value, Internal Rate of Return and Payback">
        The <strong>net present value</strong> adds every cash flow discounted to today. The <strong>internal rate of return</strong> is the rate that makes NPV zero — found here by Newton–Raphson, the same method as in Unit 1.
      </MethodHeader>
      <FormulaBox label="THE DEFINITIONS" tag="NPV(IRR) = 0">
        <Formula math={"NPV = \\sum_{t=0}^{n}\\frac{CF_t}{(1 + r)^t}, \\qquad r_{k+1} = r_k - \\frac{NPV(r_k)}{NPV'(r_k)}"} />
        <FormulaSteps steps={[
          { title: "1. Discount", text: <>Each cash flow by (1 + r)ᵗ.</> },
          { title: "2. Add", text: <>NPV ≥ 0: accept.</> },
          { title: "3. IRR", text: <>Newton–Raphson on NPV.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>A project costs ₹10,000 and returns ₹3,000, ₹4,200 and ₹6,800 over 3 years. Find the NPV at 10% and the IRR.</ExampleProblem>
        <ExampleStep n={1} title="NPV"><MathPanel><BlockMath math={"-10{,}000 + \\frac{3{,}000}{1.1} + \\frac{4{,}200}{1.1^2} + \\frac{6{,}800}{1.1^3} = 1{,}307.29"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="IRR"><StepText>Newton–Raphson from 10% settles at about 16.5%, where NPV = 0.</StepText></ExampleStep>
        <Conclusion result="NPV ₹1,307.29; IRR ≈ 16.5%" math={<BlockMath math={"NPV \\approx 1{,}307.29"} />}>The calculator below opens on this project.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive NPV and IRR Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["tvm","newton-raphson","cagr"]} />
    </MethodPage>
  );
}
