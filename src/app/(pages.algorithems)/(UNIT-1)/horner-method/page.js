'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.horner-method';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What is \"Horner's scheme\"?", a: <>Evaluating p(c) as (…(aₙc + aₙ₋₁)c + …)c + a₀: n multiplications instead of many powers. The same table does synthetic division.</> },
  { q: "Why multiply the roots by 10?", a: <>After diminishing, the root is 0.d…; multiplying by 10 makes it d.…, so the next digit is a whole-number sign change.</> },
  { q: "Are the digits rounded?", a: <>No, they are exact digits: the root is between the answer and the answer plus one unit in the last place.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • ROOT FINDING" title="Horner's Method Calculator" subtitle="A Real Root Digit by Digit, by Diminishing the Roots">
        <strong>Horner&apos;s method</strong> finds a root one digit at a time. Shift the polynomial so the root lies between 0 and 1 (<strong>diminish the roots</strong> by synthetic division), multiply the roots by 10, and read the next digit from a sign change.
      </MethodHeader>
      <FormulaBox label="ONE DIGIT" tag="SYNTHETIC DIVISION">
        <Formula math={"p(x) \\to p(x + d) \\ \\text{(diminish by } d\\text{)}, \\qquad a_k \\to 10^k a_k \\ \\text{(multiply the roots by 10)}"} />
        <FormulaSteps steps={[
          { title: "1. Whole part", text: <>Sign change between a and a + 1.</> },
          { title: "2. Diminish", text: <>By a, then ×10.</> },
          { title: "3. Next digit", text: <>Sign change again; repeat.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the positive root of x³ + 3x − 5 = 0 to 3 decimal places.</ExampleProblem>
        <ExampleStep n={1} title="WHOLE PART"><MathPanel><BlockMath math={"p(1) = -1, \\ p(2) = 9 \\Rightarrow 1 < x < 2"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="DIMINISH BY 1"><MathPanel><BlockMath math={"p(x + 1) = x^3 + 3x^2 + 6x - 1"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="DIGITS"><MathPanel><BlockMath math={"x = 1.154\\ldots"} /></MathPanel><StepText>Each digit by the same two moves.</StepText></ExampleStep>
        <Conclusion result="x ≈ 1.154" math={<BlockMath math={"x \\approx 1.154"} />}>The calculator below opens on this equation.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Horner's Method Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["bisection","newton-raphson","graeffe-root-squaring"]} />
    </MethodPage>
  );
}
