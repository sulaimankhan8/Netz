'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.clairaut-equation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why is the singular solution not in the family?", a: <>It is the envelope of the lines y = cx + f(c): it touches each one but is not itself a line, so no value of c gives it.</> },
  { q: "What is \"solvable for p\"?", a: <>If the equation factors as (p − g₁)(p − g₂) = 0, each factor is a first-order equation; the general solution combines their solutions.</> },
  { q: "How does NETZ recognise Clairaut's form?", a: <>It checks numerically that x and y enter only through y − px, so forms like p = ln(px − y) are found too.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Clairaut's Equation Calculator" subtitle="General and Singular Solutions, and Equations Solvable for p">
        <strong>Clairaut&apos;s equation</strong> <InlineMath math={"y = px + f(p)"} />, with <InlineMath math={"p = \\frac{dy}{dx}"} />, is solved by replacing <InlineMath math={"p"} /> with a constant. Its envelope is the <strong>singular solution</strong>. Equations of degree two in <InlineMath math={"p"} /> are split into two first-order equations.
      </MethodHeader>
      <FormulaBox label="THE SOLUTIONS" tag="p = dy/dx">
        <Formula math={"y = cx + f(c), \\qquad \\text{singular: } x + f'(p) = 0 \\text{ with } p \\text{ eliminated}"} />
        <FormulaSteps steps={[
          { title: "1. Differentiate", text: <>p = p + (x + f′(p))p′.</> },
          { title: "2. p′ = 0", text: <>p = c: the family of lines.</> },
          { title: "3. x + f′(p) = 0", text: <>Eliminate p: the singular solution.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve y = px + p².</ExampleProblem>
        <ExampleStep n={1} title="GENERAL"><MathPanel><BlockMath math={"\\frac{dp}{dx}(x + 2p) = 0 \\Rightarrow p = c: \\quad y = cx + c^2"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="SINGULAR"><MathPanel><BlockMath math={"x + 2p = 0 \\Rightarrow p = -\\frac{x}{2} \\Rightarrow y = -\\frac{x^2}{2} + \\frac{x^2}{4} = -\\frac{x^2}{4}"} /></MathPanel><StepText>The parabola x² = −4y touches every line of the family.</StepText></ExampleStep>
        <Conclusion result="y = cx + c², singular y = −x²/4" math={<BlockMath math={"y = cx + c^2, \\qquad x^2 + 4y = 0"} />}>The calculator below opens on this equation.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Clairaut's Equation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["ode-solver","homogeneous-ode","exact-ode"]} />
    </MethodPage>
  );
}
