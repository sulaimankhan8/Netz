'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.power-series-radius-of-convergence';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What is the radius of convergence?', a: <>The number R such that the series converges for |x − a| &lt; R and diverges for |x − a| &gt; R. It can be 0 (only x = a) or ∞ (every x).</> },
  { q: 'Why test the end points separately?', a: <>At |x − a| = R the ratio test gives exactly 1 and says nothing. Each end becomes an ordinary series: Σxⁿ/n converges at x = −1 (alternating) but diverges at x = 1 (harmonic).</> },
  { q: 'What about series in x²ⁿ?', a: <>Choose the (x − a)²ⁿ form: the ratio test gives |x − a|² &lt; ρ, so R = √ρ.</> },
];

export default function PowerSeriesPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • SERIES" title="Radius and Interval of Convergence" subtitle="Power Series Σ cₙ(x − a)ⁿ">
        A <strong>power series</strong> converges inside an interval centred at a. The ratio test gives the <strong>radius</strong> <InlineMath math="R = \lim\left|\frac{c_n}{c_{n+1}}\right|" />; the end points are tested on their own.
      </MethodHeader>
      <FormulaBox label="RADIUS" tag="RATIO TEST">
        <Formula math={'R = \\lim_{n\\to\\infty}\\left|\\frac{c_n}{c_{n+1}}\\right| = \\frac{1}{\\lim |c_n|^{1/n}}'} />
        <FormulaSteps steps={[
          { title: '1. Ratio', text: <>|cₙ/cₙ₊₁| as n → ∞.</> },
          { title: '2. Interval', text: <>a − R &lt; x &lt; a + R.</> },
          { title: '3. End points', text: <>Test each as a series.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the interval of convergence of <InlineMath math="\sum \frac{x^n}{n}" />.</ExampleProblem>
        <ExampleStep n={1} title="RADIUS"><MathPanel><BlockMath math="\left|\frac{c_n}{c_{n+1}}\right| = \frac{n+1}{n} \to 1 \Rightarrow R = 1" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="END POINTS"><StepText>At x = 1: Σ1/n diverges. At x = −1: Σ(−1)ⁿ/n converges (alternating series test).</StepText></ExampleStep>
        <Conclusion result="[−1, 1)" math={<BlockMath math="-1 \le x < 1" />}>The first example button below loads this series.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Power Series Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['convergence-tests', 'taylor-series', 'limit']} />
    </MethodPage>
  );
}
