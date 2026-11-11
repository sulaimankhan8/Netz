'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.difference-equation-z-transform';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What if the equation uses y(n − 1)?", a: <>Replace n by n + 1 (or n + 2) so the lowest term is y(n); the starting values are then y(0), y(1).</> },
  { q: "How is the answer checked?", a: <>The recurrence is run step by step from the starting values and compared with the formula.</> },
  { q: "Where does the Fibonacci formula come from?", a: <>Y = z/(z² − z − 1) has poles at (1 ± √5)/2, which gives Binet&apos;s formula.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 13 • FOURIER & Z TRANSFORMS" title="Difference Equation Solver (Z-Transform)" subtitle="Shift Rule, Partial Fractions and a Check">
        A linear <strong>difference equation</strong> links <InlineMath math={"y(n)"} />, <InlineMath math={"y(n + 1)"} />, … like a differential equation links <InlineMath math={"y, y'"} />. The <strong>Z-transform</strong> turns it into algebra for <InlineMath math={"Y(z)"} />, with the starting values built in.
      </MethodHeader>
      <FormulaBox label="THE SHIFT RULE" tag="y(0), y(1) GIVEN">
        <Formula math={"\\mathcal{Z}\\{y(n + 1)\\} = zY - zy(0), \\qquad \\mathcal{Z}\\{y(n + 2)\\} = z^2Y - z^2y(0) - zy(1)"} />
        <FormulaSteps steps={[
          { title: "1. Transform", text: <>Each shifted term, and the right side.</> },
          { title: "2. Solve", text: <>For Y(z): plain algebra.</> },
          { title: "3. Invert", text: <>Partial fractions of Y(z)/z.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve y(n+2) − 3y(n+1) + 2y(n) = 0 with y(0) = 0, y(1) = 1.</ExampleProblem>
        <ExampleStep n={1} title="TRANSFORM"><MathPanel><BlockMath math={"(z^2Y - z) - 3zY + 2Y = 0"} /></MathPanel><StepText>y(0) = 0, so only the zy(1) = z term remains.</StepText></ExampleStep>
        <ExampleStep n={2} title="SOLVE"><MathPanel><BlockMath math={"Y(z) = \\frac{z}{z^2 - 3z + 2} = \\frac{z}{(z - 1)(z - 2)}"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="INVERT"><MathPanel><BlockMath math={"\\frac{Y}{z} = \\frac{-1}{z - 1} + \\frac{1}{z - 2} \\;\\Rightarrow\\; y(n) = 2^n - 1"} /></MathPanel></ExampleStep>
        <Conclusion result="y(n) = 2ⁿ − 1" math={<BlockMath math={"y(n) = 2^n - 1"} />}>The calculator below opens on a forced equation.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Difference Equations Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["z-transform","inverse-z","recurrence-relations"]} />
    </MethodPage>
  );
}
