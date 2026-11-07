'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.harmonic-analysis';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>y = 1.98, 1.30, 1.05, 1.30, −0.88, −0.25 at θ = 0°, 60°, …, 300°. Find the first harmonic.</ExampleProblem>
        <ExampleStep n={1} title="SUMS"><MathPanel><BlockMath math="\sum y = 4.5, \quad \sum y\cos\theta = 1.12, \quad \sum y\sin\theta = 3.013" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="SCALE BY 2/6"><MathPanel><BlockMath math="a_0 = 1.5, \quad a_1 = 0.373, \quad b_1 = 1.004" /></MathPanel><StepText>Amplitude √(a₁² + b₁²) ≈ 1.07.</StepText></ExampleStep>
        <Conclusion result="y ≈ 0.75 + 0.373 cos θ + 1.004 sin θ" math={<BlockMath math="y \approx 0.75 + 0.373\cos\theta + 1.004\sin\theta" />}>The calculator below opens on this table.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Harmonic Analysis Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['fourier-series', 'dft-fft', 'curve-fitting']} />
    </MethodPage>
  );
}
