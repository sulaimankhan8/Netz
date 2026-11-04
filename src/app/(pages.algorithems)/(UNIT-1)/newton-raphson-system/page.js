'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import NewtonSystemCalculator from './algorithems.newton-raphson-system';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'How is this related to the ordinary Newton–Raphson method?', a: <>For one equation, <InlineMath math="x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}" />. For a system, the derivative becomes the Jacobian matrix J and dividing becomes solving the linear system <InlineMath math="J\Delta = -F" />.</> },
  { q: 'Why did it fail with "the Jacobian is singular"?', a: <>At that point the equations&apos; tangent planes are parallel, so the linear system has no unique solution. Start from a different point.</> },
  { q: 'How do I choose a starting point?', a: <>Sketch the two curves and start near where they cross. Newton&apos;s method converges very fast (quadratically) near a solution, but can wander off from a poor start.</> },
];

export default function NewtonSystemPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • ROOTS OF EQUATIONS" title="Newton's Method for Systems" subtitle="Nonlinear Equations with the Jacobian Matrix">
        Solve two or three <strong>nonlinear equations</strong> together. Each step solves the linear system <InlineMath math="J(X_n)\,\Delta = -F(X_n)" /> and moves to <InlineMath math="X_{n+1} = X_n + \Delta" />.
      </MethodHeader>
      <FormulaBox label="THE ITERATION" tag="J Δ = −F">
        <Formula math={`J = \\begin{bmatrix} \\frac{\\partial f_1}{\\partial x} & \\frac{\\partial f_1}{\\partial y} \\\\ \\frac{\\partial f_2}{\\partial x} & \\frac{\\partial f_2}{\\partial y} \\end{bmatrix}, \\qquad X_{n+1} = X_n - J(X_n)^{-1} F(X_n)`} />
        <FormulaSteps steps={[
          { title: '1. Jacobian', text: <>Partial derivatives of each equation.</> },
          { title: '2. Linear step', text: <>Solve J Δ = −F at the current point.</> },
          { title: '3. Repeat', text: <>Until the change Δ is below the tolerance.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve <InlineMath math="x^2 + y = 11, \ x + y^2 = 7" /> starting from (3.5, −1.8).</ExampleProblem>
        <ExampleStep n={1} title="JACOBIAN"><MathPanel><BlockMath math="f_1 = x^2 + y - 11, \ f_2 = x + y^2 - 7, \qquad J = \begin{bmatrix} 2x & 1 \\ 1 & 2y \end{bmatrix}" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="ITERATE"><StepText>Three iterations change x and y by less than 0.0001.</StepText></ExampleStep>
        <Conclusion result="(3.584428, −1.848127)" math={<BlockMath math="x \approx 3.584428, \quad y \approx -1.848127" />}>The first example button below loads this system.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Newton System Solver"><NewtonSystemCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['newton-raphson', 'system-of-equations', 'gauss-seidel']} />
    </MethodPage>
  );
}
