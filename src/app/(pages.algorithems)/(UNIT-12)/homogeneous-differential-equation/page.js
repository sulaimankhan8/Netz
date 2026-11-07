'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.homogeneous-differential-equation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What makes an equation homogeneous?', a: <>dy/dx = F(x, y) where F depends only on y/x, i.e. <InlineMath math="F(tx, ty) = F(x, y)" />. A test: every term of the top and bottom of a fraction has the same total degree.</> },
  { q: 'Why put y = vx?', a: <>Then <InlineMath math="\frac{dy}{dx} = v + x\frac{dv}{dx}" /> and F becomes a function of v alone, so the equation separates in v and x.</> },
  { q: 'Is this the same "homogeneous" as in linear equations?', a: <>No. For linear equations &quot;homogeneous&quot; means the right side is 0. Here it means F depends on y/x only.</> },
];

export default function HomogeneousOdePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Homogeneous Differential Equations" subtitle="Substitute y = vx, Then Separate">
        A first-order equation is <strong>homogeneous</strong> when <InlineMath math="\frac{dy}{dx} = F\left(\frac{y}{x}\right)" />. Putting <InlineMath math="y = vx" /> turns it into a separable equation in v and x.
      </MethodHeader>
      <FormulaBox label="THE SUBSTITUTION" tag="y = vx">
        <Formula math={'v + x\\frac{dv}{dx} = F(v) \\;\\Rightarrow\\; \\int \\frac{dv}{F(v) - v} = \\ln|x| + C'} />
        <FormulaSteps steps={[
          { title: '1. Test', text: <>F(tx, ty) = F(x, y).</> },
          { title: '2. y = vx', text: <>dy/dx = v + x dv/dx.</> },
          { title: '3. Separate', text: <>Integrate, then put v = y/x.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve <InlineMath math="\frac{dy}{dx} = \frac{x + y}{x}" />.</ExampleProblem>
        <ExampleStep n={1} title="SUBSTITUTE"><MathPanel><BlockMath math="v + x\frac{dv}{dx} = 1 + v \;\Rightarrow\; x\frac{dv}{dx} = 1" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="INTEGRATE"><MathPanel><BlockMath math="v = \ln|x| + C" /></MathPanel><StepText>Put back v = y/x.</StepText></ExampleStep>
        <Conclusion result="y = x(ln|x| + C)" math={<BlockMath math="\frac{y}{x} = \ln|x| + C" />}>The calculator below opens on this equation.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Homogeneous Equation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['variable-separable', 'exact-ode', 'ode-solver']} />
    </MethodPage>
  );
}
