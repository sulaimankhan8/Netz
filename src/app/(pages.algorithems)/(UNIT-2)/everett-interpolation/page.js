'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.everett-interpolation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why only even differences?", a: <>The odd ones are written in terms of even ones on the two neighbouring rows, which halves the number of terms and makes the formula symmetric.</> },
  { q: "How does it relate to Bessel and Stirling?", a: <>All three come from Gauss&apos;s formulas; Everett&apos;s rearranges them so only even differences remain.</> },
  { q: "When is it best?", a: <>For x between two table values near the middle, with 0 &lt; p &lt; 1.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 2 • INTERPOLATION" title="Everett's Interpolation Formula" subtitle="Central Differences with Only Even Orders">
        <strong>Everett&apos;s formula</strong> interpolates between <InlineMath math={"x_0"} /> and <InlineMath math={"x_1"} /> using only the <strong>even central differences</strong> on those two rows, weighted by <InlineMath math={"p"} /> and <InlineMath math={"q = 1 - p"} />. It is accurate for points near the middle of the table.
      </MethodHeader>
      <FormulaBox label="EVERETT'S FORMULA" tag="q = 1 − p">
        <Formula math={"y = qy_0 + \\frac{q(q^2 - 1)}{3!}\\delta^2y_0 + \\cdots + py_1 + \\frac{p(p^2 - 1)}{3!}\\delta^2y_1 + \\cdots"} />
        <FormulaSteps steps={[
          { title: "1. Table", text: <>The differences.</> },
          { title: "2. p and q", text: <>p = (x − x₀)/h.</> },
          { title: "3. Formula", text: <>Even differences on rows x₀ and x₁.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>From x = 20, 24, 28, 32 with y = 2854, 3162, 3544, 3992, find y at x = 25.</ExampleProblem>
        <ExampleStep n={1} title="p AND q"><MathPanel><BlockMath math={"x_0 = 24, \\ h = 4, \\ p = \\tfrac14, \\ q = \\tfrac34"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="DIFFERENCES"><MathPanel><BlockMath math={"\\delta^2y_0 = 74, \\quad \\delta^2y_1 = 66"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="FORMULA"><MathPanel><BlockMath math={"y = \\tfrac34(3162) - \\tfrac{7}{128}(74) + \\tfrac14(3544) - \\tfrac{5}{128}(66) \\approx 3250.9"} /></MathPanel></ExampleStep>
        <Conclusion result="y ≈ 3250.875" math={<BlockMath math={"y(25) \\approx 3250.875"} />}>The calculator below opens on this table.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Everett's Formula Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["bessel","stirling","newton-forward"]} />
    </MethodPage>
  );
}
