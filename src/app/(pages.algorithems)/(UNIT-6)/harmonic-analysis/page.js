'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.harmonic-analysis';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'When is harmonic analysis used?', a: <>When f is known only from measurements (tides, alternating currents, monthly temperatures): the integrals in Euler&apos;s formulas are replaced by averages over the table.</> },
  { q: 'Why 2/N?', a: <>Each integral <InlineMath math="\frac{1}{\pi}\int_0^{2\pi} f\cos k\theta\,d\theta" /> becomes twice the average of y cos kθ over the N equally spaced points.</> },
  { q: 'How many harmonics can I find?', a: <>At most N/2 from N values: higher frequencies can&apos;t be told apart from lower ones (aliasing).</> },
];

export default function HarmonicPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • SERIES" title="Harmonic Analysis" subtitle="Fourier Coefficients From a Table of Values">
        <strong>Harmonic analysis</strong> finds the Fourier series of a function known only at N equally spaced points: <InlineMath math="a_k = \frac{2}{N}\sum y\cos k\theta" />, <InlineMath math="b_k = \frac{2}{N}\sum y\sin k\theta" />.
      </MethodHeader>
      <FormulaBox label="THE AVERAGES" tag="N POINTS">
        <Formula math={'a_0 = \\frac{2}{N}\\sum y, \\quad a_k = \\frac{2}{N}\\sum y\\cos k\\theta, \\quad b_k = \\frac{2}{N}\\sum y\\sin k\\theta'} />
        <FormulaSteps steps={[
          { title: '1. Table', text: <>y cos kθ and y sin kθ at each point.</> },
          { title: '2. Sum', text: <>Each column.</> },
          { title: '3. Scale', text: <>Multiply by 2/N.</> },
        ]} />
        <SymbolKey rows={EX['harmonic-analysis'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['harmonic-analysis'].example} />
      <CommonMistakes items={EX['harmonic-analysis'].mistakes} />
      <Lab heading="Interactive Harmonic Analysis Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['fourier-series', 'dft-fft', 'curve-fitting']} />
    </MethodPage>
  );
}
