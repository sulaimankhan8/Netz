'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MilneCalculator from './algorithems.milne-predictor-corrector';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: "Why does Milne's method need starting values?",
    a: <>It is a multi-step method: each new value uses the four before it. So the first values <InlineMath math="y_1, y_2, y_3" /> must come from a one-step method, usually Runge-Kutta 4.</>,
  },
  {
    q: 'What do the predictor and corrector do?',
    a: <>The predictor (an open formula) makes a first guess <InlineMath math="y_{n+1}^P" /> from earlier slopes. The corrector (Simpson&apos;s rule) uses the slope at that guess to improve it. Comparing the two gives a check on the accuracy.</>,
  },
  {
    q: "Is Milne's method always stable?",
    a: <>No. For some equations (for example <InlineMath math="y' = -y" /> over long ranges) its errors can grow. Adams-Bashforth-Moulton is the safer general choice.</>,
  },
];

export default function MilnePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 4 • INITIAL VALUE PROBLEMS (ODE)" title="Milne's Method" subtitle="Predictor-Corrector">
        <strong>Milne&apos;s predictor-corrector method</strong> solves <InlineMath math="\frac{dy}{dx} = f(x, y)" /> using four earlier points: it predicts <InlineMath math="y_{n+1}" /> with an open formula, then corrects it with Simpson&apos;s rule.
      </MethodHeader>

      <FormulaBox label="MILNE'S FORMULAS" tag="NEEDS 4 STARTING POINTS">
        <Formula math={`\\begin{gathered} \\text{Predictor: } y_{n+1}^P = y_{n-3} + \\frac{4h}{3}\\left(2f_{n-2} - f_{n-1} + 2f_n\\right) \\\\ \\text{Corrector: } y_{n+1}^C = y_{n-1} + \\frac{h}{3}\\left(f_{n-1} + 4f_n + f_{n+1}\\right) \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Start Up', text: <>Get <InlineMath math="y_1, y_2, y_3" /> by RK4 and work out <InlineMath math="f_0" /> to <InlineMath math="f_3" />.</> },
            { title: '2. Predict', text: <>Use the predictor for <InlineMath math="y_4^P" />, then <InlineMath math="f_4 = f(x_4, y_4^P)" />.</> },
            { title: '3. Correct', text: <>Put <InlineMath math="f_4" /> into the corrector; repeat until it stops changing.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Solve <InlineMath math="\frac{dy}{dx} = x + y" />, <InlineMath math="y(0) = 1" /> with <InlineMath math="h = 0.1" />, and find <InlineMath math="y(0.4)" /> by Milne&apos;s method.
        </ExampleProblem>

        <ExampleStep n={1} title="STARTING VALUES BY RK4">
          <MathPanel>
            <BlockMath math="y_1 = 1.110342, \quad y_2 = 1.242805, \quad y_3 = 1.399717" />
            <BlockMath math="f_1 = 1.210342, \quad f_2 = 1.442805, \quad f_3 = 1.699717" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="PREDICT">
          <MathPanel>
            <BlockMath math="y_4^P = 1 + \frac{0.4}{3}\left(2 \times 1.210342 - 1.442805 + 2 \times 1.699717\right) = 1.583642" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="CORRECT">
          <MathPanel>
            <BlockMath math="f_4 = 0.4 + 1.583642 = 1.983642" />
            <BlockMath math="y_4^C = 1.242805 + \frac{0.1}{3}\left(1.442805 + 4 \times 1.699717 + 1.983642\right) = 1.583649" />
          </MathPanel>
          <StepText>The exact value <InlineMath math="2e^{0.4} - 1.4 = 1.583649" /> agrees to six decimal places.</StepText>
        </ExampleStep>

        <Conclusion result="y(0.4) ≈ 1.583649" math={<BlockMath math="y(0.4) \approx 1.583649" />}>
          The calculator below opens on this problem and shows every predictor and corrector value.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Milne Calculator">
        <MilneCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['adams', 'runge-kutta', 'rk2', 'modified-euler']} />
    </MethodPage>
  );
}
