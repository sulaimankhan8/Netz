'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.muller-method';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why the ± sign rule?", a: <>Choosing the sign that makes |b ± √(b² − 4ac)| larger avoids subtracting nearly equal numbers and picks the root closer to x₂.</> },
  { q: "How can it find complex roots?", a: <>If b² − 4ac &lt; 0 the square root is complex, so x₃ leaves the real line; the page works in complex numbers throughout.</> },
  { q: "How fast is it?", a: <>Its order is about 1.84, between the secant method (1.62) and Newton (2), and it needs no derivative.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • ROOT FINDING" title="Muller's Method Calculator" subtitle="Root Finding by Parabolas, Real or Complex">
        <strong>Muller&apos;s method</strong> generalises the secant method: instead of a line through two points it fits a <strong>parabola</strong> through three and takes its root. It converges fast (order about 1.84) and can reach complex roots from real starting points.
      </MethodHeader>
      <FormulaBox label="THE STEP" tag="THREE POINTS">
        <Formula math={"a = \\frac{\\delta_2 - \\delta_1}{h_2 + h_1}, \\ b = ah_2 + \\delta_2, \\ c = f(x_2); \\qquad x_3 = x_2 - \\frac{2c}{b \\pm \\sqrt{b^2 - 4ac}}"} />
        <FormulaSteps steps={[
          { title: "1. Differences", text: <>h₁, h₂ and the slopes δ₁, δ₂.</> },
          { title: "2. Parabola", text: <>a, b, c.</> },
          { title: "3. Root", text: <>x₃ with the larger denominator.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the root of x³ − x − 1 = 0 starting from 0, 1, 2.</ExampleProblem>
        <ExampleStep n={1} title="FIRST STEP"><MathPanel><BlockMath math={"h_1 = h_2 = 1, \\ \\delta_1 = 0, \\ \\delta_2 = 6, \\ a = 3, \\ b = 9, \\ c = 5 \\Rightarrow x_3 = 2 - \\frac{10}{9 + \\sqrt{21}} \\approx 1.2649"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="CONVERGE"><MathPanel><BlockMath math={"x \\approx 1.324718"} /></MathPanel><StepText>Five iterations.</StepText></ExampleStep>
        <Conclusion result="x ≈ 1.324718" math={<BlockMath math={"x \\approx 1.324718"} />}>The calculator below opens on this equation.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Muller's Method Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["secant","newton-raphson","bairstow-method"]} />
    </MethodPage>
  );
}
