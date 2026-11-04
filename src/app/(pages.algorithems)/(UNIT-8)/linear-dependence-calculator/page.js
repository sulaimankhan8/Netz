'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import LinearDependenceCalculator from './algorithems.linear-dependence-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What does linearly dependent mean?', a: <>At least one vector can be made from the others (it is a combination of them). Equivalently, some choice of numbers, not all zero, makes <InlineMath math="c_1v_1 + \cdots + c_kv_k = 0" />.</> },
  { q: 'Is there a quick test for square cases?', a: <>For n vectors in ℝⁿ, put them in a square matrix: they are independent exactly when its determinant is not 0. The rank test works for any number of vectors.</> },
  { q: 'Why are 3 vectors in ℝ² always dependent?', a: <>The rank of a matrix is at most its smaller dimension. Three vectors in ℝ² give a 2×3 matrix with rank at most 2 &lt; 3.</> },
];

export default function LinearDependencePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 8 • MATRICES" title="Linear Dependence Calculator" subtitle="Rank Test and the Relation Between Vectors">
        Vectors are <strong>linearly independent</strong> when the only way to make <InlineMath math="c_1v_1 + \cdots + c_kv_k = 0" /> is with every c equal to 0. Put them as columns of a matrix: rank = k means independent, rank &lt; k means dependent.
      </MethodHeader>
      <FormulaBox label="THE TEST" tag="rank vs k">
        <Formula math={`\\text{rank}\\begin{bmatrix} v_1 & v_2 & \\cdots & v_k \\end{bmatrix} = k \\iff \\text{independent}`} />
        <FormulaSteps steps={[
          { title: '1. Columns', text: <>Write each vector as a column.</> },
          { title: '2. Row-reduce', text: <>Count the pivots (the rank).</> },
          { title: '3. Relation', text: <>A column without a pivot gives the combination that is 0.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Are <InlineMath math="(1,2,3), (4,5,6), (7,8,9)" /> independent?</ExampleProblem>
        <ExampleStep n={1} title="ROW-REDUCE"><MathPanel><BlockMath math="\begin{bmatrix} 1 & 4 & 7 \\ 2 & 5 & 8 \\ 3 & 6 & 9 \end{bmatrix} \to \begin{bmatrix} 1 & 0 & -1 \\ 0 & 1 & 2 \\ 0 & 0 & 0 \end{bmatrix}" /></MathPanel><StepText>Rank 2 &lt; 3: dependent. Column 3 has no pivot.</StepText></ExampleStep>
        <ExampleStep n={2} title="THE RELATION"><StepText>Put c₃ = 1; then c₁ = 1, c₂ = −2:</StepText><MathPanel><BlockMath math="v_1 - 2v_2 + v_3 = 0" /></MathPanel></ExampleStep>
        <Conclusion result="Dependent: v₁ − 2v₂ + v₃ = 0" math={<BlockMath math="v_3 = 2v_2 - v_1" />}>Check: 2(4,5,6) − (1,2,3) = (7,8,9) ✓</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Linear Dependence Calculator"><LinearDependenceCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['rank', 'determinant', 'consistency']} />
    </MethodPage>
  );
}
