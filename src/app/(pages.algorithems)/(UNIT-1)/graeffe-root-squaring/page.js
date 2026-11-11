'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.graeffe-root-squaring';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why does squaring help?", a: <>If |x₁| &gt; |x₂|, then |x₁|^{'{'}2^m{'}'} ≫ |x₂|^{'{'}2^m{'}'}, so the polynomial behaves like a product of terms that split cleanly.</> },
  { q: "How are the signs found?", a: <>The method gives only |xₖ|; put +|xₖ| and −|xₖ| into p and keep the one that makes p (nearly) 0.</> },
  { q: "When does it fail?", a: <>For equal-sized roots, such as a complex pair, the ratios do not settle; other methods (Bairstow) are better there.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • ROOT FINDING" title="Graeffe's Root Squaring Method" subtitle="All the Real Roots at Once from Their Magnitudes">
        <strong>Graeffe&apos;s method</strong> repeatedly squares the roots of a polynomial without knowing them. After a few squarings the roots are so far apart in size that each one is (nearly) a ratio of neighbouring coefficients.
      </MethodHeader>
      <FormulaBox label="ROOT SQUARING" tag="x → −x²">
        <Formula math={"b_k = a_k^2 - 2a_{k-1}a_{k+1} + 2a_{k-2}a_{k+2} - \\cdots, \\qquad |x_k| \\approx \\left(\\frac{b_k}{b_{k-1}}\\right)^{1/2^m}"} />
        <FormulaSteps steps={[
          { title: "1. Square", text: <>New coefficients bₖ.</> },
          { title: "2. Repeat", text: <>m times.</> },
          { title: "3. Read off", text: <>|xₖ| from the ratios, signs by substituting.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the roots of x³ − 6x² + 11x − 6 = 0 by three squarings.</ExampleProblem>
        <ExampleStep n={1} title="SQUARINGS"><MathPanel><BlockMath math={"(1, 14, 49, 36) \\to (1, 98, 1393, 1296) \\to \\ldots"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="MAGNITUDES"><MathPanel><BlockMath math={"|x_1| \\approx 3.01, \\ |x_2| \\approx 1.99, \\ |x_3| \\approx 1.00"} /></MathPanel><StepText>The exact roots are 3, 2, 1.</StepText></ExampleStep>
        <Conclusion result="x ≈ 3, 2, 1" math={<BlockMath math={"x \\approx 3.014, \\ 1.991, \\ 0.9995"} />}>The calculator below opens on this polynomial.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Graeffe's Method Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["bairstow-method","horner-method","newton-raphson"]} />
    </MethodPage>
  );
}
