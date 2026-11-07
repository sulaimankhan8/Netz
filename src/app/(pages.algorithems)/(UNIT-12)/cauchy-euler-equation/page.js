'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.cauchy-euler-equation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why does x = eᵗ work?', a: <>With <InlineMath math="\theta = \frac{d}{dt}" />, <InlineMath math="xD = \theta" /> and <InlineMath math="x^2D^2 = \theta(\theta - 1)" />, so every xᵏDᵏ becomes a polynomial in θ: the equation has constant coefficients in t.</> },
  { q: 'What is Legendre\'s equation?', a: <>The same idea with <InlineMath math="(ax + b)" /> in place of x: put <InlineMath math="ax + b = e^t" />. NETZ recognises coefficients like <InlineMath math="(2x + 3)^2" />.</> },
  { q: 'Why do logs appear in the answer?', a: <>Because t = ln x: a term like <InlineMath math="te^{t}" /> becomes <InlineMath math="x\ln x" />, and <InlineMath math="\cos t" /> becomes <InlineMath math="\cos(\ln x)" />.</> },
];

export default function CauchyEulerPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Cauchy–Euler and Legendre Equations" subtitle="Variable Coefficients xᵏ, Made Constant">
        In a <strong>Cauchy–Euler equation</strong> each <InlineMath math="y^{(k)}" /> has the coefficient <InlineMath math="a_kx^k" />. Put <InlineMath math="x = e^t" /> and it becomes a constant-coefficient equation in t; solve, then put <InlineMath math="t = \ln x" />.
      </MethodHeader>
      <FormulaBox label="THE SUBSTITUTION" tag="x = eᵗ">
        <Formula math={'x\\frac{dy}{dx} = \\theta y, \\quad x^2\\frac{d^2y}{dx^2} = \\theta(\\theta - 1)y, \\quad \\theta = \\frac{d}{dt}'} />
        <FormulaSteps steps={[
          { title: '1. Substitute', text: <>xᵏDᵏ becomes a polynomial in θ.</> },
          { title: '2. Solve in t', text: <>CF + PI as usual.</> },
          { title: '3. Back to x', text: <>t = ln x.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve <InlineMath math="x^2y'' - xy' + y = \ln x" />.</ExampleProblem>
        <ExampleStep n={1} title="IN t"><MathPanel><BlockMath math="(\theta(\theta - 1) - \theta + 1)y = t \;\Rightarrow\; (\theta - 1)^2y = t" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="SOLVE"><MathPanel><BlockMath math="\text{CF} = (C_1 + C_2t)e^{t}, \qquad \text{PI} = t + 2" /></MathPanel><StepText>Put t = ln x and eᵗ = x.</StepText></ExampleStep>
        <Conclusion result="y = (C₁ + C₂ ln x)x + ln x + 2" math={<BlockMath math="y = (C_1 + C_2\ln x)\,x + \ln x + 2" />}>The calculator below opens on this equation.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Cauchy–Euler Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['ode-cc', 'variation-of-parameters', 'ode-solver']} />
    </MethodPage>
  );
}
