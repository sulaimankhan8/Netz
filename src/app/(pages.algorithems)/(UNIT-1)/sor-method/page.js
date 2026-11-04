'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SorCalculator from './algorithems.sor-method';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the SOR method?',
    a: <>Successive over-relaxation is Gauss-Seidel with a push: each new value is a mix of the old value and the Gauss-Seidel value, weighted by a relaxation factor <InlineMath math="\omega" />. With a good <InlineMath math="\omega" /> it reaches the answer in far fewer iterations.</>,
  },
  {
    q: 'How do you choose ω?',
    a: <><InlineMath math="\omega = 1" /> is plain Gauss-Seidel. Values between 1 and 2 over-relax and are usually faster; values between 0 and 1 under-relax, which can help a system that oscillates. The method can only converge for <InlineMath math="0 < \omega < 2" />. Try a few values and compare the iteration counts.</>,
  },
  {
    q: 'When does SOR converge?',
    a: <>It always converges for <InlineMath math="0 < \omega < 2" /> when the matrix is symmetric and positive definite, and Gauss-Seidel converges when it is diagonally dominant. For other systems it may or may not converge.</>,
  },
];

export default function SorPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 1 • LINEAR SYSTEMS & ITERATIONS" title="SOR Method" subtitle="Successive Over-Relaxation">
        The <strong>SOR method</strong> speeds up Gauss-Seidel by over-correcting each step: <InlineMath math="x_i^{\text{new}} = (1 - \omega)\,x_i^{\text{old}} + \omega\,x_i^{\text{GS}}" />, where <InlineMath math="x_i^{\text{GS}}" /> is the Gauss-Seidel value and <InlineMath math="\omega" /> is the relaxation factor.
      </MethodHeader>

      <FormulaBox label="HOW SOR WORKS" tag="0 < ω < 2">
        <Formula math={`x_i^{(k+1)} = (1 - \\omega)\\,x_i^{(k)} + \\frac{\\omega}{a_{ii}}\\left(b_i - \\sum_{j<i} a_{ij}x_j^{(k+1)} - \\sum_{j>i} a_{ij}x_j^{(k)}\\right)`} />
        <FormulaSteps
          steps={[
            { title: '1. Gauss-Seidel Value', text: <>Work out the usual Gauss-Seidel update, using new values as soon as you have them.</> },
            { title: '2. Relax', text: <>Mix it with the old value: <InlineMath math="(1 - \omega)" /> of the old, <InlineMath math="\omega" /> of the new.</> },
            { title: '3. Repeat', text: <>Sweep through all equations again until the values stop changing.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          Solve <InlineMath math="4x + 3y = 24" />, <InlineMath math="3x + 4y - z = 30" />, <InlineMath math="-y + 4z = -24" /> by SOR with <InlineMath math="\omega = 1.25" />, starting from <InlineMath math="(0, 0, 0)" />.
        </ExampleProblem>

        <ExampleStep n={1} title="FIRST SWEEP">
          <StepText>The old values are all 0, so <InlineMath math="(1 - \omega) \times \text{old} = 0" /> and only the Gauss-Seidel part counts:</StepText>
          <MathPanel>
            <BlockMath math="x = \frac{1.25}{4}(24 - 0) = 7.5" />
            <BlockMath math="y = \frac{1.25}{4}(30 - 3 \times 7.5) = 2.34375" />
            <BlockMath math="z = \frac{1.25}{4}(-24 + 2.34375) = -6.767578" />
          </MathPanel>
        </ExampleStep>

        <ExampleStep n={2} title="SECOND SWEEP (NOW THE OLD VALUES COUNT)">
          <MathPanel>
            <BlockMath math="x = (1 - 1.25)(7.5) + \frac{1.25}{4}(24 - 3 \times 2.34375) = 3.427734" />
          </MathPanel>
          <StepText>Carry on the same way for y and z, then repeat.</StepText>
        </ExampleStep>

        <ExampleStep n={3} title="COMPARE WITH GAUSS-SEIDEL">
          <StepText>To a tolerance of 0.0001, SOR with ω = 1.25 needs 10 sweeps; plain Gauss-Seidel (ω = 1) needs 20.</StepText>
        </ExampleStep>

        <Conclusion result="x = 3, y = 4, z = −5" math={<BlockMath math="(x, y, z) = (3, 4, -5)" />}>
          The calculator below opens on this system and shows both iteration counts.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive SOR Calculator">
        <SorCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['gauss-seidel', 'jacobi', 'gauss-elimination', 'system-of-equations']} />
    </MethodPage>
  );
}
