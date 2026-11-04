'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import IntegralCalculator from './algorithems.integral-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'Why do we add + C?',
    a: <>Differentiating a constant gives 0, so <InlineMath math="x^2" />, <InlineMath math="x^2 + 5" /> and <InlineMath math="x^2 - 3" /> all have derivative <InlineMath math="2x" />. The indefinite integral is the whole family, written <InlineMath math="x^2 + C" />. A definite integral needs no C: it cancels in <InlineMath math="F(b) - F(a)" />.</>,
  },
  {
    q: 'How do I choose u in integration by parts?',
    a: <>Use <strong>ILATE</strong>: pick u from the first type in the list Inverse trig, Log, Algebraic (powers of x), Trig, Exponential. The rest is dv. In <InlineMath math="\int x\,e^x\,dx" />, x (algebraic) comes before eˣ (exponential), so u = x. Some books write LIATE (log first); the two agree for most textbook questions.</>,
  },
  {
    q: 'When should I use substitution?',
    a: <>When the integrand has a function and (a multiple of) its derivative: <InlineMath math="\int x\cos(x^2)\,dx" /> has x² and its derivative 2x. Put <InlineMath math="u = x^2" />, then <InlineMath math="du = 2x\,dx" /> and the integral becomes <InlineMath math="\tfrac{1}{2}\int \cos u\,du" />.</>,
  },
  {
    q: 'Why can NETZ not integrate some functions step by step?',
    a: <>Some integrals have no answer in terms of ordinary functions at all: <InlineMath math="\int e^{-x^2}\,dx" />, <InlineMath math="\int \sin(x^2)\,dx" /> and <InlineMath math="\int \frac{dx}{\ln x}" /> are famous examples. For a definite integral the calculator still gives the value numerically, and says that it did.</>,
  },
];

export default function IntegralPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Integral Calculator" subtitle="Substitution, By Parts & Partial Fractions">
        <strong>Integration</strong> undoes differentiation: <InlineMath math="\int f(x)\,dx = F(x) + C" /> where <InlineMath math="F'(x) = f(x)" />. A definite integral <InlineMath math="\int_a^b f(x)\,dx = F(b) - F(a)" /> is the signed area under the curve.
      </MethodHeader>

      <FormulaBox label="WHICH METHOD?" tag="∫ f(x) dx">
        <Formula math={`\\begin{gathered} \\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\ (n \\neq -1) \\qquad \\int \\frac{dx}{x} = \\ln|x| + C \\\\ \\int u\\,dv = uv - \\int v\\,du \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. Standard form?', text: <>Split sums, take constants out, and look up each piece: powers, eˣ, sin, cos, sec², 1/(1+x²)…</> },
            { title: '2. Function and its derivative?', text: <>Substitute u = the inner function. If the top is the derivative of the bottom, the answer is ln|bottom|.</> },
            { title: '3. Product?', text: <>Integrate by parts, choosing u by ILATE.</> },
            { title: '4. Fraction of polynomials?', text: <>Divide if the top is not smaller, then split into partial fractions.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Find <InlineMath math="\int x\,e^{x}\,dx" />.
        </ExampleProblem>

        <ExampleStep n={1} title="CHOOSE u AND dv (ILATE)">
          <StepText>x is algebraic and eˣ is exponential; A comes before E, so:</StepText>
          <MathPanel>
            <BlockMath math="u = x \Rightarrow du = dx, \qquad dv = e^{x}\,dx \Rightarrow v = e^{x}" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="APPLY THE FORMULA">
          <MathPanel>
            <BlockMath math="\int x\,e^{x}\,dx = uv - \int v\,du = x\,e^{x} - \int e^{x}\,dx" />
          </MathPanel>
          <StepText>The integral left over is simpler than the one we started with: that is the sign of a good choice of u.</StepText>
        </ExampleStep>

        <ExampleStep n={3} title="FINISH AND CHECK">
          <MathPanel>
            <BlockMath math="x\,e^{x} - e^{x} + C = e^{x}(x - 1) + C" />
          </MathPanel>
          <StepText>Check by differentiating: <InlineMath math="\frac{d}{dx}\left[e^{x}(x - 1)\right] = e^{x}(x - 1) + e^{x} = x\,e^{x}" /> ✓</StepText>
        </ExampleStep>

        <Conclusion result="∫ x eˣ dx = eˣ(x − 1) + C" math={<BlockMath math="\int x\,e^{x}\,dx = e^{x}(x - 1) + C" />}>
          The calculator below opens on x² eˣ, where parts is needed twice (the tabular method does both at once).
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Integral Calculator">
        <IntegralCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['derivative', 'limit', 'simpson-13', 'romberg']} />
    </MethodPage>
  );
}
