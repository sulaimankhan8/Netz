'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import CurveFittingCalculator from './algorithems.curve-fitting';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['curve-fitting'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['curve-fitting'].example} />
      <CommonMistakes items={EX['curve-fitting'].mistakes} />
      <Lab heading="Interactive Curve Fitting Calculator"><CurveFittingCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['straight-line', 'parabola', 'least-squares']} />
    </MethodPage>
  );
}
