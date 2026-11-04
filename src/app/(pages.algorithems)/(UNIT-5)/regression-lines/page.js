'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import RegressionCalculator from './algorithems.regression-lines';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why are there two regression lines?', a: <>y on x minimises the errors in y, so it is the best line for predicting y from x. x on y minimises the errors in x, for predicting x from y. They are the same line only when r = ±1.</> },
  { q: 'How are the regression coefficients related to r?', a: <><InlineMath math="r^2 = b_{yx} \cdot b_{xy}" />, and r has the same sign as both coefficients. So r is the geometric mean of the two slopes (with their sign).</> },
  { q: 'Where do the two lines meet?', a: <>Always at the point of means <InlineMath math="(\bar x, \bar y)" />. Solving the two line equations together is a quick way to find the means.</> },
];

export default function RegressionPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • STATISTICS" title="Lines of Regression" subtitle="y on x and x on y, Step by Step">
        A <strong>line of regression</strong> is the straight line that best predicts one variable from the other. Use <strong>y on x</strong> to estimate y for a given x, and <strong>x on y</strong> to estimate x for a given y.
      </MethodHeader>
      <FormulaBox label="THE LINES" tag="b_yx, b_xy">
        <Formula math={`y - \\bar y = b_{yx}(x - \\bar x), \\quad b_{yx} = \\frac{\\sum (x - \\bar x)(y - \\bar y)}{\\sum (x - \\bar x)^2}; \\qquad x - \\bar x = b_{xy}(y - \\bar y)`} />
        <FormulaSteps steps={[
          { title: '1. Means', text: <>x̄ and ȳ: both lines pass through (x̄, ȳ).</> },
          { title: '2. Coefficients', text: <>b_yx and b_xy from the deviation table.</> },
          { title: '3. Lines and estimates', text: <>Substitute into each line.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the line of regression of y on x for x = 1, 2, 3, 4, 5 and y = 2, 4, 5, 4, 5, and estimate y at x = 6.</ExampleProblem>
        <ExampleStep n={1} title="COEFFICIENT"><MathPanel><BlockMath math="\bar x = 3, \ \bar y = 4, \qquad b_{yx} = \frac{6}{10} = 0.6" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="THE LINE"><MathPanel><BlockMath math="y - 4 = 0.6(x - 3) \ \Rightarrow \ y = 0.6x + 2.2" /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="ESTIMATE"><MathPanel><BlockMath math="y(6) = 0.6(6) + 2.2 = 5.8" /></MathPanel><StepText>The other line, x on y, is x = y − 1.</StepText></ExampleStep>
        <Conclusion result="y = 0.6x + 2.2; y(6) = 5.8" math={<BlockMath math="y = 0.6x + 2.2" />}>The calculator below opens on this data.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Regression Calculator"><RegressionCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['correlation', 'straight-line', 'curve-fitting']} />
    </MethodPage>
  );
}
