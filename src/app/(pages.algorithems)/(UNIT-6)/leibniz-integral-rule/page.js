'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.leibniz-integral-rule';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "When is it allowed?", a: <>When f and ∂f/∂a are continuous on the region (and, for infinite limits, the integrals converge uniformly). The page checks the answer numerically.</> },
  { q: "How is C found?", a: <>From a value of a where the integral is known: where the integrand is 0 (like a = 0 above), or as a → ∞ when the integral dies away.</> },
  { q: "What about ∫₀^∞ e^{−ax} sin x/x dx?", a: <>F′(a) = −1/(1 + a²), so F = −tan⁻¹a + C; F → 0 as a → ∞ gives C = π/2. At a = 0 this is ∫₀^∞ sin x/x dx = π/2.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Differentiation Under the Integral Sign" subtitle="Leibniz's Rule and Feynman's Trick">
        When an integral depends on a parameter <InlineMath math={"a"} />, <strong>Leibniz&apos;s rule</strong> differentiates it with respect to <InlineMath math={"a"} /> by differentiating inside. This also <strong>evaluates</strong> hard integrals: <InlineMath math={"F'(a)"} /> is often easy, and integrating it back gives <InlineMath math={"F(a)"} />.
      </MethodHeader>
      <FormulaBox label="LEIBNIZ'S RULE" tag="LIMITS MAY MOVE">
        <Formula math={"\\frac{d}{da}\\int_{u(a)}^{v(a)} f(x, a)\\,dx = \\int_{u}^{v}\\frac{\\partial f}{\\partial a}\\,dx + f(v, a)\\,v'(a) - f(u, a)\\,u'(a)"} />
        <FormulaSteps steps={[
          { title: "1. Differentiate inside", text: <>∂f/∂a.</> },
          { title: "2. Integrate in x", text: <>That gives F′(a).</> },
          { title: "3. Integrate in a", text: <>Fix C from a known value.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Evaluate F(a) = ∫₀¹ (xᵃ − 1)/ln x dx.</ExampleProblem>
        <ExampleStep n={1} title="DIFFERENTIATE"><MathPanel><BlockMath math={"F'(a) = \\int_0^1 \\frac{\\partial}{\\partial a}\\frac{x^a - 1}{\\ln x}\\,dx = \\int_0^1 x^a\\,dx = \\frac{1}{a + 1}"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="INTEGRATE BACK"><MathPanel><BlockMath math={"F(a) = \\ln(a + 1) + C, \\quad F(0) = 0 \\Rightarrow C = 0"} /></MathPanel></ExampleStep>
        <Conclusion result="F(a) = ln(a + 1)" math={<BlockMath math={"\\int_0^1 \\frac{x^a - 1}{\\ln x}\\,dx = \\ln(a + 1)"} />}>The calculator below opens on this integral.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Leibniz Rule Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["integral","partial-derivative","improper-integrals"]} />
    </MethodPage>
  );
}
