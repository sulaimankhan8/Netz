'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import CholeskyCalculator from './algorithems.cholesky-decomposition';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit4';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['cholesky'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['cholesky'].example} />
      <CommonMistakes items={EX['cholesky'].mistakes} />
      <Lab heading="Interactive Cholesky Calculator"><CholeskyCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['lu', 'qr', 'gauss-elimination']} />
    </MethodPage>
  );
}
