'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import DoubleIntegrationCalculator from './algorithems.double-integration';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Where do the weights come from?', a: <>Apply the one-dimensional rule in x, then again in y. The weight of each grid point is the product of its x-weight and its y-weight: for the trapezoidal rule, corners get 1, edges 2 and inside points 4.</> },
  { q: 'Which rule is more accurate?', a: <>Simpson&apos;s rule, which fits parabolas instead of straight lines: its error shrinks like h⁴ instead of h². It needs an even number of strips in each direction.</> },
  { q: 'Can I integrate over a non-rectangular region?', a: <>This calculator handles rectangles [a, b] × [c, d]. For curved regions, change the order or the variables first so the limits become constants.</> },
];

export default function DoubleIntegrationPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 3 • NUMERICAL INTEGRATION" title="Double Integration" subtitle="Trapezoidal and Simpson's Rules in Two Dimensions">
        Approximate <InlineMath math="\int_c^d \int_a^b f(x, y)\,dx\,dy" /> by applying a one-dimensional rule in each direction: tabulate f on a grid, weight each value, add and scale.
      </MethodHeader>
      <FormulaBox label="THE RULES" tag="h × k grid">
        <Formula math={`\\text{Trapezoidal: } I \\approx \\frac{hk}{4}\\sum w_i w_j f_{ij}, \\qquad \\text{Simpson: } I \\approx \\frac{hk}{9}\\sum w_i w_j f_{ij}`} />
        <FormulaSteps steps={[
          { title: '1. Grid', text: <>h = (b − a)/m, k = (d − c)/n.</> },
          { title: '2. Table', text: <>f at every grid point.</> },
          { title: '3. Weights', text: <>Trapezoidal 1, 2, …, 2, 1; Simpson 1, 4, 2, …, 4, 1 in each direction.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Evaluate <InlineMath math="\int_1^2\int_1^2 \frac{dx\,dy}{x + y}" /> with h = k = 0.25 by the trapezoidal rule.</ExampleProblem>
        <ExampleStep n={1} title="TABULATE"><StepText>f = 1/(x + y) at x, y = 1, 1.25, 1.5, 1.75, 2: a 5 × 5 table.</StepText></ExampleStep>
        <ExampleStep n={2} title="WEIGHT AND ADD"><MathPanel><BlockMath math="I \approx \frac{(0.25)(0.25)}{4}\sum w_i w_j f_{ij} = 0.3407" /></MathPanel><StepText>Simpson&apos;s rule gives 0.3398; the exact value is 0.33979…</StepText></ExampleStep>
        <Conclusion result="I ≈ 0.3407 (trapezoidal)" math={<BlockMath math="I \approx 0.3407" />}>The calculator below opens on this integral.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Double Integration Calculator"><DoubleIntegrationCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['trapezoidal', 'simpson-13', 'integral']} />
    </MethodPage>
  );
}
