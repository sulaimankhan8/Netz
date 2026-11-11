'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.greens-theorem';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why anticlockwise?", a: <>With the region on your left as you walk round, the theorem has a plus sign. Going clockwise flips the sign of the line integral.</> },
  { q: "How does Green give an area?", a: <>With M = −y, N = x, N_x − M_y = 2, so the area is ½∮(x dy − y dx).</> },
  { q: "What if the region has a hole?", a: <>Then C has two parts: the outer curve anticlockwise and the inner one clockwise.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Green's Theorem Calculator" subtitle="Line Integral and Double Integral, Both Worked Out">
        <strong>Green&apos;s theorem</strong> links a line integral round a closed curve <InlineMath math={"C"} /> with a double integral over the region <InlineMath math={"R"} /> inside it. The page works out both sides independently, so you can see them agree.
      </MethodHeader>
      <FormulaBox label="GREEN'S THEOREM" tag="C ANTICLOCKWISE">
        <Formula math={"\\oint_C (M\\,dx + N\\,dy) = \\iint_R \\left(\\frac{\\partial N}{\\partial x} - \\frac{\\partial M}{\\partial y}\\right)dA"} />
        <FormulaSteps steps={[
          { title: "1. Boundary", text: <>Each piece of C, anticlockwise.</> },
          { title: "2. Line side", text: <>Add the line integrals.</> },
          { title: "3. Area side", text: <>∬(N_x − M_y) dA.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Verify Green&apos;s theorem for ∮(3x² − 8y²)dx + (4y − 6xy)dy, C the boundary of the region between y = x² and y = √x.</ExampleProblem>
        <ExampleStep n={1} title="ALONG y = x²"><MathPanel><BlockMath math={"\\int_0^1 \\left(3x^2 - 8x^4 + (4x^2 - 6x^3)2x\\right)dx = -1"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="ALONG y = √x (BACK)"><MathPanel><BlockMath math={"\\int_1^0 \\left(3x^2 - 8x + (4\\sqrt x - 6x^{3/2})\\tfrac{1}{2\\sqrt x}\\right)dx = \\frac52"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="DOUBLE INTEGRAL"><MathPanel><BlockMath math={"\\iint (-6y + 16y)\\,dA = \\int_0^1\\int_{x^2}^{\\sqrt x} 10y\\,dy\\,dx = \\frac32"} /></MathPanel><StepText>The line side is −1 + 5/2 = 3/2 as well.</StepText></ExampleStep>
        <Conclusion result="Both sides = 3/2" math={<BlockMath math={"\\oint_C = \\iint_R = \\frac32"} />}>The calculator below opens on this region.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Green's Theorem Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["line-integral","stokes-theorem","double-integral"]} />
    </MethodPage>
  );
}
