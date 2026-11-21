'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.quadratic-form';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit8';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['quadratic-form'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['quadratic-form'].example} />
      <CommonMistakes items={EX['quadratic-form'].mistakes} />
      <Lab heading="Interactive Quadratic Form Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["diagonalization","eigenvalues","maxima-minima-2var"]} />
    </MethodPage>
  );
}
