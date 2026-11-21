'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import NewtonSystemCalculator from './algorithems.newton-raphson-system';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, StepTable, Conclusion,
  SymbolKey, CommonMistakes,
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
        <SymbolKey rows={[
          { s: 'f_1,\\ f_2', t: 'The equations written as "= 0".', e: 'f_1 = x^2 + y - 11' },
          { s: 'X_n', t: 'The current guess for the solution (a point).', e: 'X_0 = (3.5, -1.8)' },
          { s: 'F(X_n)', t: 'The values of the equations at the guess: how far from 0 they are.', e: 'F(X_0) = (-0.55, -0.26)' },
          { s: 'J', t: 'The Jacobian: all the partial derivatives. It plays the part of f′ in ordinary Newton–Raphson.', e: 'J = \\begin{bmatrix} 2x & 1 \\\\ 1 & 2y \\end{bmatrix}' },
          { s: '\\Delta', t: 'The correction: solve J Δ = −F, then X₍ₙ₊₁₎ = Xₙ + Δ.', e: '\\Delta = (0.085, -0.048)' },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve <InlineMath math="x^2 + y = 11, \ x + y^2 = 7" /> starting from <InlineMath math="(x_0, y_0) = (3.5, -1.8)" />, until x and y change by less than 0.0001.</ExampleProblem>
        <ExampleStep n={1} title="WRITE AS f = 0 AND FIND THE JACOBIAN">
          <MathPanel>
            <BlockMath math="f_1 = x^2 + y - 11, \qquad f_2 = x + y^2 - 7" />
            <BlockMath math="J = \begin{bmatrix} \frac{\partial f_1}{\partial x} & \frac{\partial f_1}{\partial y} \\ \frac{\partial f_2}{\partial x} & \frac{\partial f_2}{\partial y} \end{bmatrix} = \begin{bmatrix} 2x & 1 \\ 1 & 2y \end{bmatrix}" />
          </MathPanel>
        </ExampleStep>
        <ExampleStep n={2} title="ITERATION 1 IN FULL">
          <MathPanel>
            <BlockMath math="f_1(3.5, -1.8) = 12.25 - 1.8 - 11 = -0.55, \qquad f_2(3.5, -1.8) = 3.5 + 3.24 - 7 = -0.26" />
            <BlockMath math="J = \begin{bmatrix} 7 & 1 \\ 1 & -3.6 \end{bmatrix}: \qquad 7\Delta x + \Delta y = 0.55, \qquad \Delta x - 3.6\Delta y = 0.26" />
            <BlockMath math="\Delta x = 0.085496, \quad \Delta y = -0.048473 \quad\Rightarrow\quad (x_1, y_1) = (3.585496,\ -1.848473)" />
          </MathPanel>
          <StepText>Solve the 2 × 2 system <InlineMath math="J\Delta = -F" /> (by elimination or Cramer&apos;s rule), then add Δ to the point.</StepText>
        </ExampleStep>
        <ExampleStep n={3} title="ITERATION 2 IN FULL">
          <MathPanel>
            <BlockMath math="F(3.585496, -1.848473) = (0.007310,\ 0.002350), \qquad J = \begin{bmatrix} 7.170992 & 1 \\ 1 & -3.696947 \end{bmatrix}" />
            <BlockMath math="\Delta = (-0.001068,\ 0.000347) \quad\Rightarrow\quad (x_2, y_2) = (3.584428,\ -1.848127)" />
          </MathPanel>
        </ExampleStep>
        <ExampleStep n={4} title="ITERATION TABLE">
          <StepTable
            columns={[{ key: 'k', label: 'n', bold: true }, { key: 'f', label: 'F before the step' }, { key: 'd', label: 'Δ' }, { key: 'p', label: '(xₙ, yₙ)', highlight: true }]}
            rows={[
              { k: 1, f: '(−0.55, −0.26)', d: '(0.085496, −0.048473)', p: '(3.585496, −1.848473)' },
              { k: 2, f: '(0.007310, 0.002350)', d: '(−0.001068, 0.000347)', p: '(3.584428, −1.848127)' },
              { k: 3, f: '(0.0000011, 0.0000001)', d: '(≈ 0, ≈ 0)', p: '(3.584428, −1.848127)' },
            ]}
            rowKey={(r) => r.k}
          />
          <StepText>The change in iteration 3 is below 0.0001, so stop. Check: <InlineMath math="3.584428^2 - 1.848127 = 11.0000" />.</StepText>
        </ExampleStep>
        <Conclusion result="(3.584428, −1.848127)" math={<BlockMath math="x \approx 3.584428, \quad y \approx -1.848127" />}>The first example button below loads this system.</Conclusion>
      </WorkedExample>
      <CommonMistakes items={[
        { m: <>Forgetting to move everything to one side.</>, f: <>Write each equation as <InlineMath math="f = 0" /> first: <InlineMath math="x^2 + y = 11" /> becomes <InlineMath math="x^2 + y - 11 = 0" />.</> },
        { m: <>Putting the partial derivatives in the wrong places.</>, f: <>Row i is equation i; column 1 is ∂/∂x, column 2 is ∂/∂y.</> },
        { m: <>Solving <InlineMath math="J\Delta = F" /> instead of <InlineMath math="-F" />.</>, f: <>The right-hand side is <InlineMath math="-F" />: here <InlineMath math="(0.55,\ 0.26)" />.</> },
        { m: <>Using the old Jacobian in later steps.</>, f: <>Work out J again at every new point.</> },
        { m: <>A poor starting point.</>, f: <>Newton can jump to another solution or fail; start near the answer (e.g. from a sketch of the two curves).</> },
        { m: <>Writing only the final answer.</>, f: <>Show F, J and Δ for the first iteration, and a table of all iterations.</> },
      ]} />
      <Lab heading="Interactive Newton System Solver"><NewtonSystemCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['newton-raphson', 'system-of-equations', 'gauss-seidel']} />
    </MethodPage>
  );
}
