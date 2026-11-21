'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import LinearDependenceCalculator from './algorithems.linear-dependence-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit8';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['linear-dependence-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['linear-dependence-calculator'].example} />
      <CommonMistakes items={EX['linear-dependence-calculator'].mistakes} />
      <Lab heading="Interactive Linear Dependence Calculator"><LinearDependenceCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['rank', 'determinant', 'consistency']} />
    </MethodPage>
  );
}
