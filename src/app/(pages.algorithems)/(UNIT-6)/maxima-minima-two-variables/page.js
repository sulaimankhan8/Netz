'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MaximaMinima2VarCalculator from './algorithems.maxima-minima-two-variables';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What is a saddle point?', a: <>A critical point that is a maximum in one direction and a minimum in another, like the middle of a horse saddle. There <InlineMath math="rt - s^2 < 0" />.</> },
  { q: 'What if rt − s² = 0?', a: <>The test gives no answer. Look at f near the point: for <InlineMath math="x^4 + y^4" /> at (0, 0) it is a minimum, for <InlineMath math="x^3 + y^3" /> it is neither.</> },
  { q: 'What do the r, s, t letters mean?', a: <>The textbook (Monge) notation for second partials: <InlineMath math="r = f_{xx}, \ s = f_{xy}, \ t = f_{yy}" />. In the Hessian, rt − s² is its determinant.</> },
];

export default function MaximaMinima2VarPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • MULTIVARIABLE CALCULUS" title="Maxima and Minima of Two Variables" subtitle="Critical Points, rt − s² and Saddle Points">
        Find the <strong>maxima, minima and saddle points</strong> of f(x, y): solve <InlineMath math="f_x = 0, f_y = 0" />, then test each point with <InlineMath math="rt - s^2" />. A contour plot shows them.
      </MethodHeader>
      <FormulaBox label="THE SECOND DERIVATIVE TEST" tag="rt − s²">
        <Formula math={'rt - s^2 > 0: \\ \\begin{cases} r < 0 & \\text{maximum} \\\\ r > 0 & \\text{minimum} \\end{cases} \\qquad rt - s^2 < 0: \\ \\text{saddle point}'} />
        <FormulaSteps steps={[
          { title: '1. Critical points', text: <>Solve f_x = 0 and f_y = 0 together.</> },
          { title: '2. r, s, t', text: <>Second partials at each point.</> },
          { title: '3. Decide', text: <>Sign of rt − s², then of r.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the extreme values of <InlineMath math="f = x^3 + y^3 - 3xy" />.</ExampleProblem>
        <ExampleStep n={1} title="CRITICAL POINTS"><MathPanel><BlockMath math="f_x = 3x^2 - 3y = 0, \ f_y = 3y^2 - 3x = 0 \Rightarrow (0, 0), \ (1, 1)" /></MathPanel><StepText>y = x², so x⁴ = x: x = 0 or 1.</StepText></ExampleStep>
        <ExampleStep n={2} title="TEST"><MathPanel><BlockMath math="r = 6x, \ s = -3, \ t = 6y" /></MathPanel><StepText>At (0, 0): rt − s² = −9 &lt; 0, a saddle point. At (1, 1): rt − s² = 27 &gt; 0 and r = 6 &gt; 0, a minimum.</StepText></ExampleStep>
        <Conclusion result="Minimum −1 at (1, 1)" math={<BlockMath math="f_{\min} = f(1, 1) = -1" />}>The calculator below opens on this function.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Maxima & Minima Calculator"><MaximaMinima2VarCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['lagrange-multipliers', 'maxima-minima', 'partial-derivative']} />
    </MethodPage>
  );
}
