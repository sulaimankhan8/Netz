'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.continuity-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What kinds of discontinuity are there?", a: <>Removable (the limit exists but is not f(a)), jump (the one-sided limits differ) and infinite (a one-sided limit is ±∞).</> },
  { q: "Is (x² − 1)/(x − 1) continuous at 1?", a: <>No: it isn&apos;t defined there, though the limit is 2. Defining f(1) = 2 removes the discontinuity.</> },
  { q: "How do I type the pieces?", a: <>Separate them with ; and give each a condition: x^2 for x &lt; 1; 2x - 1 for x &gt;= 1.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • LIMITS & CONTINUITY" title="Continuity Calculator" subtitle="Left and Right Limits, Types of Discontinuity">
        f is <strong>continuous</strong> at x = a when <InlineMath math={"\\lim_{x\\to a^-}f = \\lim_{x\\to a^+}f = f(a)"} />. Check it for piecewise functions, name the type of discontinuity, or find the value of k that makes f continuous.
      </MethodHeader>
      <FormulaBox label="THE TEST" tag="LHL = RHL = f(a)">
        <Formula math={"\\lim_{x\\to a^-} f(x) = \\lim_{x\\to a^+} f(x) = f(a)"} />
        <FormulaSteps steps={[
          { title: "1. Left limit", text: <>Using the piece on the left.</> },
          { title: "2. Right limit", text: <>Using the piece on the right.</> },
          { title: "3. Compare", text: <>With each other and with f(a).</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find k so that f(x) = kx + 1 for x ≤ 2 and 3x² for x &gt; 2 is continuous.</ExampleProblem>
        <ExampleStep n={1} title="LIMITS"><MathPanel><BlockMath math={"\\lim_{x\\to 2^-} (kx + 1) = 2k + 1, \\qquad \\lim_{x\\to 2^+} 3x^2 = 12"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="EQUAL"><MathPanel><BlockMath math={"2k + 1 = 12 \\Rightarrow k = \\frac{11}{2}"} /></MathPanel></ExampleStep>
        <Conclusion result="k = 11/2" math={<BlockMath math={"k = \\frac{11}{2}"} />}>The fifth example button below loads this function.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Continuity Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["limit","asymptotes","derivative"]} />
    </MethodPage>
  );
}
