'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.reduction-formula';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Where do these formulas come from?", a: <>Integration by parts: for sinⁿx write sinⁿx = sinⁿ⁻¹x · sin x, then use cos²x = 1 − sin²x to bring Iₙ back to the right side.</> },
  { q: "Why does Wallis end in π/2 or 1?", a: <>Even powers reduce to I₀ = π/2, odd ones to I₁ = 1.</> },
  { q: "Is the answer checked?", a: <>Yes: the indefinite answer is differentiated back to the integrand; the Wallis value is compared with a numerical integral.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Reduction Formula Calculator" subtitle="sinⁿx, cosⁿx, tanⁿx, secⁿx, xⁿeᵃˣ, (ln x)ⁿ and Wallis">
        A <strong>reduction formula</strong> writes <InlineMath math={"I_n"} /> in terms of <InlineMath math={"I_{n-1}"} /> or <InlineMath math={"I_{n-2}"} />, usually by integration by parts. Applying it again and again brings the power down to <InlineMath math={"0"} /> or <InlineMath math={"1"} />, where the integral is known.
      </MethodHeader>
      <FormulaBox label="FOR sinⁿx" tag="BY PARTS">
        <Formula math={"I_n = \\int \\sin^n x\\,dx = -\\frac{\\sin^{n-1}x\\cos x}{n} + \\frac{n - 1}{n}I_{n-2}, \\qquad \\int_0^{\\pi/2}\\sin^n x\\,dx = \\frac{n - 1}{n}\\cdot\\frac{n - 3}{n - 2}\\cdots"} />
        <FormulaSteps steps={[
          { title: "1. The formula", text: <>I_n in terms of a lower power.</> },
          { title: "2. Repeat", text: <>Down to I₀ or I₁.</> },
          { title: "3. Collect", text: <>Put the pieces back together.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Evaluate ∫₀^{'{'}π/2{'}'} sin⁶x dx.</ExampleProblem>
        <ExampleStep n={1} title="WALLIS"><MathPanel><BlockMath math={"I_n = \\frac{n - 1}{n}I_{n-2}, \\quad I_0 = \\frac{\\pi}{2}"} /></MathPanel><StepText>The boundary term is 0 at both ends.</StepText></ExampleStep>
        <ExampleStep n={2} title="APPLY"><MathPanel><BlockMath math={"I_6 = \\frac56\\cdot\\frac34\\cdot\\frac12\\cdot\\frac{\\pi}{2} = \\frac{5\\pi}{32}"} /></MathPanel></ExampleStep>
        <Conclusion result="5π/32" math={<BlockMath math={"\\int_0^{\\pi/2}\\sin^6x\\,dx = \\frac{5\\pi}{32}"} />}>The calculator below opens on ∫ sin⁴x dx.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Reduction Formulas Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["integral","trig-integrals","beta-gamma"]} />
    </MethodPage>
  );
}
