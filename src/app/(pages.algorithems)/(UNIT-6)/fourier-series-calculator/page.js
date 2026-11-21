'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.fourier-series-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['fourier-series-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['fourier-series-calculator'].example} />
      <CommonMistakes items={EX['fourier-series-calculator'].mistakes} />
      <Lab heading="Interactive Fourier Series Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['harmonic-analysis', 'integral', 'dft-fft']} />
    </MethodPage>
  );
}
