'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SplineCalculator from './algorithems.cubic-spline';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion, CommonMistakes, SymbolKey,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'Why use a cubic spline instead of one big polynomial?',
    a: <>A single high-degree polynomial through many points can swing wildly between them (Runge&apos;s phenomenon). A spline uses a separate cubic on each interval, joined smoothly, so it stays close to the data.</>,
  },
  {
    q: 'What is the difference between a natural and a clamped spline?',
    a: <>A natural spline sets the second derivative to 0 at both ends, so the curve straightens out there. A clamped spline fixes the slope at each end to values you give, which is better when you know them.</>,
  },
  {
    q: 'Why is the system tridiagonal?',
    a: <>Each equation links only <InlineMath math="M_{i-1}" />, <InlineMath math="M_i" /> and <InlineMath math="M_{i+1}" />, so the matrix has entries only on three diagonals. That is why it can be solved quickly by the Thomas algorithm.</>,
  },
];

export default function SplinePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 2 • UNEQUAL INTERVAL INTERPOLATION" title="Cubic Spline" subtitle="Natural & Clamped">
        A <strong>cubic spline</strong> joins the data points with a separate cubic on each interval, matched so the curve, its slope and its curvature are continuous at every point. The unknowns are the second derivatives <InlineMath math="M_i = S''(x_i)" />.
      </MethodHeader>

      <FormulaBox label="THE SPLINE EQUATIONS" tag="WORKS FOR UNEQUAL STEPS">
        <Formula math={`h_{i-1}M_{i-1} + 2(h_{i-1} + h_i)M_i + h_iM_{i+1} = 6\\left[\\frac{y_{i+1} - y_i}{h_i} - \\frac{y_i - y_{i-1}}{h_{i-1}}\\right]`} />
        <FormulaSteps
          steps={[
            { title: '1. One Equation per Inner Point', text: <>Write the equation above for each interior <InlineMath math="x_i" />.</> },
            { title: '2. End Conditions', text: <>Natural: <InlineMath math="M_0 = M_n = 0" />. Clamped: two extra equations from the end slopes.</> },
            { title: '3. Solve, then Evaluate', text: <>Solve for the M&apos;s, then use the piece for the interval containing x.</> },
          ]}
        />
        <SymbolKey rows={[
          { s: 'h_i', t: 'The gap between neighbouring x values: x₍ᵢ₊₁₎ − xᵢ (they may differ).', e: 'h = 1' },
          { s: 'M_i', t: 'The second derivative of the spline at xᵢ (its bending). Finding these is the main job.', e: 'M_1 = 1.5' },
          { s: 'M_0 = M_n = 0', t: 'Natural spline: no bending at the two ends.', e: '' },
          { s: 'S_i(x)', t: 'The cubic piece used between xᵢ and x₍ᵢ₊₁₎.', e: 'S_0(x) = 2 + 0.75(x-1) + 0.25(x-1)^3' },
          { s: '6\\left[\\dots\\right]', t: 'Six times the change in slope at xᵢ: the right-hand side of each equation.', e: '6[(5-3) - (3-2)] = 6' },
        ]} />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Fit a natural cubic spline through (1, 2), (2, 3), (3, 5) and estimate y at x = 1.5.
        </ExampleProblem>

        <ExampleStep n={1} title="THE EQUATION FOR THE MIDDLE POINT">
          <StepText>Here h = 1 and natural means <InlineMath math="M_0 = M_2 = 0" />:</StepText>
          <MathPanel>
            <BlockMath math="M_0 + 4M_1 + M_2 = 6\left[(5 - 3) - (3 - 2)\right] = 6 \;\Rightarrow\; M_1 = 1.5" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="THE PIECE ON [1, 2]">
          <StepText>Each piece is built from the M values at its two ends:</StepText>
          <MathPanel>
            <BlockMath math="S_i(x) = \frac{M_i(x_{i+1} - x)^3 + M_{i+1}(x - x_i)^3}{6h} + \left(y_i - \frac{M_i h^2}{6}\right)\frac{x_{i+1} - x}{h} + \left(y_{i+1} - \frac{M_{i+1} h^2}{6}\right)\frac{x - x_i}{h}" />
            <BlockMath math="S_0(x) = \frac{0 + 1.5(x - 1)^3}{6} + (2 - 0)(2 - x) + \left(3 - \frac{1.5}{6}\right)(x - 1)" />
            <BlockMath math="= 0.25(x - 1)^3 + 2(2 - x) + 2.75(x - 1) = 2 + 0.75(x - 1) + 0.25(x - 1)^3" />
          </MathPanel>
          <StepText>Check: <InlineMath math="S_0(1) = 2" />, <InlineMath math="S_0(2) = 2 + 0.75 + 0.25 = 3" /> ✓</StepText>
        </ExampleStep>

        <ExampleStep n={3} title="EVALUATE AT 1.5">
          <MathPanel>
            <BlockMath math="S_0(1.5) = 2 + 0.75(0.5) + 0.25(0.5)^3 = 2 + 0.375 + 0.03125 = 2.40625" />
          </MathPanel>
        </ExampleStep>

        <Conclusion result="y(1.5) ≈ 2.40625" math={<BlockMath math="S(1.5) = 2.40625" />}>
          The calculator below opens on these points, shows the system and every piece, and draws the spline.
        </Conclusion>
      </WorkedExample>

      <CommonMistakes items={[
        { m: <>Forgetting the end conditions.</>, f: <>For a natural spline set <InlineMath math="M_0 = M_n = 0" /> before solving; there is one equation per inner point.</> },
        { m: <>Using the wrong right-hand side.</>, f: <>It is six times the change in slope: <InlineMath math="6\left[\dfrac{y_{i+1}-y_i}{h_i} - \dfrac{y_i - y_{i-1}}{h_{i-1}}\right]" />.</> },
        { m: <>Using one cubic for the whole range.</>, f: <>Each interval has its own piece <InlineMath math="S_i" />; pick the piece whose interval contains x.</> },
        { m: <>Assuming equal steps.</>, f: <>Keep each <InlineMath math="h_i" /> separate when the x gaps differ.</> },
        { m: <>Not checking the pieces.</>, f: <>Each piece must pass through both end points: <InlineMath math="S_0(1) = 2" />, <InlineMath math="S_0(2) = 3" />.</> },
        { m: <>Writing only the final answer.</>, f: <>Show the equations for the M values, their solution, the piece used, and the evaluation.</> },
      ]} />

      <Lab heading="Interactive Cubic Spline Calculator">
        <SplineCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['lagrange', 'newton-divided', 'difference-table']} />
    </MethodPage>
  );
}
