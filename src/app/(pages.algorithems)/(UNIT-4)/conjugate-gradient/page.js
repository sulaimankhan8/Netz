'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.conjugate-gradient';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit4';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why must A be symmetric positive definite?", a: <>Then solving Ax = b is the same as minimising ½xᵀAx − bᵀx, a bowl-shaped function; CG walks down that bowl.</> },
  { q: "Why at most n steps?", a: <>The n search directions are conjugate, hence independent, and after n of them the error has no component left (in exact arithmetic).</> },
  { q: "Where is it used?", a: <>For large sparse systems, where elimination would fill the matrix in; often with a preconditioner.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 4 • MATRIX METHODS" title="Conjugate Gradient Method Calculator" subtitle="Solve Ax = b for Symmetric Positive Definite A">
        The <strong>conjugate gradient method</strong> solves <InlineMath math={"Ax = b"} /> for a symmetric positive definite <InlineMath math={"A"} /> by moving along directions that are conjugate (<InlineMath math={"p_i^TAp_j = 0"} />). Each step minimises the error in a new direction, so it finishes in at most <InlineMath math={"n"} /> steps.
      </MethodHeader>
      <FormulaBox label="ONE STEP" tag="A = Aᵀ > 0">
        <Formula math={"\\alpha_k = \\frac{r_k^Tr_k}{p_k^TAp_k}, \\quad x_{k+1} = x_k + \\alpha_kp_k, \\quad r_{k+1} = r_k - \\alpha_kAp_k, \\quad p_{k+1} = r_{k+1} + \\frac{r_{k+1}^Tr_{k+1}}{r_k^Tr_k}p_k"} />
        <FormulaSteps steps={[
          { title: "1. Start", text: <>r₀ = b − Ax₀, p₀ = r₀.</> },
          { title: "2. Step", text: <>α, then x and r.</> },
          { title: "3. New direction", text: <>β, then p.</> },
        ]} />
        <SymbolKey rows={EX['conjugate-gradient'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['conjugate-gradient'].example} />
      <CommonMistakes items={EX['conjugate-gradient'].mistakes} />
      <Lab heading="Interactive Conjugate Gradient Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["gauss-seidel","gradient-descent","cholesky"]} />
    </MethodPage>
  );
}
