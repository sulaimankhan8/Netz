'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.quadratic-form';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What do rank, index and signature mean?", a: <>Rank is the number of non-zero squares in the canonical form, index the number of positive ones, and signature the positives minus the negatives.</> },
  { q: "How can I tell the nature without eigenvalues?", a: <>Use the leading principal minors (Sylvester): all positive means positive definite; signs −, +, −, … mean negative definite.</> },
  { q: "Why is the xy coefficient halved?", a: <>Because xy appears twice in XᵀAX, once as a₁₂xy and once as a₂₁yx, and A is kept symmetric.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 8 • EIGENVALUES" title="Quadratic Form Calculator" subtitle="Canonical Form, Rank, Index, Signature and Nature">
        A <strong>quadratic form</strong> <InlineMath math={"Q = X^{T}AX"} /> is a sum of degree-2 terms. The orthogonal change of variables <InlineMath math={"X = NY"} /> turns it into the <strong>canonical form</strong> <InlineMath math={"\\lambda_1 y_1^2 + \\cdots + \\lambda_n y_n^2"} />, which shows its rank, index, signature and nature at a glance.
      </MethodHeader>
      <FormulaBox label="THE REDUCTION" tag="X = NY">
        <Formula math={"Q = X^{T}AX \\ \\xrightarrow{X = NY} \\ \\lambda_1 y_1^2 + \\lambda_2 y_2^2 + \\cdots + \\lambda_n y_n^2, \\qquad s = p - (r - p)"} />
        <FormulaSteps steps={[
          { title: "1. Matrix", text: <>Squares on the diagonal; half of each xy term off it.</> },
          { title: "2. Eigenvalues", text: <>They are the canonical coefficients.</> },
          { title: "3. Read off", text: <>Rank, index, signature, nature.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Reduce Q = 3x² + 5y² + 3z² − 2xy + 2xz − 2yz to canonical form and find its nature.</ExampleProblem>
        <ExampleStep n={1} title="MATRIX"><MathPanel><BlockMath math={"A = \\begin{bmatrix} 3 & -1 & 1 \\\\ -1 & 5 & -1 \\\\ 1 & -1 & 3 \\end{bmatrix}"} /></MathPanel><StepText>The xy coefficient −2 is split as −1 and −1.</StepText></ExampleStep>
        <ExampleStep n={2} title="EIGENVALUES"><MathPanel><BlockMath math={"\\lambda^3 - 11\\lambda^2 + 36\\lambda - 36 = 0 \\ \\Rightarrow \\ \\lambda = 2, 3, 6"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="CANONICAL FORM"><MathPanel><BlockMath math={"Q = 2y_1^2 + 3y_2^2 + 6y_3^2"} /></MathPanel><StepText>All three positive: rank 3, index 3, signature 3.</StepText></ExampleStep>
        <Conclusion result="Positive definite" math={<BlockMath math={"Q = 2y_1^2 + 3y_2^2 + 6y_3^2"} />}>The calculator below opens on this form.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Quadratic Form Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["diagonalization","eigenvalues","maxima-minima-2var"]} />
    </MethodPage>
  );
}
