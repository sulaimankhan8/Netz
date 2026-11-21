'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ConsistencyCalculator from './algorithems.consistency-of-linear-equations';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit8';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What does "consistent" mean?', a: <>A system is consistent if it has at least one solution, and inconsistent if it has none. The rank test tells you which without solving: compare the rank of A with the rank of the augmented matrix [A | B].</> },
  { q: 'Why does ρ(A) < ρ([A|B]) mean no solution?', a: <>It means row reduction produced a row like <InlineMath math="0 \;0 \;0 \mid 5" />, which says <InlineMath math="0 = 5" />. No values of the unknowns can make that true.</> },
  { q: 'When does a homogeneous system have non-trivial solutions?', a: <>A homogeneous system <InlineMath math="AX = O" /> is always consistent (X = O works). It has non-trivial solutions exactly when <InlineMath math="\rho(A) < n" />; for a square matrix, that is when <InlineMath math="|A| = 0" />.</> },
];

export default function ConsistencyPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 8 • MATRICES" title="Consistency of Linear Equations" subtitle="The Rank Test for AX = B">
        Row-reduce the augmented matrix <InlineMath math="[A \mid B]" /> and compare ranks: different ranks mean <strong>no solution</strong>; equal ranks equal to the number of unknowns mean <strong>one solution</strong>; equal but smaller mean <strong>infinitely many</strong>.
      </MethodHeader>
      <FormulaBox label="THE RANK TEST" tag="ρ(A) vs ρ([A|B])">
        <Formula math={`\\begin{gathered} \\rho(A) \\neq \\rho([A|B]) \\Rightarrow \\text{inconsistent} \\\\ \\rho(A) = \\rho([A|B]) = n \\Rightarrow \\text{unique solution}, \\qquad \\rho(A) = \\rho([A|B]) < n \\Rightarrow \\text{infinitely many} \\end{gathered}`} />
        <FormulaSteps steps={[
          { title: '1. Augment', text: <>Write the coefficients and, after a bar, the constants.</> },
          { title: '2. Row-reduce', text: <>Count the non-zero rows: with and without the last column.</> },
          { title: '3. Decide and solve', text: <>Free unknowns become parameters t, s, ….</> },
        ]} />
        <SymbolKey rows={EX['consistency-of-linear-equations'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['consistency-of-linear-equations'].example} />
      <CommonMistakes items={EX['consistency-of-linear-equations'].mistakes} />
      <Lab heading="Interactive Consistency Calculator"><ConsistencyCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['rank', 'system-of-equations', 'gauss-elimination']} />
    </MethodPage>
  );
}
