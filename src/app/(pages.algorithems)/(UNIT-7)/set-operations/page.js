'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.set-operations';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>U = {"{1, …, 10}"}, A = {"{2, 4, 6, 8, 10}"}, B = {"{1, 2, 3, 4, 5}"}. Find A ∪ B, A ∩ B, A − B and (A ∪ B)′.</ExampleProblem>
        <ExampleStep n={1} title="UNION AND INTERSECTION"><MathPanel><BlockMath math={"A \\cup B = \\{1, 2, 3, 4, 5, 6, 8, 10\\}, \\quad A \\cap B = \\{2, 4\\}"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="DIFFERENCE AND COMPLEMENT"><MathPanel><BlockMath math={"A - B = \\{6, 8, 10\\}, \\quad (A \\cup B)' = \\{7, 9\\}"} /></MathPanel><StepText>Check: n(A ∪ B) = 5 + 5 − 2 = 8.</StepText></ExampleStep>
        <Conclusion result="n(A ∪ B) = 8" math={<BlockMath math={"n(A \\cup B) = 5 + 5 - 2 = 8"} />}>The calculator below opens on these sets.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Sets Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["truth-table","permutations-combinations","bayes"]} />
    </MethodPage>
  );
}
