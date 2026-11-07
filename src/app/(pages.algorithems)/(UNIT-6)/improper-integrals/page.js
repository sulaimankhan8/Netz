'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.improper-integrals';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why does ∫ 1/x from 1 to ∞ diverge?", a: <>Its antiderivative ln x grows without bound, even though 1/x → 0. The area under the curve is infinite.</> },
  { q: "What about ∫ 1/x² from −1 to 1?", a: <>It looks like 2 if you ignore x = 0, but 1/x² blows up there. Split at 0: each half diverges, so the integral diverges. The calculator finds such points.</> },
  { q: "How do I write infinity?", a: <>Type inf (or ∞) for +∞ and -inf for −∞.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • INTEGRATION TECHNIQUES" title="Improper Integrals" subtitle="Infinite Limits and Infinite Integrands">
        An <strong>improper integral</strong> has an infinite limit or an integrand that blows up. Write it as a limit, <InlineMath math={"\\int_a^\\infty f\\,dx = \\lim_{t\\to\\infty}\\int_a^t f\\,dx"} />, and decide whether it converges.
      </MethodHeader>
      <FormulaBox label="AS A LIMIT" tag="CONVERGE?">
        <Formula math={"\\int_1^\\infty \\frac{dx}{x^p} \\text{ converges} \\iff p > 1, \\qquad \\int_0^1 \\frac{dx}{x^p} \\text{ converges} \\iff p < 1"} />
        <FormulaSteps steps={[
          { title: "1. Antiderivative", text: <>As usual.</> },
          { title: "2. Limit", text: <>At ∞, or at the point where f blows up.</> },
          { title: "3. Decide", text: <>A finite limit converges.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Evaluate <InlineMath math={"\\int_1^\\infty \\frac{dx}{x^2}"} />.</ExampleProblem>
        <ExampleStep n={1} title="ANTIDERIVATIVE"><MathPanel><BlockMath math={"\\int \\frac{dx}{x^2} = -\\frac{1}{x}"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="LIMIT"><MathPanel><BlockMath math={"\\lim_{t\\to\\infty}\\left(-\\frac{1}{t}\\right) - \\left(-1\\right) = 0 + 1 = 1"} /></MathPanel><StepText>Finite, so it converges.</StepText></ExampleStep>
        <Conclusion result="1" math={<BlockMath math={"\\int_1^\\infty \\frac{dx}{x^2} = 1"} />}>The calculator below opens on this integral.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Improper Integral Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["integral","convergence-tests","beta-gamma"]} />
    </MethodPage>
  );
}
