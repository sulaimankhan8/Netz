'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Rk2Calculator from './algorithems.rk2-method';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the second-order Runge-Kutta method?',
    a: <>A one-step method that samples the slope twice per step and combines the two. Its error per step shrinks like <InlineMath math="h^3" />, so it is far more accurate than Euler&apos;s method for the same h.</>,
  },
  {
    q: "Is Heun's method the same as the modified Euler method?",
    a: <>Yes: Heun&apos;s method averages the slope at the start and at an Euler-predicted end point, which is the modified (improved) Euler method with a single correction.</>,
  },
  {
    q: 'What is the difference between Heun and midpoint?',
    a: <>Heun averages the slopes at the two ends of the step. Midpoint takes a half step, measures the slope there, and uses only that. Both are second order; for many problems they give similar accuracy.</>,
  },
];

export default function Rk2Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 4 • INITIAL VALUE PROBLEMS (ODE)" title="RK2 Method" subtitle="Heun & Midpoint">
        The <strong>second-order Runge-Kutta method</strong> solves <InlineMath math="\frac{dy}{dx} = f(x, y)" /> by sampling the slope twice per step. Heun&apos;s version: <InlineMath math="y_{n+1} = y_n + \frac{h}{2}(k_1 + k_2)" />, with <InlineMath math="k_1" /> at the start and <InlineMath math="k_2" /> at the predicted end.
      </MethodHeader>

      <FormulaBox label="HEUN'S RK2" tag="ERROR ~ h²">
        <Formula math={`\\begin{gathered} k_1 = f(x_n, y_n), \\qquad k_2 = f(x_n + h,\\ y_n + h k_1) \\\\ y_{n+1} = y_n + \\frac{h}{2}(k_1 + k_2) \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Slope at the Start', text: <><InlineMath math="k_1 = f(x_n, y_n)" />.</> },
            { title: '2. Slope at the End', text: <>Take an Euler step to guess the end point, and find the slope there: <InlineMath math="k_2" />.</> },
            { title: '3. Average', text: <>Step forward with the average slope <InlineMath math="\frac{k_1 + k_2}{2}" />.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Solve <InlineMath math="\frac{dy}{dx} = x + y" />, <InlineMath math="y(0) = 1" /> with <InlineMath math="h = 0.1" /> by Heun&apos;s method, and find <InlineMath math="y(0.2)" />.
        </ExampleProblem>

        <ExampleStep n={1} title="STEP 1: x = 0 → 0.1">
          <MathPanel>
            <BlockMath math="k_1 = 0 + 1 = 1, \qquad k_2 = f(0.1,\ 1 + 0.1 \times 1) = 0.1 + 1.1 = 1.2" />
            <BlockMath math="y_1 = 1 + \frac{0.1}{2}(1 + 1.2) = 1.11" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="STEP 2: x = 0.1 → 0.2">
          <MathPanel>
            <BlockMath math="k_1 = 0.1 + 1.11 = 1.21, \qquad k_2 = f(0.2,\ 1.11 + 0.121) = 0.2 + 1.231 = 1.431" />
            <BlockMath math="y_2 = 1.11 + \frac{0.1}{2}(1.21 + 1.431) = 1.24205" />
          </MathPanel>
          <StepText>The exact solution is <InlineMath math="y = 2e^x - x - 1" />, so <InlineMath math="y(0.2) = 1.242806" />: RK2 is off by about 0.0008.</StepText>
        </ExampleStep>

        <Conclusion result="y(0.2) ≈ 1.24205" math={<BlockMath math="y(0.2) \approx 1.24205" />}>
          The calculator below opens on this problem. Switch to the midpoint version to compare.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive RK2 Calculator">
        <Rk2Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['euler', 'modified-euler', 'runge-kutta', 'milne']} />
    </MethodPage>
  );
}
