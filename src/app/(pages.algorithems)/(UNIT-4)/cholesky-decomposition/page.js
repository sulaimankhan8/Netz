'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import CholeskyCalculator from './algorithems.cholesky-decomposition';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'When can I use Cholesky instead of LU?', a: <>When A is symmetric and positive definite (all its eigenvalues are positive). Then A = LLᵀ with a single triangular factor, which takes about half the work of LU and needs no row swaps.</> },
  { q: 'What does "not positive definite" mean here?', a: <>Some diagonal step needed the square root of a negative number (or zero). That happens exactly when A is not positive definite, so the decomposition does not exist; use LU decomposition instead.</> },
  { q: 'How do I solve Ax = b with it?', a: <>Solve <InlineMath math="Ly = b" /> by forward substitution, then <InlineMath math="L^{T}x = y" /> by back substitution. Add b in the calculator to see both.</> },
];

export default function CholeskyPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 4 • MATRIX METHODS" title="Cholesky Decomposition" subtitle="A = LLᵀ for Symmetric Positive Definite Matrices">
        <strong>Cholesky decomposition</strong> writes a symmetric positive definite matrix as <InlineMath math="A = LL^{T}" />, with L lower triangular. Each entry of L comes from one formula, column by column.
      </MethodHeader>
      <FormulaBox label="THE FORMULAS" tag="A = LLᵀ">
        <Formula math={`l_{jj} = \\sqrt{a_{jj} - \\sum_{k<j} l_{jk}^2}, \\qquad l_{ij} = \\frac{1}{l_{jj}}\\left(a_{ij} - \\sum_{k<j} l_{ik} l_{jk}\\right)`} />
        <FormulaSteps steps={[
          { title: '1. Check', text: <>A must be symmetric.</> },
          { title: '2. Column by column', text: <>The diagonal entry first, then the entries below it.</> },
          { title: '3. Solve', text: <>Optional: Ly = b, then Lᵀx = y.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Decompose <InlineMath math="A = \begin{bmatrix} 4 & 2 & 14 \\ 2 & 17 & -5 \\ 14 & -5 & 83 \end{bmatrix}" />.</ExampleProblem>
        <ExampleStep n={1} title="COLUMN 1"><MathPanel><BlockMath math="l_{11} = \sqrt{4} = 2, \quad l_{21} = \frac{2}{2} = 1, \quad l_{31} = \frac{14}{2} = 7" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="COLUMN 2"><MathPanel><BlockMath math="l_{22} = \sqrt{17 - 1^2} = 4, \quad l_{32} = \frac{-5 - 7 \cdot 1}{4} = -3" /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="COLUMN 3"><MathPanel><BlockMath math="l_{33} = \sqrt{83 - 49 - 9} = 5" /></MathPanel><StepText>Check: LLᵀ gives back A.</StepText></ExampleStep>
        <Conclusion result="L = [2 0 0; 1 4 0; 7 −3 5]" math={<BlockMath math="L = \begin{bmatrix} 2 & 0 & 0 \\ 1 & 4 & 0 \\ 7 & -3 & 5 \end{bmatrix}" />}>The calculator below also solves Ax = b with this L.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Cholesky Calculator"><CholeskyCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['lu', 'qr', 'gauss-elimination']} />
    </MethodPage>
  );
}
