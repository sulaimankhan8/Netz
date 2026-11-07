'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.uniform-distribution';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why (b − a)²/12 for the variance?", a: <>It is ∫(x − μ)² dx/(b − a) over [a, b]; the 12 comes from integrating x² over a symmetric interval.</> },
  { q: "What about a discrete uniform (a die)?", a: <>There each of n values has probability 1/n and the variance is (n² − 1)/12; this page is the continuous version.</> },
  { q: "Is P(X = 5) zero?", a: <>Yes, for any continuous distribution a single point has probability 0; only intervals have positive probability.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • PROBABILITY & STATISTICS" title="Uniform Distribution Calculator" subtitle="Continuous Uniform on [a, b]">
        In the <strong>uniform distribution</strong> every value in [a, b] is equally likely: <InlineMath math={"f(x) = \\frac{1}{b - a}"} />, so a probability is just a length divided by b − a.
      </MethodHeader>
      <FormulaBox label="THE FORMULAS" tag="U(a, b)">
        <Formula math={"P(c < X < d) = \\frac{d - c}{b - a}, \\quad \\mu = \\frac{a + b}{2}, \\quad \\sigma^2 = \\frac{(b - a)^2}{12}"} />
        <FormulaSteps steps={[
          { title: "1. Height", text: <>1/(b − a).</> },
          { title: "2. Length", text: <>Of the part of (c, d) inside [a, b].</> },
          { title: "3. Multiply", text: <>Length × height.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>A bus comes every 15 minutes and you arrive at a random time. Find the chance you wait less than 5 minutes.</ExampleProblem>
        <ExampleStep n={1} title="MODEL"><MathPanel><BlockMath math={"X \\sim U(0, 15), \\qquad f(x) = \\frac{1}{15}"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="PROBABILITY"><MathPanel><BlockMath math={"P(X < 5) = \\frac{5 - 0}{15} = \\frac{1}{3}"} /></MathPanel></ExampleStep>
        <Conclusion result="1/3" math={<BlockMath math={"P(X < 5) = \\frac{1}{3}"} />}>The second example button below loads this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Uniform Distribution Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["normal","exponential-dist","random-variables"]} />
    </MethodPage>
  );
}
