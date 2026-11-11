'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.floating-point-representation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why is 0.1 + 0.2 not exactly 0.3?", a: <>None of 0.1, 0.2, 0.3 is exact in binary; the rounding errors do not cancel, so the sum differs in the last bit.</> },
  { q: "What is machine epsilon?", a: <>The gap between 1 and the next number: 2⁻²³ ≈ 1.19 × 10⁻⁷ for single, 2⁻⁵² ≈ 2.2 × 10⁻¹⁶ for double. Rounding to nearest keeps the relative error below half of it.</> },
  { q: "What are subnormal numbers?", a: <>Below the smallest normal number the exponent is all 0s and the leading 1 is dropped, filling the gap down to 0 with evenly spaced values.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • NUMBERS & ERRORS" title="IEEE-754 Floating-Point Converter" subtitle="Sign, Exponent, Fraction and the Rounding Error">
        Computers store real numbers as <InlineMath math={"(-1)^s \\times 1.f \\times 2^{E}"} />: a sign bit, a biased exponent and a fraction. Most decimals (like <InlineMath math={"0.1"} />) have endless binary expansions, so the nearest representable number is stored, with a small <strong>rounding error</strong>.
      </MethodHeader>
      <FormulaBox label="THE LAYOUT" tag="BIAS 127 / 1023">
        <Formula math={"\\text{single: } 1 + 8 + 23 \\text{ bits}, \\ e = E + 127; \\qquad \\text{double: } 1 + 11 + 52 \\text{ bits}, \\ e = E + 1023"} />
        <FormulaSteps steps={[
          { title: "1. Binary", text: <>Write the number in base 2.</> },
          { title: "2. Normalise", text: <>1.f × 2ᴱ.</> },
          { title: "3. Store", text: <>Sign, E + bias, the first fraction bits (rounded).</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Store −13.625 in single precision.</ExampleProblem>
        <ExampleStep n={1} title="BINARY"><MathPanel><BlockMath math={"13.625 = 1101.101_2 = 1.101101_2 \\times 2^{3}"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="BITS"><MathPanel><BlockMath math={"s = 1, \\quad e = 3 + 127 = 130 = 10000010_2, \\quad f = 10110100\\ldots0"} /></MathPanel><StepText>Hex C15A0000. It is stored exactly.</StepText></ExampleStep>
        <Conclusion result="C15A0000" math={<BlockMath math={"1\\ 10000010\\ 10110100000000000000000"} />}>The calculator below opens on 0.1, which cannot be stored exactly.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Floating Point Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["errors-approximations","bisection","newton-raphson"]} />
    </MethodPage>
  );
}
