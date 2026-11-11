'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.monte-carlo-integration';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why use random numbers at all?", a: <>In one dimension Simpson&apos;s rule is far better. Monte Carlo wins for integrals in many dimensions, where grids need too many points.</> },
  { q: "What is the seed?", a: <>The starting value of the random number generator. A fixed seed makes the page give the same answer every time.</> },
  { q: "What is hit or miss?", a: <>Throw points into a box around the curve; the share that land under it, times the box area, estimates the integral. With f = √(1 − x²) it estimates π/4.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 3 • NUMERICAL INTEGRATION" title="Monte Carlo Integration Calculator" subtitle="Sample Mean and Hit-or-Miss, with the Error Shrinking Like 1/√N">
        <strong>Monte Carlo integration</strong> estimates an integral with random numbers: the average of <InlineMath math={"f"} /> at random points, times the length of the interval. The error shrinks like <InlineMath math={"1/\\sqrt N"} />, slowly, but the same is true in any number of dimensions.
      </MethodHeader>
      <FormulaBox label="THE ESTIMATES" tag="x_i RANDOM">
        <Formula math={"\\int_a^b f\\,dx \\approx \\frac{b - a}{N}\\sum_{i=1}^{N} f(x_i), \\qquad \\text{standard error} = (b - a)\\frac{s}{\\sqrt N}"} />
        <FormulaSteps steps={[
          { title: "1. Sample", text: <>N random x in [a, b].</> },
          { title: "2. Average", text: <>Mean of f(xᵢ), times b − a.</> },
          { title: "3. Error", text: <>About (b − a)s/√N.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Estimate ∫₀¹ x² dx with N = 1000 random points.</ExampleProblem>
        <ExampleStep n={1} title="ESTIMATE"><MathPanel><BlockMath math={"\\frac{1}{1000}\\sum_{i=1}^{1000} x_i^2 \\approx 0.33"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="COMPARE"><MathPanel><BlockMath math={"\\int_0^1 x^2\\,dx = \\frac13, \\quad \\text{standard error} \\approx 0.009"} /></MathPanel><StepText>Each run with another seed gives a slightly different estimate.</StepText></ExampleStep>
        <Conclusion result="≈ 1/3" math={<BlockMath math={"\\int_0^1 x^2\\,dx \\approx 0.33 \\ (\\text{exact } \\tfrac13)"} />}>The calculator below opens on this integral.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Monte Carlo Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["simpson-13","romberg","trapezoidal"]} />
    </MethodPage>
  );
}
