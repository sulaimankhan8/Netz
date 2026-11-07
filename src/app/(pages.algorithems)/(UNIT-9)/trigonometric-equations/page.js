'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.trigonometric-equations';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why is there a general solution?", a: <>Trig functions repeat, so if one angle solves the equation, infinitely many do. The general solution lists them all with an integer n.</> },
  { q: "Why are some roots rejected?", a: <>Rewriting tan or sec in sin and cos can bring in angles where the original equation is undefined (cos x = 0 for tan x). Every family is checked in the original equation.</> },
  { q: "How is a sin x + b cos x = c solved?", a: <>Write the left side as R cos(x − φ) with R = √(a² + b²) and tan φ = a/b, then solve one cosine equation.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • TRIGONOMETRY" title="Trigonometric Equation Solver" subtitle="General Solutions, Step by Step">
        Solve a trig equation for <strong>every</strong> angle. Reduce it to one function, find the principal value <InlineMath math={"\\alpha"} />, then write the general solution with an integer <InlineMath math={"n"} />. The solutions in <InlineMath math={"[0, 2\\pi)"} /> are listed in radians and degrees.
      </MethodHeader>
      <FormulaBox label="GENERAL SOLUTIONS" tag="n ∈ ℤ">
        <Formula math={"\\sin\\theta = \\sin\\alpha \\Rightarrow \\theta = n\\pi + (-1)^n\\alpha, \\quad \\cos\\theta = \\cos\\alpha \\Rightarrow \\theta = 2n\\pi \\pm \\alpha, \\quad \\tan\\theta = \\tan\\alpha \\Rightarrow \\theta = n\\pi + \\alpha"} />
        <FormulaSteps steps={[
          { title: "1. One function", text: <>Use sin² + cos² = 1 or divide by cosᵐ.</> },
          { title: "2. Principal value", text: <>Solve for the function, then α.</> },
          { title: "3. General solution", text: <>The formula for that function.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve 2cos²x + 3cos x + 1 = 0.</ExampleProblem>
        <ExampleStep n={1} title="FACTOR"><MathPanel><BlockMath math={"(2\\cos x + 1)(\\cos x + 1) = 0 \\ \\Rightarrow \\ \\cos x = -\\tfrac12 \\text{ or } \\cos x = -1"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="GENERAL SOLUTIONS"><MathPanel><BlockMath math={"x = 2n\\pi \\pm \\frac{2\\pi}{3}, \\qquad x = 2n\\pi \\pm \\pi"} /></MathPanel><StepText>The second is the same as x = (2n + 1)π.</StepText></ExampleStep>
        <Conclusion result="x = 2π/3, π, 4π/3 in [0, 2π)" math={<BlockMath math={"x = \\frac{2\\pi}{3}, \\ \\pi, \\ \\frac{4\\pi}{3}"} />}>The calculator below opens on this equation.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Trig Equation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["trig-identities","inverse-trig","unit-circle"]} />
    </MethodPage>
  );
}
