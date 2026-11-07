'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.domain-and-range-calculator';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "How do I find the range without a graph?", a: <>On each piece of the domain, the function goes between its values at turning points (f′ = 0) and its limits at the ends of the piece. Joining those pieces gives the range.</> },
  { q: "When does a function have an inverse?", a: <>When it is one-to-one: no two x give the same y. x² is not (f(2) = f(−2)), unless the domain is restricted to x ≥ 0.</> },
  { q: "How can I tell even from odd quickly?", a: <>Replace x by −x. Same function: even (mirror in the y-axis). The negative: odd (symmetric about the origin). Otherwise neither.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 7 • FUNCTIONS" title="Domain and Range Calculator" subtitle="Domain, Range, Inverse, Composition and Even/Odd">
        The <strong>domain</strong> is every <InlineMath math={"x"} /> where <InlineMath math={"f(x)"} /> makes sense; the <strong>range</strong> is every value it takes. Find both from the conditions inside <InlineMath math={"f"} />, then invert <InlineMath math={"f"} />, compose two functions, or test whether <InlineMath math={"f"} /> is even or odd.
      </MethodHeader>
      <FormulaBox label="THE CONDITIONS" tag="WHERE f IS DEFINED">
        <Formula math={"\\frac{p}{q}: \\ q \\ne 0, \\qquad \\sqrt{u}: \\ u \\ge 0, \\qquad \\ln u: \\ u > 0, \\qquad \\sin^{-1}u: \\ -1 \\le u \\le 1"} />
        <FormulaSteps steps={[
          { title: "1. Conditions", text: <>One for each bottom, root and log.</> },
          { title: "2. Solve them", text: <>Critical points split the line; test each interval.</> },
          { title: "3. Range", text: <>Turning values and the limits at the ends.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the domain and range of f(x) = √(x − 2)/(x − 5).</ExampleProblem>
        <ExampleStep n={1} title="CONDITIONS"><MathPanel><BlockMath math={"x - 2 \\ge 0, \\qquad x - 5 \\ne 0"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="DOMAIN"><MathPanel><BlockMath math={"D_f = [2, 5) \\cup (5, \\infty)"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="RANGE"><StepText>On [2, 5) f falls from 0 to −∞; on (5, ∞) it falls from +∞ towards 0. Together every real number is reached.</StepText></ExampleStep>
        <Conclusion result="D = [2, 5) ∪ (5, ∞), R = ℝ" math={<BlockMath math={"D_f = [2, 5) \\cup (5, \\infty), \\quad R_f = \\mathbb{R}"} />}>The calculator below opens on this function.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Domain and Range Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["inequalities","continuity","asymptotes"]} />
    </MethodPage>
  );
}
