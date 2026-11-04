'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import JacobiEigenCalculator from './algorithems.jacobi-eigenvalue-method';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Is this the same as the Jacobi iteration for linear equations?', a: <>No, it shares the name only. The Jacobi <strong>eigenvalue</strong> method rotates a symmetric matrix towards diagonal form; the Jacobi <strong>iteration</strong> solves Ax = b by repeated substitution.</> },
  { q: 'Why only symmetric matrices?', a: <>Plane rotations keep a symmetric matrix symmetric, and a symmetric matrix can always be made diagonal by rotations (its eigenvectors are perpendicular). For other matrices use the QR algorithm.</> },
  { q: 'Where are the eigenvectors?', a: <>Multiply all the rotation matrices together: <InlineMath math="V = P_1 P_2 \cdots P_k" />. The columns of V are the eigenvectors, in the same order as the eigenvalues on the diagonal.</> },
];

export default function JacobiEigenPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 4 • MATRIX METHODS" title="Jacobi Eigenvalue Method" subtitle="Plane Rotations for Symmetric Matrices">
        Repeatedly pick the largest off-diagonal entry of a symmetric matrix and rotate it to zero with <InlineMath math="A \to P^{T}AP" />. The matrix becomes diagonal: the diagonal holds the <strong>eigenvalues</strong>, the rotations the <strong>eigenvectors</strong>.
      </MethodHeader>
      <FormulaBox label="THE ROTATION" tag="tan 2θ">
        <Formula math={`\\tan 2\\theta = \\frac{2a_{pq}}{a_{pp} - a_{qq}} \\ \\left(\\theta = \\tfrac{\\pi}{4} \\text{ if } a_{pp} = a_{qq}\\right), \\qquad A_{k+1} = P_k^{T} A_k P_k`} />
        <FormulaSteps steps={[
          { title: '1. Largest off-diagonal', text: <>Find |a_pq|, the biggest above the diagonal.</> },
          { title: '2. Rotate', text: <>Choose θ to make it zero.</> },
          { title: '3. Repeat', text: <>Until every off-diagonal entry is tiny.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the eigenvalues of <InlineMath math="A = \begin{bmatrix} 2 & 1 \\ 1 & 2 \end{bmatrix}" /> by Jacobi&apos;s method.</ExampleProblem>
        <ExampleStep n={1} title="ANGLE"><MathPanel><BlockMath math="a_{11} = a_{22} = 2 \ \Rightarrow \ \theta = \frac{\pi}{4}" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="ROTATE"><MathPanel><BlockMath math="P = \frac{1}{\sqrt{2}}\begin{bmatrix} 1 & -1 \\ 1 & 1 \end{bmatrix}, \qquad P^{T}AP = \begin{bmatrix} 3 & 0 \\ 0 & 1 \end{bmatrix}" /></MathPanel><StepText>One rotation is enough for a 2 × 2 matrix.</StepText></ExampleStep>
        <Conclusion result="λ = 3, 1" math={<BlockMath math="\lambda_1 = 3, \quad \lambda_2 = 1" />}>Larger matrices need several rotations; the table shows each one.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Jacobi Eigenvalue Calculator"><JacobiEigenCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['eigenvalues', 'power-method', 'qr']} />
    </MethodPage>
  );
}
