'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import NewtonRaphsonMethod from './aldorithems.newton-raphson';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, IterationPanel, StepTable, Conclusion,
} from '@/app/components/method';

const ITERATIONS = [
  { k: 1, xn: '2.000000', fxn: '-1.000000', fpxn: '4.000000', xnext: '2.250000', err: '0.250000' },
  { k: 2, xn: '2.250000', fxn: '+0.062500', fpxn: '4.500000', xnext: '2.236111', err: '0.013889' },
  { k: 3, xn: '2.236111', fxn: '+0.000193', fpxn: '4.472222', xnext: '2.236068', err: '0.000043' },
  { k: 4, xn: '2.236068', fxn: '0.000000', fpxn: '4.472136', xnext: '2.236068', err: '0.000000' },
];

const COLUMNS = [
  { key: 'k', label: 'Iteration (k)', bold: true },
  { key: 'xn', label: 'Current Guess (x_n)' },
  { key: 'fxn', label: 'f(x_n)' },
  { key: 'fpxn', label: "f'(x_n)" },
  { key: 'xnext', label: 'Next Guess (x_n+1)', highlight: true },
  { key: 'err', label: 'Error (|x_n+1 - x_n|)', bold: true },
];

export default function NewtonRaphsonMethods() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • FINDING ROOTS OF EQUATIONS" title="Newton-Raphson" subtitle="Tangent Line Method">
        The <strong>Newton-Raphson Method</strong> is a second-order root-finding algorithm that uses the tangent slope derivative <InlineMath math="f'(x_n)" /> at the current point <InlineMath math="x_n" /> to slide down the curve directly toward the zero crossing with quadratic speed!
      </MethodHeader>

      <FormulaBox label="HOW NEWTON-RAPHSON WORKS" tag="QUADRATIC CONVERGENCE">
        <Formula math={`x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}`} />
        <FormulaSteps
          steps={[
            { title: '1. Current State (x_n)', text: <>Start with initial guess <InlineMath math="x_0" />.</> },
            { title: "2. Compute Derivative f'(x_n)", text: <>Evaluate tangent slope derivative <InlineMath math="f'(x_n) \neq 0" />.</> },
            { title: '3. Tangent Intercept Step', text: <>Subtract ratio <InlineMath math="\frac{f(x_n)}{f'(x_n)}" /> to slide directly along tangent line to <InlineMath math="x_{n+1}" />.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Find the root of <InlineMath math="f(x) = x^2 - 5 = 0" /> starting with initial guess <InlineMath math="x_0 = 2" />.
        </ExampleProblem>

        <ExampleStep n={1} title="DERIVE SYMBOLIC DERIVATIVE" space={2}>
          <StepText>Find derivative <InlineMath math="f'(x)" /> and formulate iteration formula:</StepText>
          <MathPanel>
            <BlockMath math="f(x) = x^2 - 5 \implies f'(x) = 2x" />
            <BlockMath math="x_{n+1} = x_n - \frac{x_n^2 - 5}{2x_n} = \frac{2x_n^2 - x_n^2 + 5}{2x_n} = \frac{x_n^2 + 5}{2x_n}" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="COMPUTE FIRST NEWTON STEP (x₁)">
          <StepText>Plug initial guess <InlineMath math="x_0 = 2" /> into function and derivative:</StepText>
          <MathPanel>
            <BlockMath math="f(2) = 2^2 - 5 = -1, \quad f'(2) = 2(2) = 4" />
            <BlockMath math="x_1 = 2 - \frac{-1}{4} = 2 + 0.25 = 2.25" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="COMPUTE SECOND NEWTON STEP (x₂)">
          <StepText>Evaluate at <InlineMath math="x_1 = 2.25" />:</StepText>
          <MathPanel>
            <BlockMath math="f(2.25) = (2.25)^2 - 5 = 5.0625 - 5 = +0.0625, \quad f'(2.25) = 2(2.25) = 4.5" />
            <BlockMath math="x_2 = 2.25 - \frac{0.0625}{4.5} = 2.25 - 0.01388889 = 2.236111" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={4} title="SUBSEQUENT ITERATIONS WALKTHROUGH" space={4}>
          <IterationPanel label="Iteration 3:">
            <div>Function Value: <InlineMath math="f(2.236111) = (2.236111)^2 - 5 = +0.000193" /></div>
            <div>Derivative Value: <InlineMath math="f'(2.236111) = 4.472222" /></div>
            <div>Next Guess: <InlineMath math="x_3 = 2.236111 - \frac{0.000193}{4.472222} = 2.236068" /></div>
          </IterationPanel>
        </ExampleStep>

        <ExampleStep n={5} title="ITERATION SUMMARY TABLE">
          <StepTable columns={COLUMNS} rows={ITERATIONS} rowKey={(r) => r.k} />
        </ExampleStep>

        <Conclusion
          result="Approximated Root: x ≈ 2.236068 (√5)"
          math={<BlockMath math={`\\text{Exact Root } \\sqrt{5} \\approx 2.236067977, \\quad (2.236068)^2 - 5 = 0`} />}
        >
          Newton-Raphson exhibits quadratic convergence, effectively doubling the number of correct digits on every single iteration!
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Live Calculator & Visualizer">
        <NewtonRaphsonMethod />
      </Lab>
    </MethodPage>
  );
}
