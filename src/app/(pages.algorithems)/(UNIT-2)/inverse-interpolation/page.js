'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.inverse-interpolation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "When does inverse Lagrange work well?", a: <>When y changes steadily (monotone) across the table, so x really is a function of y.</> },
  { q: "How does the iteration method work?", a: <>Write Newton&apos;s forward formula as p = (y − y₀ − higher terms)/Δy₀ and repeat, starting from p = (y − y₀)/Δy₀.</> },
  { q: "Can I use it to solve equations?", a: <>Yes: tabulate f(x) and find x where f = 0.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 2 • INTERPOLATION" title="Inverse Interpolation Calculator" subtitle="Find x for a Given y from a Table">
        <strong>Inverse interpolation</strong> answers the reverse question: for which <InlineMath math={"x"} /> does the table take a given <InlineMath math={"y"} />? Either swap the roles of <InlineMath math={"x"} /> and <InlineMath math={"y"} /> in Lagrange&apos;s formula, or solve Newton&apos;s formula for <InlineMath math={"p"} /> by iteration.
      </MethodHeader>
      <FormulaBox label="INVERSE LAGRANGE" tag="x AS A FUNCTION OF y">
        <Formula math={"x = \\sum_i x_i\\prod_{j \\ne i}\\frac{y - y_j}{y_i - y_j}"} />
        <FormulaSteps steps={[
          { title: "1. Swap", text: <>Treat x as a function of y.</> },
          { title: "2. Interpolate", text: <>At the given y.</> },
          { title: "3. Or iterate", text: <>p from Newton&apos;s formula.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>From the table of sin x (20°, 25°, 30°, 35°), find x where sin x = 0.390.</ExampleProblem>
        <ExampleStep n={1} title="INVERSE LAGRANGE"><MathPanel><BlockMath math={"x = 20L_0 + 25L_1 + 30L_2 + 35L_3, \\quad L_i = \\prod_{j \\ne i}\\frac{0.390 - y_j}{y_i - y_j}"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="ANSWER"><MathPanel><BlockMath math={"x \\approx 22.93^\\circ"} /></MathPanel><StepText>The exact sin⁻¹ 0.390 is 22.95°.</StepText></ExampleStep>
        <Conclusion result="x ≈ 22.93°" math={<BlockMath math={"x \\approx 22.93^\\circ"} />}>The calculator below opens on this table.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Inverse Interpolation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["lagrange","newton-forward","everett-interpolation"]} />
    </MethodPage>
  );
}
