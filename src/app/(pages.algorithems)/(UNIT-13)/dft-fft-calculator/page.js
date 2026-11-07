'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.dft-fft-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why is the FFT faster than the DFT?', a: <>The DFT needs N² multiplications. The radix-2 FFT splits the sum into even and odd samples again and again, needing about <InlineMath math="\frac{N}{2}\log_2 N" />: 12 instead of 64 for N = 8.</> },
  { q: 'What is bit reversal?', a: <>The FFT works on the inputs in bit-reversed index order: for N = 8, index 1 = 001 becomes 100 = 4, so the order is x₀, x₄, x₂, x₆, x₁, x₅, x₃, x₇.</> },
  { q: 'What is a twiddle factor?', a: <><InlineMath math="W_N^k = e^{-2\pi ik/N}" />, a root of unity. In each butterfly the lower input is multiplied by it before the sum and difference.</> },
];

export default function DftFftPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 13 • TRANSFORMS" title="DFT and FFT Calculator" subtitle="Discrete Fourier Transform With the Butterfly Diagram">
        The <strong>DFT</strong> <InlineMath math="X_k = \sum_n x_nW^{nk}" /> turns N samples into N frequency values. The <strong>FFT</strong> computes the same thing in <InlineMath math="\log_2 N" /> stages of butterflies, shown here as a diagram.
      </MethodHeader>
      <FormulaBox label="DFT AND BUTTERFLY" tag="W = e^(−2πi/N)">
        <Formula math={'X_k = \\sum_{n=0}^{N-1} x_n W_N^{nk}, \\qquad a\' = a + W_N^kb, \\quad b\' = a - W_N^kb'} />
        <FormulaSteps steps={[
          { title: '1. Reorder', text: <>Inputs in bit-reversed order.</> },
          { title: '2. Butterflies', text: <>log₂N stages of sums and differences.</> },
          { title: '3. Read off', text: <>X₀ … X_(N−1) in natural order.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the 4-point DFT of <InlineMath math="x = (1, 2, 3, 4)" />.</ExampleProblem>
        <ExampleStep n={1} title="STAGE 1"><MathPanel><BlockMath math="(x_0, x_2) = (1, 3) \to (4, -2), \qquad (x_1, x_3) = (2, 4) \to (6, -2)" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="STAGE 2"><MathPanel><BlockMath math="X_0 = 4 + 6 = 10, \ X_2 = 4 - 6 = -2, \ X_1 = -2 + (-i)(-2) = -2 + 2i, \ X_3 = -2 - 2i" /></MathPanel><StepText>W₄¹ = −i.</StepText></ExampleStep>
        <Conclusion result="(10, −2 + 2i, −2, −2 − 2i)" math={<BlockMath math="X = (10,\ -2 + 2i,\ -2,\ -2 - 2i)" />}>The calculator below opens on this signal.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive DFT / FFT Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['laplace', 'complex-numbers', 'matrix-calculator']} />
    </MethodPage>
  );
}
