'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import LagrangeCalculator from './algorithems.lagrange-multipliers';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why does ∇f = λ∇φ work?', a: <>At the best point on the constraint, the level curve of f just touches the constraint curve, so their normals (the gradients) point the same way.</> },
  { q: 'What does λ mean?', a: <>How fast the best value of f changes if the constraint constant changes: <InlineMath math="\lambda = \frac{df^{*}}{dc}" />. Economists call it the shadow price.</> },
  { q: 'How do I know which point is the maximum?', a: <>Work out f at every candidate. On a closed, bounded constraint (circle, ellipse, sphere) the largest is the maximum and the smallest the minimum.</> },
];

export default function LagrangePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • MULTIVARIABLE CALCULUS" title="Lagrange Multipliers" subtitle="Constrained Maxima and Minima">
        Find the largest and smallest values of f(x, y) or f(x, y, z) on a constraint φ = 0. Solve <InlineMath math="\nabla f = \lambda \nabla \varphi" /> together with the constraint, then compare f at the solutions.
      </MethodHeader>
      <FormulaBox label="THE CONDITIONS" tag="∇f = λ∇φ">
        <Formula math={'f_x = \\lambda\\varphi_x, \\quad f_y = \\lambda\\varphi_y, \\quad \\varphi(x, y) = 0'} />
        <FormulaSteps steps={[
          { title: '1. Write φ = 0', text: <>Move everything in the constraint to one side.</> },
          { title: '2. Equations', text: <>One per variable, plus the constraint.</> },
          { title: '3. Compare', text: <>f at every solution.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the maximum of <InlineMath math="f = x + y" /> on the circle <InlineMath math="x^2 + y^2 = 1" />.</ExampleProblem>
        <ExampleStep n={1} title="EQUATIONS"><MathPanel><BlockMath math="1 = 2\lambda x, \quad 1 = 2\lambda y, \quad x^2 + y^2 = 1" /></MathPanel><StepText>The first two give x = y.</StepText></ExampleStep>
        <ExampleStep n={2} title="SOLVE"><MathPanel><BlockMath math="2x^2 = 1 \Rightarrow x = y = \pm\frac{\sqrt{2}}{2}, \quad f = \pm\sqrt{2}" /></MathPanel></ExampleStep>
        <Conclusion result="Maximum √2, minimum −√2" math={<BlockMath math="f_{\max} = \sqrt{2} \text{ at } \left(\tfrac{\sqrt{2}}{2}, \tfrac{\sqrt{2}}{2}\right)" />}>The calculator below opens on this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Lagrange Multiplier Calculator"><LagrangeCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['maxima-minima-2var', 'partial-derivative', 'maxima-minima']} />
    </MethodPage>
  );
}
