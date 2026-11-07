'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Taylor2VarCalculator from './algorithems.taylor-series-two-variables';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Where do the binomial numbers 1, 2, 1 and 1, 3, 3, 1 come from?', a: <>The degree-k terms are <InlineMath math="\frac{1}{k!}\left(h\frac{\partial}{\partial x} + k\frac{\partial}{\partial y}\right)^k f" />. Expanding the bracket gives binomial coefficients, as in <InlineMath math="h^2f_{xx} + 2hk\,f_{xy} + k^2f_{yy}" />.</> },
  { q: 'What is the Maclaurin series of f(x, y)?', a: <>The Taylor series about (0, 0). Then h = x and k = y, so the polynomial is in powers of x and y.</> },
  { q: 'How accurate is the polynomial?', a: <>Near the point, the error shrinks like the distance to the power (degree + 1). The calculator checks this numerically.</> },
];

export default function Taylor2VarPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • MULTIVARIABLE CALCULUS" title="Taylor Series in Two Variables" subtitle="Expand f(x, y) About a Point">
        The <strong>Taylor series</strong> of f(x, y) about (a, b) uses the partial derivatives at that point, with <InlineMath math="h = x - a" /> and <InlineMath math="k = y - b" />. Choose the degree, from 1 to 4.
      </MethodHeader>
      <FormulaBox label="THE EXPANSION" tag="h = x − a, k = y − b">
        <Formula math={'f(a + h, b + k) = f + (hf_x + kf_y) + \\frac{1}{2!}(h^2f_{xx} + 2hk\\,f_{xy} + k^2f_{yy}) + \\cdots'} />
        <FormulaSteps steps={[
          { title: '1. Derivatives', text: <>All partials up to the degree you want.</> },
          { title: '2. At the point', text: <>Put x = a, y = b.</> },
          { title: '3. Assemble', text: <>Multiply by powers of h and k.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Expand <InlineMath math="e^x\sin y" /> about (0, 0) up to third-degree terms.</ExampleProblem>
        <ExampleStep n={1} title="DERIVATIVES AT (0, 0)"><MathPanel><BlockMath math="f = 0, \ f_x = 0, \ f_y = 1, \ f_{xy} = 1, \ f_{xxy} = 1, \ f_{yyy} = -1" /></MathPanel><StepText>All the others are 0 at the origin.</StepText></ExampleStep>
        <ExampleStep n={2} title="ASSEMBLE"><MathPanel><BlockMath math="y + \frac{2xy}{2!} + \frac{3x^2y - y^3}{3!}" /></MathPanel></ExampleStep>
        <Conclusion result="y + xy + x²y/2 − y³/6" math={<BlockMath math="e^x\sin y \approx y + xy + \frac{1}{2}x^2y - \frac{1}{6}y^3" />}>The calculator below opens on this function.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Two-Variable Taylor Calculator"><Taylor2VarCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['taylor-series', 'partial-derivative', 'maxima-minima-2var']} />
    </MethodPage>
  );
}
