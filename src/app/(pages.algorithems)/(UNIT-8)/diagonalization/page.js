'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.diagonalization';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit8';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['diagonalization'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['diagonalization'].example} />
      <CommonMistakes items={EX['diagonalization'].mistakes} />
      <Lab heading="Interactive Diagonalization Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["eigenvalues","quadratic-form","cayley-hamilton"]} />
    </MethodPage>
  );
}
