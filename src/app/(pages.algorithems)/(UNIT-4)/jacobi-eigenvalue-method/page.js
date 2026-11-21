'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import JacobiEigenCalculator from './algorithems.jacobi-eigenvalue-method';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit4';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['jacobi-eigen'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['jacobi-eigen'].example} />
      <CommonMistakes items={EX['jacobi-eigen'].mistakes} />
      <Lab heading="Interactive Jacobi Eigenvalue Calculator"><JacobiEigenCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['eigenvalues', 'power-method', 'qr']} />
    </MethodPage>
  );
}
