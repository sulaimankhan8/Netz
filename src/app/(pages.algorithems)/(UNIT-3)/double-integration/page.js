'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import DoubleIntegrationCalculator from './algorithems.double-integration';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, StepTable, Conclusion,
  SymbolKey, CommonMistakes,
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
        <SymbolKey rows={[
          { s: 'h,\\ k', t: 'The grid steps in x and in y: h = (b − a)/m, k = (d − c)/n.', e: 'h = k = 0.25' },
          { s: 'f_{ij}', t: 'The function at grid point (xᵢ, yⱼ).', e: 'f(1, 1) = 0.5' },
          { s: 'w_i,\\ w_j', t: 'The one-dimensional weights along x and along y (trapezoidal 1, 2, …, 2, 1; Simpson 1, 4, 2, …, 4, 1).', e: '1, 2, 2, 2, 1' },
          { s: 'w_i w_j', t: 'A grid point’s weight: corners 1, edges 2, inside 4 (trapezoidal).', e: '2 \\times 2 = 4' },
          { s: '\\frac{hk}{4},\\ \\frac{hk}{9}', t: 'The factor in front: trapezoidal and Simpson.', e: '\\dfrac{0.0625}{4}' },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Evaluate <InlineMath math="\int_1^2\int_1^2 \frac{dx\,dy}{x + y}" /> with h = k = 0.25 by the trapezoidal rule.</ExampleProblem>
        <ExampleStep n={1} title="TABULATE f = 1/(x + y)">
          <StepTable
            columns={[{ key: 'y', label: 'y \\ x', bold: true }, { key: 'a', label: '1' }, { key: 'b', label: '1.25' }, { key: 'c', label: '1.5' }, { key: 'd', label: '1.75' }, { key: 'e', label: '2' }]}
            rows={[
              { y: '1', a: '0.500000', b: '0.444444', c: '0.400000', d: '0.363636', e: '0.333333' },
              { y: '1.25', a: '0.444444', b: '0.400000', c: '0.363636', d: '0.333333', e: '0.307692' },
              { y: '1.5', a: '0.400000', b: '0.363636', c: '0.333333', d: '0.307692', e: '0.285714' },
              { y: '1.75', a: '0.363636', b: '0.333333', c: '0.307692', d: '0.285714', e: '0.266667' },
              { y: '2', a: '0.333333', b: '0.307692', c: '0.285714', d: '0.266667', e: '0.250000' },
            ]}
            rowKey={(r) => r.y}
          />
          <StepText>For example <InlineMath math="f(1.25, 1.5) = \dfrac{1}{1.25 + 1.5} = 0.363636" />.</StepText>
        </ExampleStep>
        <ExampleStep n={2} title="THE WEIGHTS">
          <StepText>Each point gets (its x-weight) × (its y-weight). With trapezoidal weights 1, 2, 2, 2, 1 in each direction:</StepText>
          <MathPanel>
            <BlockMath math="\text{corners (weight 1)}: \ 0.5 + 0.333333 + 0.333333 + 0.25 = 1.416667" />
            <BlockMath math="\text{edges (weight 2)}: \ 4.136308, \qquad \text{inside (weight 4)}: \ 3.028372" />
            <BlockMath math="\sum w_i w_j f_{ij} = 1.416667 + 2(4.136308) + 4(3.028372) = 21.802769" />
          </MathPanel>
        </ExampleStep>
        <ExampleStep n={3} title="MULTIPLY BY hk/4">
          <MathPanel>
            <BlockMath math="I \approx \frac{(0.25)(0.25)}{4} \times 21.802769 = 0.015625 \times 21.802769 = 0.340668" />
          </MathPanel>
          <StepText>Simpson&apos;s rule gives 0.3398; the exact value is 0.33979…</StepText>
        </ExampleStep>
        <Conclusion result="I ≈ 0.3407 (trapezoidal)" math={<BlockMath math="I \approx 0.3407" />}>The calculator below opens on this integral.</Conclusion>
      </WorkedExample>
      <CommonMistakes items={[
        { m: <>Using the one-dimensional factor h/2.</>, f: <>Two directions: <InlineMath math="\dfrac{hk}{4}" /> (trapezoidal) or <InlineMath math="\dfrac{hk}{9}" /> (Simpson).</> },
        { m: <>Giving every point the same weight.</>, f: <>Weight = x-weight × y-weight: corners 1, edges 2, inside 4 for trapezoidal.</> },
        { m: <>Odd number of strips with Simpson.</>, f: <>Simpson needs an even number of strips in both directions.</> },
        { m: <>Mixing up x and y.</>, f: <>Keep h for x and k for y, and label the table rows and columns.</> },
        { m: <>Rounding the grid values too early.</>, f: <>Keep 6 decimals; there are many of them to add.</> },
        { m: <>Writing only the final answer.</>, f: <>Show the grid table, the weight groups with their sums, and the factor.</> },
      ]} />
      <Lab heading="Interactive Double Integration Calculator"><DoubleIntegrationCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['trapezoidal', 'simpson-13', 'integral']} />
    </MethodPage>
  );
}
