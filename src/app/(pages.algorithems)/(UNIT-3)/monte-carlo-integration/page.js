'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.monte-carlo-integration';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  SymbolKey, CommonMistakes,
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
        <SymbolKey rows={[
          { s: 'N', t: 'How many random points are used.', e: 'N = 1000' },
          { s: 'x_i', t: 'Random x values spread evenly over [a, b].', e: 'x_1 = 0.10' },
          { s: '\\bar f', t: 'The average of f at the random points: the average height of the curve.', e: '0.407' },
          { s: '(b - a)\\,\\bar f', t: 'Width times average height: the estimate of the area.', e: '1 \\times 0.407' },
          { s: 's', t: 'The standard deviation of the f values: how much they vary.', e: '' },
          { s: '(b - a)\\frac{s}{\\sqrt N}', t: 'The standard error: how far the estimate typically is from the truth. Four times the points halve it.', e: '\\approx 0.009' },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Estimate ∫₀¹ x² dx with N = 1000 random points.</ExampleProblem>
        <ExampleStep n={1} title="BY HAND WITH 5 RANDOM NUMBERS">
          <StepText>Exam questions usually give a few random numbers. Take <InlineMath math="x_i = 0.10,\ 0.35,\ 0.60,\ 0.80,\ 0.95" />:</StepText>
          <MathPanel>
            <BlockMath math={"f(x_i) = x_i^2: \\quad 0.01,\\ 0.1225,\\ 0.36,\\ 0.64,\\ 0.9025"} />
            <BlockMath math={"\\bar f = \\frac{0.01 + 0.1225 + 0.36 + 0.64 + 0.9025}{5} = \\frac{2.035}{5} = 0.407"} />
            <BlockMath math={"I \\approx (b - a)\\,\\bar f = (1 - 0)(0.407) = 0.407"} />
          </MathPanel>
          <StepText>With only 5 points the estimate is rough (exact 1/3); more points make it settle.</StepText>
        </ExampleStep>
        <ExampleStep n={2} title="WITH N = 1000"><MathPanel><BlockMath math={"\\frac{1}{1000}\\sum_{i=1}^{1000} x_i^2 \\approx 0.33"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="COMPARE"><MathPanel><BlockMath math={"\\int_0^1 x^2\\,dx = \\frac13, \\quad \\text{standard error} \\approx 0.009"} /></MathPanel><StepText>Each run with another seed gives a slightly different estimate.</StepText></ExampleStep>
        <Conclusion result="≈ 1/3" math={<BlockMath math={"\\int_0^1 x^2\\,dx \\approx 0.33 \\ (\\text{exact } \\tfrac13)"} />}>The calculator below opens on this integral.</Conclusion>
      </WorkedExample>
      <CommonMistakes items={[
        { m: <>Forgetting to multiply by (b − a).</>, f: <>The estimate is width × average height; on [0, 1] the width is 1, so it is easy to miss on other intervals.</> },
        { m: <>Random numbers outside [a, b].</>, f: <>Map numbers from [0, 1] with <InlineMath math="x = a + (b - a)u" />.</> },
        { m: <>Expecting the exact answer.</>, f: <>It is an estimate; quote it with its standard error.</> },
        { m: <>Trusting many decimals from few points.</>, f: <>The error shrinks only like <InlineMath math="1/\sqrt N" />: 4× the points for half the error.</> },
        { m: <>Using it for a smooth 1-D integral when accuracy matters.</>, f: <>Simpson or Gauss is far more accurate in one dimension; Monte Carlo shines in many dimensions.</> },
        { m: <>Writing only the final answer.</>, f: <>Show the random numbers, each f value, the average, and the width.</> },
      ]} />
      <Lab heading="Interactive Monte Carlo Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["simpson-13","romberg","trapezoidal"]} />
    </MethodPage>
  );
}
