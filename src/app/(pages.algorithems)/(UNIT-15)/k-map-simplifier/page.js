'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.k-map-simplifier';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What are don't-cares for?", a: <>Inputs that never happen (or whose output does not matter). They may be grouped as 1s when that makes a group bigger, and left out otherwise.</> },
  { q: "Is the answer always minimal?", a: <>Yes: NETZ lists every prime implicant (Quine–McCluskey), takes the essential ones, then searches all covers for the rest.</> },
  { q: "Why Gray code order?", a: <>In 00, 01, 11, 10 neighbours differ in one bit, so adjacent cells combine.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 15 • DISCRETE MATHS & OPTIMISATION" title="K-Map Simplifier" subtitle="Karnaugh Maps: Minimal SOP and POS, with the Groups Drawn">
        A <strong>Karnaugh map</strong> lays the truth table out so that neighbouring cells differ in one variable. Circling the largest blocks of 1s (1, 2, 4 or 8 cells, wrapping round the edges) gives the <strong>minimal sum of products</strong>; circling the 0s gives the product of sums.
      </MethodHeader>
      <FormulaBox label="THE RULE" tag="GRAY CODE">
        <Formula math={"AB + A\\overline{B} = A \\qquad \\text{(two neighbouring cells lose the variable that changes)}"} />
        <FormulaSteps steps={[
          { title: "1. Fill the map", text: <>1s, 0s and Xs (don&apos;t-cares).</> },
          { title: "2. Group", text: <>The largest blocks of 1s, overlapping is fine.</> },
          { title: "3. Read off", text: <>One product per group.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Simplify f(A, B, C, D) = Σm(0, 2, 5, 7, 8, 10, 13, 15).</ExampleProblem>
        <ExampleStep n={1} title="THE FOUR CORNERS"><MathPanel><BlockMath math={"m(0, 2, 8, 10) \\Rightarrow \\overline{B}\\,\\overline{D}"} /></MathPanel><StepText>The corners are neighbours because the map wraps round.</StepText></ExampleStep>
        <ExampleStep n={2} title="THE MIDDLE BLOCK"><MathPanel><BlockMath math={"m(5, 7, 13, 15) \\Rightarrow BD"} /></MathPanel></ExampleStep>
        <Conclusion result="f = B'D' + BD" math={<BlockMath math={"f = \\overline{B}\\,\\overline{D} + BD"} />}>The calculator below opens on this function.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive K-Map Simplifier Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["truth-table","set-operations","modular-arithmetic"]} />
    </MethodPage>
  );
}
