'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.set-operations';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit7';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What is the symmetric difference?", a: <>A △ B holds the elements in exactly one of the two sets: (A − B) ∪ (B − A).</> },
  { q: "What makes a relation an equivalence relation?", a: <>Being reflexive, symmetric and transitive. It then splits A into equivalence classes that do not overlap.</> },
  { q: "What is a partial order?", a: <>A relation that is reflexive, antisymmetric and transitive, like ≤ on numbers or ⊆ on sets.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 7 • SETS & RELATIONS" title="Set Operations Calculator" subtitle="Union, Intersection, Complement, Venn Diagrams and Relations">
        Combine sets with <InlineMath math={"\\cup"} />, <InlineMath math={"\\cap"} />, <InlineMath math={"-"} /> and complements, see each element in its region of a <strong>Venn diagram</strong>, evaluate any set formula, and test a relation for being reflexive, symmetric, antisymmetric and transitive.
      </MethodHeader>
      <FormulaBox label="COUNTING" tag="INCLUSION–EXCLUSION">
        <Formula math={"n(A \\cup B) = n(A) + n(B) - n(A \\cap B), \\qquad (A \\cup B)' = A' \\cap B'"} />
        <FormulaSteps steps={[
          { title: "1. List", text: <>Write each set out.</> },
          { title: "2. Combine", text: <>Work from the inside of the formula.</> },
          { title: "3. Check", text: <>Count with inclusion–exclusion.</> },
        ]} />
        <SymbolKey rows={EX['set-operations'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['set-operations'].example} />
      <CommonMistakes items={EX['set-operations'].mistakes} />
      <Lab heading="Interactive Sets Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["truth-table","permutations-combinations","bayes"]} />
    </MethodPage>
  );
}
