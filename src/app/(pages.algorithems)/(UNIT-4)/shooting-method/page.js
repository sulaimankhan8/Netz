'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.shooting-method';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why does one secant step suffice for linear equations?", a: <>For a linear ODE, y(b) depends linearly on the slope s, so the secant line through two shots is exact.</> },
  { q: "What if it does not converge?", a: <>For nonlinear equations choose guesses closer to the answer; there may be more than one solution.</> },
  { q: "Why RK4?", a: <>It is accurate (error ~ h⁴), so the miss at x = b reflects the slope, not the integration error.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 4 • BOUNDARY VALUE PROBLEMS & PDEs" title="Shooting Method" subtitle="Boundary Value Problems by Aiming the Slope">
        The <strong>shooting method</strong> guesses the missing slope <InlineMath math={"y'(a)"} />, solves the initial value problem with RK4, and corrects the guess with the secant method until the solution hits <InlineMath math={"y(b) = \\beta"} />.
      </MethodHeader>
      <FormulaBox label="THE CORRECTION" tag="SECANT">
        <Formula math={"s_{k+1} = s_k - \\frac{(y_b(s_k) - \\beta)(s_k - s_{k-1})}{y_b(s_k) - y_b(s_{k-1})}"} />
        <FormulaSteps steps={[
          { title: "1. Two guesses", text: <>For y′(a).</> },
          { title: "2. Shoot", text: <>RK4 to x = b for each.</> },
          { title: "3. Correct", text: <>Secant step on the miss.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve <InlineMath math={"y'' = y"} />, y(0) = 0, y(1) = 1.</ExampleProblem>
        <ExampleStep n={1} title="SHOOT"><MathPanel><BlockMath math={"s = 0 \\Rightarrow y(1) = 0, \\qquad s = 1 \\Rightarrow y(1) = 1.1752"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="SECANT"><MathPanel><BlockMath math={"s = 1 - \\frac{(1.1752 - 1)(1 - 0)}{1.1752 - 0} = 0.8509"} /></MathPanel><StepText>For a linear equation one secant step is exact.</StepText></ExampleStep>
        <Conclusion result="y′(0) ≈ 0.8509" math={<BlockMath math={"y'(0) = \\frac{1}{\\sinh 1} \\approx 0.8509"} />}>The calculator below opens on this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Shooting Method Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["finite-difference-bvp","runge-kutta","secant"]} />
    </MethodPage>
  );
}
