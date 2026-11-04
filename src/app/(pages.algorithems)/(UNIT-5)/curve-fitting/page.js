'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import CurveFittingCalculator from './algorithems.curve-fitting';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why take logs?', a: <>Curves like <InlineMath math="y = ab^x" /> are not straight, but <InlineMath math="\log y = \log a + x \log b" /> is a straight line in x. Fit that line by least squares, then turn A and B back into a and b.</> },
  { q: 'Which curve should I choose?', a: <>Plot the data. Growing by the same factor each step: <InlineMath math="ab^x" /> or <InlineMath math="ae^{bx}" />. Growing like a power of x (doubling x multiplies y by a fixed amount): <InlineMath math="ax^b" />. A single bend: a parabola.</> },
  { q: 'Is the log fit the best possible?', a: <>It is the least-squares fit for log y, which is what textbooks use. It is close to, but not exactly, the least-squares fit for y itself.</> },
];

export default function CurveFittingPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • STATISTICS" title="Exponential & Power Curve Fits" subtitle="Least Squares After Taking Logs">
        Fit <InlineMath math="y = ae^{bx}" />, <InlineMath math="y = ab^x" /> or <InlineMath math="y = ax^b" /> by taking logs to make a straight line, then using the <strong>normal equations</strong> of least squares. Polynomials are fitted directly.
      </MethodHeader>
      <FormulaBox label="NORMAL EQUATIONS" tag="Y = A + BX">
        <Formula math={`\\sum Y = nA + B\\sum X, \\qquad \\sum XY = A\\sum X + B\\sum X^2`} />
        <FormulaSteps steps={[
          { title: '1. Logs', text: <>Change to Y = log y (and X = log x for power curves).</> },
          { title: '2. Straight line', text: <>Solve the two normal equations for A and B.</> },
          { title: '3. Back', text: <>a = 10ᴬ (or eᴬ), and b from B.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Fit <InlineMath math="y = ab^x" /> to x = 1, 2, 3, 4, 5 and y = 6, 12, 24, 48, 96.</ExampleProblem>
        <ExampleStep n={1} title="TAKE LOGS"><MathPanel><BlockMath math="\log y = \log a + x \log b \ \Rightarrow \ Y = A + Bx" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="SOLVE"><StepText>The normal equations give A = log 3 = 0.4771 and B = log 2 = 0.3010.</StepText></ExampleStep>
        <ExampleStep n={3} title="BACK TO a AND b"><MathPanel><BlockMath math="a = 10^{0.4771} = 3, \qquad b = 10^{0.3010} = 2" /></MathPanel></ExampleStep>
        <Conclusion result="y = 3(2)ˣ" math={<BlockMath math="y = 3 \cdot 2^x" />}>The data double each step, so the fit is exact.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Curve Fitting Calculator"><CurveFittingCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['straight-line', 'parabola', 'least-squares']} />
    </MethodPage>
  );
}
