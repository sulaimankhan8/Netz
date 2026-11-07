'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.golden-section-search';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why the golden ratio?", a: <>With φ = 0.618, one of the two points of the new interval is always an old point, so each step needs only one new function value.</> },
  { q: "How fast does it converge?", a: <>The interval shrinks by 0.618 each step: about 15 steps to cut it to a thousandth.</> },
  { q: "What if f has several minima?", a: <>It finds one of them, not necessarily the lowest. Give a or b so that only one minimum lies between them.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • ROOTS & OPTIMISATION" title="Golden Section Search" subtitle="Minimise or Maximise Without Derivatives">
        <strong>Golden section search</strong> shrinks [a, b] around the minimum of a unimodal f by the golden ratio <InlineMath math={"\\varphi \\approx 0.618"} /> each step, reusing one old point — no derivatives needed.
      </MethodHeader>
      <FormulaBox label="THE STEP" tag="φ = 0.618">
        <Formula math={"x_1 = b - \\varphi(b - a), \\quad x_2 = a + \\varphi(b - a), \\quad \\varphi = \\frac{\\sqrt{5} - 1}{2}"} />
        <FormulaSteps steps={[
          { title: "1. Two points", text: <>x₁ and x₂ inside [a, b].</> },
          { title: "2. Compare", text: <>Keep the side with the better point.</> },
          { title: "3. Repeat", text: <>One new f value per step.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Minimise <InlineMath math={"f(x) = x^2 - 4x + 5"} /> on [0, 5].</ExampleProblem>
        <ExampleStep n={1} title="FIRST POINTS"><MathPanel><BlockMath math={"x_1 = 5 - 0.618(5) = 1.910, \\quad x_2 = 0 + 0.618(5) = 3.090"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="COMPARE"><MathPanel><BlockMath math={"f(1.910) = 1.008 < f(3.090) = 2.188 \\Rightarrow [a, b] = [0, 3.090]"} /></MathPanel><StepText>Keep going until b − a is small.</StepText></ExampleStep>
        <Conclusion result="x* ≈ 2, f = 1" math={<BlockMath math={"x^* \\approx 2, \\quad f(x^*) \\approx 1"} />}>The calculator below opens on this function.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Golden Section Search Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["gradient-descent","bisection","maxima-minima"]} />
    </MethodPage>
  );
}
