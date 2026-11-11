'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.bairstow-method';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why look for quadratic factors?", a: <>Complex roots of a real polynomial come in pairs, and each pair is a real quadratic factor, so no complex arithmetic is needed.</> },
  { q: "What if it does not converge?", a: <>Newton on r, s needs a reasonable start; try other r and s (for example 1 and −1).</> },
  { q: "How are the roots read off?", a: <>From each factor x² − rx − s: x = (r ± √(r² + 4s))/2.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • ROOT FINDING" title="Bairstow's Method Calculator" subtitle="Quadratic Factors and All the Roots of a Polynomial">
        <strong>Bairstow&apos;s method</strong> finds a quadratic factor <InlineMath math={"x^2 - rx - s"} /> of a polynomial by Newton&apos;s method on <InlineMath math={"r"} /> and <InlineMath math={"s"} />, using only real arithmetic. Dividing it out and repeating gives every root, complex pairs included.
      </MethodHeader>
      <FormulaBox label="THE RECURRENCES" tag="x² − rx − s">
        <Formula math={"b_i = a_i + rb_{i+1} + sb_{i+2}, \\quad c_i = b_i + rc_{i+1} + sc_{i+2}; \\qquad c_2\\Delta r + c_3\\Delta s = -b_1, \\ c_1\\Delta r + c_2\\Delta s = -b_0"} />
        <FormulaSteps steps={[
          { title: "1. Divide twice", text: <>The b and c numbers.</> },
          { title: "2. Newton", text: <>Solve for Δr, Δs.</> },
          { title: "3. Deflate", text: <>Divide out the factor and repeat.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find all roots of x⁴ − 1.1x³ + 2.3x² + 0.5x + 3.3, starting from r = s = −1.</ExampleProblem>
        <ExampleStep n={1} title="FIRST FACTOR"><MathPanel><BlockMath math={"r \\to -0.9, \\ s \\to -1.1: \\quad x^2 + 0.9x + 1.1"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="DEFLATE"><MathPanel><BlockMath math={"x^4 - 1.1x^3 + 2.3x^2 + 0.5x + 3.3 = (x^2 + 0.9x + 1.1)(x^2 - 2x + 3)"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="ROOTS"><MathPanel><BlockMath math={"x = -0.45 \\pm 0.947i, \\quad x = 1 \\pm 1.414i"} /></MathPanel></ExampleStep>
        <Conclusion result="x = −0.45 ± 0.947i, 1 ± 1.414i" math={<BlockMath math={"x = -0.45 \\pm 0.9474i, \\ 1 \\pm \\sqrt2\\,i"} />}>The calculator below opens on this polynomial.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Bairstow's Method Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["muller-method","graeffe-root-squaring","newton-raphson"]} />
    </MethodPage>
  );
}
