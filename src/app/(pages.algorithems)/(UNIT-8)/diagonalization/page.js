'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.diagonalization';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "When is a matrix not diagonalisable?", a: <>When an eigenvalue repeats k times but has fewer than k independent eigenvectors, such as [[2, 1], [0, 2]]. Over the real numbers, complex eigenvalues also stop it.</> },
  { q: "Why is the orthogonal reduction only for symmetric matrices?", a: <>Only symmetric matrices are guaranteed perpendicular eigenvectors, which can be normalised into an orthogonal N with Nᵀ = N⁻¹.</> },
  { q: "Why diagonalise at all?", a: <>Powers become easy (Aᵏ = PDᵏP⁻¹), systems of differential equations decouple, and quadratic forms reduce to sums of squares.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 8 • EIGENVALUES" title="Diagonalization of a Matrix" subtitle="Modal Matrix, Spectral Matrix and Orthogonal Reduction">
        A square matrix is <strong>diagonalisable</strong> when it has a full set of independent eigenvectors. Put them as the columns of <InlineMath math={"P"} /> and <InlineMath math={"P^{-1}AP = D"} />, the diagonal matrix of eigenvalues. A symmetric matrix can even use an <strong>orthogonal</strong> <InlineMath math={"N"} /> with <InlineMath math={"N^{-1} = N^{T}"} />.
      </MethodHeader>
      <FormulaBox label="THE REDUCTION" tag="P⁻¹AP = D">
        <Formula math={"P = \\begin{bmatrix} X_1 & X_2 & \\cdots & X_n \\end{bmatrix}, \\qquad P^{-1}AP = D = \\operatorname{diag}(\\lambda_1, \\ldots, \\lambda_n), \\qquad A^{k} = PD^{k}P^{-1}"} />
        <FormulaSteps steps={[
          { title: "1. Eigenvalues", text: <>Solve |A − λI| = 0.</> },
          { title: "2. Eigenvectors", text: <>Solve (A − λI)X = 0 for each λ.</> },
          { title: "3. P and D", text: <>Eigenvectors as columns; eigenvalues on the diagonal.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Diagonalise the symmetric matrix A = [[2, 0, 0], [0, 3, 4], [0, 4, 9]] by an orthogonal transformation.</ExampleProblem>
        <ExampleStep n={1} title="EIGENVALUES"><MathPanel><BlockMath math={"(2 - \\lambda)(\\lambda^2 - 12\\lambda + 11) = 0 \\ \\Rightarrow \\ \\lambda = 1, 2, 11"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="EIGENVECTORS"><MathPanel><BlockMath math={"X_1 = \\begin{bmatrix} 0 \\\\ 2 \\\\ -1 \\end{bmatrix}, \\ X_2 = \\begin{bmatrix} 1 \\\\ 0 \\\\ 0 \\end{bmatrix}, \\ X_3 = \\begin{bmatrix} 0 \\\\ 1 \\\\ 2 \\end{bmatrix}"} /></MathPanel><StepText>They are perpendicular, as they must be for a symmetric matrix.</StepText></ExampleStep>
        <ExampleStep n={3} title="NORMALISE"><MathPanel><BlockMath math={"N = \\begin{bmatrix} 0 & 1 & 0 \\\\ \\frac{2}{\\sqrt5} & 0 & \\frac{1}{\\sqrt5} \\\\ -\\frac{1}{\\sqrt5} & 0 & \\frac{2}{\\sqrt5} \\end{bmatrix}"} /></MathPanel></ExampleStep>
        <Conclusion result="NᵀAN = diag(1, 2, 11)" math={<BlockMath math={"N^{T}AN = \\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & 2 & 0 \\\\ 0 & 0 & 11 \\end{bmatrix}"} />}>The calculator below opens on this matrix.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Diagonalization Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["eigenvalues","quadratic-form","cayley-hamilton"]} />
    </MethodPage>
  );
}
