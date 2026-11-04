'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import AdamsCalculator from './algorithems.adams-bashforth-moulton';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the Adams-Bashforth-Moulton method?',
    a: <>A fourth-order predictor-corrector: the Adams-Bashforth formula predicts <InlineMath math="y_{n+1}" /> from four earlier slopes, and the Adams-Moulton formula corrects it using the slope at the prediction.</>,
  },
  {
    q: 'Why use it instead of RK4 all the way?',
    a: <>After the start, each step needs only one or two new evaluations of f, against four for RK4. For a long range, or an expensive f, that saves a lot of work at similar accuracy.</>,
  },
  {
    q: "How does it compare with Milne's method?",
    a: <>Both are fourth order and need four starting values. Adams-Bashforth-Moulton is more stable, so it is the usual choice in practice; Milne&apos;s corrector can let errors grow for some equations.</>,
  },
];

export default function AdamsPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 4 • INITIAL VALUE PROBLEMS (ODE)" title="Adams-Bashforth-Moulton" subtitle="Predictor-Corrector">
        The <strong>Adams-Bashforth-Moulton method</strong> solves <InlineMath math="\frac{dy}{dx} = f(x, y)" /> step by step from four earlier points: Adams-Bashforth predicts the next value, and Adams-Moulton corrects it.
      </MethodHeader>

      <FormulaBox label="THE TWO FORMULAS" tag="FOURTH ORDER">
        <Formula math={`\\begin{gathered} \\text{Predictor: } y_{n+1}^P = y_n + \\frac{h}{24}\\left(55f_n - 59f_{n-1} + 37f_{n-2} - 9f_{n-3}\\right) \\\\ \\text{Corrector: } y_{n+1}^C = y_n + \\frac{h}{24}\\left(9f_{n+1} + 19f_n - 5f_{n-1} + f_{n-2}\\right) \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Start Up', text: <>Get <InlineMath math="y_1, y_2, y_3" /> by RK4 and their slopes <InlineMath math="f_0" /> to <InlineMath math="f_3" />.</> },
            { title: '2. Predict', text: <>Adams-Bashforth gives <InlineMath math="y_4^P" />; work out <InlineMath math="f_4" /> there.</> },
            { title: '3. Correct', text: <>Adams-Moulton improves it; repeat the corrector until it settles.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Solve <InlineMath math="\frac{dy}{dx} = x + y" />, <InlineMath math="y(0) = 1" /> with <InlineMath math="h = 0.1" />, and find <InlineMath math="y(0.4)" />.
        </ExampleProblem>

        <ExampleStep n={1} title="STARTING VALUES BY RK4">
          <MathPanel>
            <BlockMath math="f_0 = 1, \quad f_1 = 1.210342, \quad f_2 = 1.442805, \quad f_3 = 1.699717, \quad y_3 = 1.399717" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="PREDICT">
          <MathPanel>
            <BlockMath math="y_4^P = 1.399717 + \frac{0.1}{24}\left(55 \times 1.699717 - 59 \times 1.442805 + 37 \times 1.210342 - 9 \times 1\right) = 1.583640" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={3} title="CORRECT">
          <MathPanel>
            <BlockMath math="f_4 = 0.4 + 1.583640 = 1.983640" />
            <BlockMath math="y_4^C = 1.399717 + \frac{0.1}{24}\left(9 \times 1.983640 + 19 \times 1.699717 - 5 \times 1.442805 + 1.210342\right) = 1.583649" />
          </MathPanel>
          <StepText>The exact value <InlineMath math="2e^{0.4} - 1.4 = 1.583649" /> agrees to six decimal places.</StepText>
        </ExampleStep>

        <Conclusion result="y(0.4) ≈ 1.583649" math={<BlockMath math="y(0.4) \approx 1.583649" />}>
          The calculator below opens on this problem and shows every predictor and corrector value.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Adams-Bashforth-Moulton Calculator">
        <AdamsCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['milne', 'runge-kutta', 'rk2', 'euler']} />
    </MethodPage>
  );
}
