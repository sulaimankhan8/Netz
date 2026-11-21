'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.linear-transformations';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit8';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "How do I know T is linear?", a: <>T(0) = 0 and T(au + bv) = aT(u) + bT(v); the page tests both and says so if they fail.</> },
  { q: "When is T one-to-one or onto?", a: <>One-to-one when the kernel is {'{'}0{'}'} (nullity 0); onto when the rank equals m.</> },
  { q: "Why the pivot columns of A, not of the RREF?", a: <>Row operations change the column space; they keep which columns are independent, so the pivot columns of the original A span the image.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 8 • LINEAR ALGEBRA" title="Linear Transformation Calculator" subtitle="Matrix, Kernel, Image, Rank and Nullity">
        A <strong>linear transformation</strong> <InlineMath math={"T: \\mathbb{R}^n \\to \\mathbb{R}^m"} /> is multiplication by a matrix. Its <strong>kernel</strong> is everything sent to <InlineMath math={"0"} /> (the null space) and its <strong>image</strong> everything it reaches (the column space); the <strong>rank–nullity theorem</strong> ties their sizes together.
      </MethodHeader>
      <FormulaBox label="RANK–NULLITY" tag="dim Rⁿ = n">
        <Formula math={"\\dim\\ker T + \\dim\\operatorname{Im}T = n, \\qquad A = \\big[\\,T(e_1)\\ \\cdots\\ T(e_n)\\,\\big]"} />
        <FormulaSteps steps={[
          { title: "1. Matrix", text: <>T(e₁), …, T(eₙ) as columns.</> },
          { title: "2. RREF", text: <>Pivot and free columns.</> },
          { title: "3. Bases", text: <>Kernel from the free variables, image from the pivot columns.</> },
        ]} />
        <SymbolKey rows={EX['linear-transformations'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['linear-transformations'].example} />
      <CommonMistakes items={EX['linear-transformations'].mistakes} />
      <Lab heading="Interactive Linear Transformations Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["rank","linear-dependence","consistency"]} />
    </MethodPage>
  );
}
