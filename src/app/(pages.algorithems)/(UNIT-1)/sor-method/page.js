'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SorCalculator from './algorithems.sor-method';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, StepTable, Conclusion,
  SymbolKey, CommonMistakes,
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
        <SymbolKey rows={[
          { s: 'x_i^{(k)}', t: 'The value of unknown i after k sweeps.', e: 'x^{(1)} = 7.5' },
          { s: 'a_{ii}', t: 'The diagonal coefficient of equation i: we divide by it.', e: 'a_{11} = 4' },
          { s: 'b_i', t: 'The right-hand side of equation i.', e: 'b_1 = 24' },
          { s: '\\omega', t: 'The relaxation factor. ω = 1 is plain Gauss-Seidel; 1 < ω < 2 over-relaxes (bigger steps, usually faster).', e: '\\omega = 1.25' },
          { s: '(1 - \\omega)\\,x_i^{(k)}', t: 'The part of the old value that is kept. With ω = 1.25 it is −0.25 × old.', e: '-0.25(7.5) = -1.875' },
          { s: '\\sum_{j<i},\\ \\sum_{j>i}', t: 'The other unknowns: the ones before i already have new values (k + 1), the ones after still use old values (k).', e: '' },
        ]} />
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
            <BlockMath math="x = (1 - 1.25)(7.5) + \frac{1.25}{4}(24 - 3 \times 2.34375) = -1.875 + 5.302734 = 3.427734" />
            <BlockMath math="y = (1 - 1.25)(2.34375) + \frac{1.25}{4}(30 - 3 \times 3.427734 + (-6.767578)) = -0.585938 + 4.046631 = 3.460693" />
            <BlockMath math="z = (1 - 1.25)(-6.767578) + \frac{1.25}{4}(-24 + 3.460693) = 1.691895 - 6.418533 = -4.726639" />
          </MathPanel>
          <StepText>Each new value is used at once (as in Gauss-Seidel), then mixed with the old one: <InlineMath math="-0.25 \times \text{old} + 1.25 \times \text{Gauss-Seidel value}" />.</StepText>
        </ExampleStep>

        <ExampleStep n={3} title="ALL SWEEPS">
          <StepTable
            columns={[{ key: 'k', label: 'Sweep k', bold: true }, { key: 'x', label: 'x' }, { key: 'y', label: 'y' }, { key: 'z', label: 'z' }, { key: 'd', label: 'Largest change', highlight: true }]}
            rows={[
              { k: 1, x: '7.5', y: '2.34375', z: '−6.767578', d: '7.5' },
              { k: 2, x: '3.427734', y: '3.460693', z: '−4.726639', d: '4.072266' },
              { k: 3, x: '3.398666', y: '3.846502', z: '−5.116308', d: '0.389670' },
              { k: 4, x: '3.044237', y: '3.960555', z: '−4.983249', d: '0.354429' },
              { k: 5, x: '3.025920', y: '3.990796', z: '−5.007064', d: '0.030240' },
              { k: 6, x: '3.002149', y: '3.998079', z: '−4.998834', d: '0.023771' },
              { k: 7, x: '3.001264', y: '3.999660', z: '−5.000398', d: '0.001581' },
              { k: 8, x: '3.000003', y: '3.999958', z: '−4.999914', d: '0.001261' },
              { k: 9, x: '3.000039', y: '4.000001', z: '−5.000021', d: '0.000107' },
              { k: 10, x: '2.999989', y: '4.000003', z: '−4.999994', d: '0.000050' },
            ]}
            rowKey={(r) => r.k}
          />
          <StepText>After sweep 10 the largest change is 0.00005 &lt; 0.0001, so stop.</StepText>
        </ExampleStep>

        <ExampleStep n={4} title="COMPARE WITH GAUSS-SEIDEL">
          <StepText>To a tolerance of 0.0001, SOR with ω = 1.25 needs 10 sweeps; plain Gauss-Seidel (ω = 1) needs 20.</StepText>
        </ExampleStep>

        <Conclusion result="x = 3, y = 4, z = −5" math={<BlockMath math="(x, y, z) = (3, 4, -5)" />}>
          The calculator below opens on this system and shows both iteration counts.
        </Conclusion>
      </WorkedExample>

      <CommonMistakes items={[
        { m: <>Forgetting the <InlineMath math="(1 - \omega)" /> part from sweep 2 on.</>, f: <>In sweep 1 the old values are 0, so it vanishes; after that it matters: <InlineMath math="-0.25 \times 7.5 = -1.875" />.</> },
        { m: <>Applying ω to the whole formula.</>, f: <>Only the Gauss-Seidel part is multiplied by <InlineMath math="\dfrac{\omega}{a_{ii}}" />; the old value gets <InlineMath math="1 - \omega" />.</> },
        { m: <>Using old values for unknowns already updated.</>, f: <>Like Gauss-Seidel, use the new x when working out y, and the new x, y for z.</> },
        { m: <>Choosing ω ≥ 2 or ω ≤ 0.</>, f: <>SOR only converges for <InlineMath math="0 < \omega < 2" />; values around 1.1–1.5 are usual.</> },
        { m: <>Sign slips with negative coefficients.</>, f: <>For <InlineMath math="3x + 4y - z = 30" /> the bracket is <InlineMath math="30 - 3x + z" />: moving <InlineMath math="-z" /> across makes it <InlineMath math="+z" />.</> },
        { m: <>Writing only the final answer.</>, f: <>Show the formula, sweeps 1 and 2 in full, and a table of every sweep with the largest change.</> },
      ]} />

      <Lab heading="Interactive SOR Calculator">
        <SorCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['gauss-seidel', 'jacobi', 'gauss-elimination', 'system-of-equations']} />
    </MethodPage>
  );
}
