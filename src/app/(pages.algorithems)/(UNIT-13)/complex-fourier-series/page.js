'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.complex-fourier-series';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "How are cₙ and aₙ, bₙ related?", a: <>cₙ = (aₙ − ibₙ)/2 and c₋ₙ = (aₙ + ibₙ)/2 for n ≥ 1, and c₀ = a₀/2.</> },
  { q: "What does Parseval mean physically?", a: <>The energy of a signal is the sum of the energies in its frequencies; |cₙ|² is the power at frequency n.</> },
  { q: "Why is the Parseval check approximate?", a: <>With jumps the |cₙ|² fall off like 1/n², so the sum converges slowly; NETZ adds 801 terms and compares.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 13 • FOURIER & Z TRANSFORMS" title="Complex Fourier Series Calculator" subtitle="cₙ, the Exponential Form and Parseval's Identity">
        The <strong>complex form</strong> of a Fourier series uses <InlineMath math={"e^{in\\pi x/L}"} /> instead of sines and cosines: one coefficient <InlineMath math={"c_n"} /> per frequency, for <InlineMath math={"n"} /> from <InlineMath math={"-\\infty"} /> to <InlineMath math={"\\infty"} />. <strong>Parseval&apos;s identity</strong> says the mean square of <InlineMath math={"f"} /> is the sum of <InlineMath math={"|c_n|^2"} />.
      </MethodHeader>
      <FormulaBox label="THE COEFFICIENTS" tag="PERIOD 2L">
        <Formula math={"f(x) = \\sum_{n=-\\infty}^{\\infty} c_n e^{in\\pi x/L}, \\quad c_n = \\frac{1}{2L}\\int_{c}^{c + 2L} f(x)\\,e^{-in\\pi x/L}dx = \\frac{a_n - ib_n}{2}"} />
        <FormulaSteps steps={[
          { title: "1. aₙ, bₙ", text: <>The real coefficients.</> },
          { title: "2. cₙ", text: <>(aₙ − ibₙ)/2, with c₋ₙ = c̄ₙ for real f.</> },
          { title: "3. Parseval", text: <>Mean square = Σ|cₙ|².</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the complex Fourier series of f(x) = x on (−π, π), and use Parseval.</ExampleProblem>
        <ExampleStep n={1} title="COEFFICIENTS"><MathPanel><BlockMath math={"a_n = 0, \\quad b_n = \\frac{2(-1)^{n+1}}{n} \\Rightarrow c_n = \\frac{i(-1)^n}{n} \\ (n \\neq 0), \\quad c_0 = 0"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="PARSEVAL"><MathPanel><BlockMath math={"\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} x^2\\,dx = \\frac{\\pi^2}{3} = \\sum_{n \\neq 0}\\frac{1}{n^2} = 2\\sum_{n=1}^{\\infty}\\frac{1}{n^2}"} /></MathPanel><StepText>So Σ 1/n² = π²/6.</StepText></ExampleStep>
        <Conclusion result="cₙ = i(−1)ⁿ/n" math={<BlockMath math={"x = \\sum_{n \\neq 0}\\frac{i(-1)^n}{n}e^{inx}, \\qquad \\sum_{n=1}^{\\infty}\\frac{1}{n^2} = \\frac{\\pi^2}{6}"} />}>The calculator below opens on this function.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Complex Fourier Series Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["fourier-series","fourier-transform","complex-numbers"]} />
    </MethodPage>
  );
}
