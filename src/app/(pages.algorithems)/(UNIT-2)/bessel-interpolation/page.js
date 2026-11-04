'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import BesselCalculator from './algorithems.bessel-interpolation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: "When should you use Bessel's formula?",
    a: <>When x is roughly halfway between two middle points of the table: it works best for <InlineMath math="\tfrac{1}{4} \le p \le \tfrac{3}{4}" />. At exactly <InlineMath math="p = \tfrac{1}{2}" /> every odd-order term is 0, which makes the working short.</>,
  },
  {
    q: "What is the difference between Bessel's and Stirling's formulas?",
    a: <>Stirling centres on one tabulated point and suits p near 0. Bessel centres on the midpoint between two points and suits p near ½. Both use central differences.</>,
  },
  {
    q: 'Why does the formula start with the mean of y₀ and y₁?',
    a: <>Because it is built around the midpoint between <InlineMath math="x_0" /> and <InlineMath math="x_1" />. The later terms correct that first guess using the curvature of the data.</>,
  },
];

export default function BesselPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 2 • EQUAL INTERVAL INTERPOLATION" title="Bessel's Formula" subtitle="Interpolating Halfway">
        <strong>Bessel&apos;s formula</strong> interpolates between two middle points <InlineMath math="x_0" /> and <InlineMath math="x_1" /> of an equally spaced table. It starts from their average, <InlineMath math="\frac{y_0 + y_1}{2}" />, and adds central-difference corrections.
      </MethodHeader>

      <FormulaBox label="BESSEL'S FORMULA" tag="BEST FOR ¼ ≤ p ≤ ¾">
        <Formula math={`\\begin{gathered} y = \\frac{y_0 + y_1}{2} + \\left(p - \\tfrac{1}{2}\\right)\\Delta y_0 \\\\ + \\frac{p(p - 1)}{2!}\\cdot\\frac{\\Delta^2 y_{-1} + \\Delta^2 y_0}{2} \\\\ + \\frac{\\left(p - \\tfrac{1}{2}\\right)p(p - 1)}{3!}\\Delta^3 y_{-1} + \\cdots \\\\ p = \\frac{x - x_0}{h} \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Pick x₀ and x₁', text: <>The two tabulated points either side of x.</> },
            { title: '2. Find p', text: <><InlineMath math="p = (x - x_0)/h" />, somewhere between 0 and 1, ideally near ½.</> },
            { title: '3. Average, then Correct', text: <>Start from the mean of y₀ and y₁; even orders use the mean of two differences.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          From x = 1, 2, 3, 4, 5 and y = 1, 8, 27, 64, 125, estimate y at x = 3.5.
        </ExampleProblem>

        <ExampleStep n={1} title="CHOOSE x₀ AND p">
          <MathPanel>
            <BlockMath math="x_0 = 3, \ x_1 = 4, \quad p = \frac{3.5 - 3}{1} = 0.5" />
          </MathPanel>
          <StepText>At <InlineMath math="p = \tfrac{1}{2}" /> the factor <InlineMath math="p - \tfrac{1}{2} = 0" />, so every odd-order term drops out.</StepText>
        </ExampleStep>

        <ExampleStep n={2} title="THE TERMS THAT REMAIN">
          <MathPanel>
            <BlockMath math="\frac{y_0 + y_1}{2} = \frac{27 + 64}{2} = 45.5" />
            <BlockMath math="\frac{p(p - 1)}{2}\cdot\frac{\Delta^2 y_{-1} + \Delta^2 y_0}{2} = \frac{0.5 \times (-0.5)}{2} \times \frac{18 + 24}{2} = -2.625" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="ADD THEM UP">
          <MathPanel>
            <BlockMath math="y(3.5) \approx 45.5 - 2.625 = 42.875" />
          </MathPanel>
          <StepText>The data come from <InlineMath math="y = x^3" />, and <InlineMath math="3.5^3 = 42.875" /> exactly.</StepText>
        </ExampleStep>

        <Conclusion result="y(3.5) ≈ 42.875" math={<BlockMath math="y(3.5) = 42.875" />}>
          The calculator below opens on this table and tints the differences it used.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Bessel Calculator">
        <BesselCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['stirling', 'gauss-forward', 'gauss-backward', 'difference-table']} />
    </MethodPage>
  );
}
