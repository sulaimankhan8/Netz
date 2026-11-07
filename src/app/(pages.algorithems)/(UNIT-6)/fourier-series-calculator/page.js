'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.fourier-series-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why are some coefficients zero?', a: <>For an odd function on (−L, L) every aₙ is 0 (only sines); for an even function every bₙ is 0 (only cosines). x gives a sine series, x² a cosine series.</> },
  { q: 'What is a half-range series?', a: <>A function given only on (0, L) can be extended as even (cosine series) or odd (sine series). Then <InlineMath math="a_n = \frac{2}{L}\int_0^L f\cos\frac{n\pi x}{L}dx" /> or <InlineMath math="b_n = \frac{2}{L}\int_0^L f\sin\frac{n\pi x}{L}dx" />.</> },
  { q: 'What happens at a jump?', a: <>The series converges to the average of the left and right values. Near the jump the partial sums overshoot by about 9% (the Gibbs phenomenon).</> },
];

export default function FourierPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • SERIES" title="Fourier Series Calculator" subtitle="Full Range, Half Range and Piecewise Functions">
        Write a periodic function as <InlineMath math="\frac{a_0}{2} + \sum (a_n\cos nx + b_n\sin nx)" />. The calculator finds a₀, aₙ and bₙ with every integral, uses <InlineMath math="\cos n\pi = (-1)^n" />, and plots the partial sum.
      </MethodHeader>
      <FormulaBox label="EULER'S FORMULAS" tag="(−π, π)">
        <Formula math={'a_0 = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f\\,dx, \\quad a_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f\\cos nx\\,dx, \\quad b_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f\\sin nx\\,dx'} />
        <FormulaSteps steps={[
          { title: '1. Integrals', text: <>With n as a letter (by parts for x, x²).</> },
          { title: '2. Simplify', text: <>sin nπ = 0, cos nπ = (−1)ⁿ.</> },
          { title: '3. Assemble', text: <>Put aₙ, bₙ into the series.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the Fourier series of <InlineMath math="f(x) = x" /> on (−π, π).</ExampleProblem>
        <ExampleStep n={1} title="ODD FUNCTION"><StepText>x is odd, so a₀ = aₙ = 0.</StepText></ExampleStep>
        <ExampleStep n={2} title="bₙ BY PARTS"><MathPanel><BlockMath math="b_n = \frac{1}{\pi}\int_{-\pi}^{\pi} x\sin nx\,dx = \frac{1}{\pi}\left[-\frac{x\cos nx}{n} + \frac{\sin nx}{n^2}\right]_{-\pi}^{\pi} = \frac{2(-1)^{n+1}}{n}" /></MathPanel></ExampleStep>
        <Conclusion result="x = 2(sin x − sin 2x/2 + sin 3x/3 − …)" math={<BlockMath math="x = 2\left(\sin x - \frac{\sin 2x}{2} + \frac{\sin 3x}{3} - \cdots\right)" />}>The calculator below opens on this function.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Fourier Series Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['harmonic-analysis', 'integral', 'dft-fft']} />
    </MethodPage>
  );
}
