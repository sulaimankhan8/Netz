'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import InequalityCalculator from './algorithems.inequality-solver';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why does the sign flip when I divide by a negative number?', a: <>Multiplying by −1 reverses order: 2 &lt; 5 but −2 &gt; −5. So from <InlineMath math="-2x \ge 6" /> you get <InlineMath math="x \le -3" />.</> },
  { q: 'Square bracket or round bracket?', a: <>A square bracket [ ] means the end point is included (≤ or ≥); a round bracket ( ) means it is not (&lt; or &gt;). Infinity always gets a round bracket.</> },
  { q: 'Why is −2 never included in (x − 1)/(x + 2) ≥ 0?', a: <>At x = −2 the bottom is 0, so the fraction is not defined there at all. Points that make a denominator zero are always excluded, even with ≥.</> },
];

export default function InequalityPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 7 • ALGEBRA" title="Inequality Solver" subtitle="Linear, Quadratic & Rational Inequalities">
        Solve linear inequalities like equations, reversing the sign when you divide by a negative. For quadratics and fractions, bring everything to one side, find where it is zero or undefined, and use a <strong>sign chart</strong>.
      </MethodHeader>
      <FormulaBox label="SIGN CHART METHOD" tag="h(x) ≥ 0">
        <Formula math={`h(x) = \\frac{(x - a)(x - b)}{(x - c)} \\ \\gtrless \\ 0`} />
        <FormulaSteps steps={[
          { title: '1. One side', text: <>Move everything to the left so the right side is 0, then factor.</> },
          { title: '2. Critical points', text: <>Where the top is 0 (maybe included) and the bottom is 0 (never).</> },
          { title: '3. Test each interval', text: <>One value per interval; keep those with the right sign.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve <InlineMath math="x^2 - 5x + 6 \le 0" />.</ExampleProblem>
        <ExampleStep n={1} title="FACTOR"><MathPanel><BlockMath math="(x - 2)(x - 3) \le 0" /></MathPanel><StepText>Critical points: x = 2 and x = 3.</StepText></ExampleStep>
        <ExampleStep n={2} title="TEST THE INTERVALS"><MathPanel><BlockMath math="x = 0: \ (+) \qquad x = 2.5: \ (-) \qquad x = 4: \ (+)" /></MathPanel><StepText>We want ≤ 0: the middle interval, with the end points (they give exactly 0).</StepText></ExampleStep>
        <Conclusion result="x ∈ [2, 3]" math={<BlockMath math="2 \le x \le 3" />}>The calculator below draws the answer on a number line.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Inequality Solver"><InequalityCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['linear-equation', 'factoring', 'quadratic']} />
    </MethodPage>
  );
}
