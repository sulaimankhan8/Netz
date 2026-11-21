'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import NewtonRaphsonMethod from './aldorithems.newton-raphson';
import { newtonRaphson as EXTRAS } from '@/app/data/methodFaqs';
import { Faq, RelatedMethods } from '@/app/components/method/PageExtras';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
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
        <SymbolKey rows={[
          { s: 'f(x)', t: <>The function whose root we want: where the graph crosses the x-axis.</>, e: 'f(x) = x^2 - 5' },
          { s: "f'(x)", t: 'The derivative: the slope of the tangent line at x. Newton slides down this tangent to the axis.', e: "f'(x) = 2x" },
          { s: 'x_0', t: 'The starting guess. A guess close to the root makes Newton converge in very few steps.', e: 'x_0 = 2' },
          { s: 'x_n', t: 'The guess after n steps.', e: 'x_1 = 2.25' },
          { s: 'x_{n+1}', t: 'The next guess: where the tangent at x_n meets the x-axis.', e: 'x_2 = 2.236111' },
          { s: '\\dfrac{f(x_n)}{f\'(x_n)}', t: 'The correction: how far to move from x_n. Near the root it becomes tiny.', e: '\\dfrac{-1}{4} = -0.25' },
          { s: '|x_{n+1} - x_n|', t: 'How much the guess moved. Stop when it is smaller than the tolerance.', e: '0.000043' },
        ]} />
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
            <div className="text-sm md:text-base font-sans overflow-x-auto text-center">
              <BlockMath math="f(2.236111) = (2.236111)^2 - 5 = +0.000193" />
              <BlockMath math="f'(2.236111) = 2(2.236111) = 4.472222" />
              <BlockMath math="x_3 = 2.236111 - \frac{0.000193}{4.472222} = 2.236111 - 0.000043 = 2.236068" />
            </div>
          </IterationPanel>
          <IterationPanel label="Iteration 4 (check):">
            <div className="text-sm md:text-base font-sans overflow-x-auto text-center">
              <BlockMath math="f(2.236068) = (2.236068)^2 - 5 \approx 0.0000001 \quad\Longrightarrow\quad x_4 = 2.236068" />
            </div>
            <div className="text-sm font-sans">The guess no longer changes in the 6th decimal: <InlineMath math="|x_4 - x_3| < 0.000001" />, so stop.</div>
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

      <CommonMistakes items={[
        { m: <>Getting the derivative wrong.</>, f: <>Differentiate carefully before starting and check one value: for <InlineMath math="x^2 - 5" />, <InlineMath math="f'(x) = 2x" />, so <InlineMath math="f'(2) = 4" />. A wrong slope sends every step the wrong way.</> },
        { m: <>Adding the correction instead of subtracting it.</>, f: <><InlineMath math="x_{n+1} = x_n - \dfrac{f(x_n)}{f'(x_n)}" />. With <InlineMath math="f(x_n) < 0" /> the minus makes the guess go up: <InlineMath math="2 - \dfrac{-1}{4} = 2.25" />.</> },
        { m: <>Starting where <InlineMath math="f'(x_0) = 0" /> or very small.</>, f: <>The tangent is flat and never meets the axis (or meets it far away). Choose <InlineMath math="x_0" /> where the curve is clearly sloping, e.g. from a quick sign check.</> },
        { m: <>Using degrees for trigonometric functions.</>, f: <>Work in radians, and remember <InlineMath math="\dfrac{d}{dx}\sin x = \cos x" /> only holds in radians.</> },
        { m: <>Rounding each new guess heavily.</>, f: <>Newton doubles the correct digits each step; rounding to 2–3 decimals throws that away. Keep 6 decimals.</> },
        { m: <>Writing only the final answer.</>, f: <>Show <InlineMath math="f'(x)" />, then for each step <InlineMath math="f(x_n)" />, <InlineMath math="f'(x_n)" />, the formula with numbers, and the change <InlineMath math="|x_{n+1} - x_n|" />.</> },
      ]} />

      <Lab heading="Interactive Live Calculator & Visualizer">
        <NewtonRaphsonMethod />
      </Lab>
      <Faq items={EXTRAS.faq} />
      <RelatedMethods ids={EXTRAS.related} />
    </MethodPage>
  );
}
