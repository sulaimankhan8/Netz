'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.conjugate-gradient';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve [4 1; 1 3]x = (1, 2) starting from x₀ = 0.</ExampleProblem>
        <ExampleStep n={1} title="STEP 1"><MathPanel><BlockMath math={"r_0 = (1, 2), \\ \\alpha_0 = \\frac{5}{20} = 0.25, \\ x_1 = (0.25, 0.5)"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="STEP 2"><MathPanel><BlockMath math={"x_2 = \\left(\\tfrac{1}{11}, \\tfrac{7}{11}\\right), \\quad r_2 = 0"} /></MathPanel><StepText>Two steps for a 2 × 2 system.</StepText></ExampleStep>
        <Conclusion result="x = (1/11, 7/11)" math={<BlockMath math={"\\mathbf{x} = \\left(\\tfrac{1}{11}, \\tfrac{7}{11}\\right)"} />}>The calculator below opens on this system.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Conjugate Gradient Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["gauss-seidel","gradient-descent","cholesky"]} />
    </MethodPage>
  );
}
