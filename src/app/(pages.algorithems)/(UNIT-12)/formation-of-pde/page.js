'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.formation-of-pde';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "How many constants can be removed with p and q?", a: <>Two. With three constants you need second derivatives r, s, t as well.</> },
  { q: "Why is z = f(x² + y²) the same as yp − xq = 0?", a: <>p = 2x f′, q = 2y f′, so p/q = x/y and f′ cancels.</> },
  { q: "What does f(u, v) = 0 give?", a: <>Always a first-order linear PDE, Lagrange&apos;s form Pp + Qq = R, with P, Q, R the Jacobians of u and v.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Formation of Partial Differential Equations" subtitle="By Eliminating Constants or Arbitrary Functions">
        A family of surfaces gives a <strong>PDE</strong> once its free parts are removed. Differentiate with respect to <InlineMath math={"x"} /> and <InlineMath math={"y"} /> (<InlineMath math={"p = \\frac{\\partial z}{\\partial x}"} />, <InlineMath math={"q = \\frac{\\partial z}{\\partial y}"} />), then eliminate the constants or the arbitrary function.
      </MethodHeader>
      <FormulaBox label="THE TWO KINDS" tag="p, q">
        <Formula math={"z = F(x, y, a, b) \\to F(x, y, z, p, q) = 0; \\qquad \\phi(u, v) = 0 \\to Pp + Qq = R, \\ P = \\frac{\\partial(u, v)}{\\partial(y, z)}"} />
        <FormulaSteps steps={[
          { title: "1. Differentiate", text: <>Find p and q.</> },
          { title: "2. Solve", text: <>For the constants (or f′).</> },
          { title: "3. Eliminate", text: <>Substitute back.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Form the PDE by eliminating a and b from z = (x − a)² + (y − b)².</ExampleProblem>
        <ExampleStep n={1} title="DIFFERENTIATE"><MathPanel><BlockMath math={"p = 2(x - a), \\quad q = 2(y - b)"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="ELIMINATE"><MathPanel><BlockMath math={"x - a = \\frac p2, \\ y - b = \\frac q2 \\Rightarrow z = \\frac{p^2}{4} + \\frac{q^2}{4}"} /></MathPanel></ExampleStep>
        <Conclusion result="4z = p² + q²" math={<BlockMath math={"4z = p^2 + q^2"} />}>The calculator below opens on this family.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Formation of PDEs Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["lagrange-linear-pde","partial-derivative","charpit-method"]} />
    </MethodPage>
  );
}
