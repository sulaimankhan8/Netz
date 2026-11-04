'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import BinomialCalculator from './algorithems.binomial-theorem-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Where do the coefficients come from?', a: <>They are <InlineMath math="\binom{n}{r} = \frac{n!}{r!(n - r)!}" />, the number of ways to choose b from r of the n brackets. They form row n of Pascal&apos;s triangle: 1, 4, 6, 4, 1 for n = 4.</> },
  { q: 'How do I find the term independent of x?', a: <>Write the power of x in the general term <InlineMath math="T_{r+1}" /> and set it to 0. In <InlineMath math="(x^2 - \frac{1}{x})^9" /> the power is <InlineMath math="2(9 - r) - r = 18 - 3r" />, so r = 6 and the term is <InlineMath math="T_7 = 84" />.</> },
  { q: 'Which is the middle term?', a: <>(a + b)ⁿ has n + 1 terms. If n is even, the middle term is <InlineMath math="T_{n/2 + 1}" />; if n is odd, there are two middle terms.</> },
];

export default function BinomialPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 7 • ALGEBRA" title="Binomial Theorem Calculator" subtitle="Expansions, General Term & Particular Terms">
        The <strong>binomial theorem</strong> expands <InlineMath math="(a + b)^n" /> without multiplying brackets: each term is <InlineMath math="\binom{n}{r} a^{n-r} b^r" />. The same general term finds any particular term directly.
      </MethodHeader>
      <FormulaBox label="THE THEOREM" tag="T(r+1)">
        <Formula math={`(a + b)^n = \\sum_{r=0}^{n} \\binom{n}{r} a^{n-r} b^r, \\qquad T_{r+1} = \\binom{n}{r} a^{n-r} b^r`} />
        <FormulaSteps steps={[
          { title: '1. Identify a, b, n', text: <>Keep the sign with b: (2x − 3) has b = −3.</> },
          { title: '2. General term', text: <>Write T(r+1) and simplify the power of x.</> },
          { title: '3. Choose r', text: <>From the term number, or by solving for the power you want.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Expand <InlineMath math="(x + 2)^4" />.</ExampleProblem>
        <ExampleStep n={1} title="COEFFICIENTS"><StepText>Row 4 of Pascal&apos;s triangle: 1, 4, 6, 4, 1.</StepText></ExampleStep>
        <ExampleStep n={2} title="EACH TERM"><MathPanel><BlockMath math="x^4 + 4x^3(2) + 6x^2(2^2) + 4x(2^3) + 2^4" /></MathPanel></ExampleStep>
        <Conclusion result="x⁴ + 8x³ + 24x² + 32x + 16" math={<BlockMath math="(x + 2)^4 = x^4 + 8x^3 + 24x^2 + 32x + 16" />}>The calculator below opens on this example.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Binomial Theorem Calculator"><BinomialCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['permutations-combinations', 'progressions', 'factoring']} />
    </MethodPage>
  );
}
