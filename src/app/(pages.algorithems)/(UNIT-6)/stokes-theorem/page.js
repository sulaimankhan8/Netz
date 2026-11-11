'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.stokes-theorem';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Which way round the edge?", a: <>Curl the fingers of your right hand round C; the thumb points along n. For an upward normal, C goes anticlockwise seen from above.</> },
  { q: "Is Green's theorem a special case?", a: <>Yes: Stokes for a flat region in the plane z = 0 with F = (M, N, 0) is exactly Green&apos;s theorem.</> },
  { q: "Why do different surfaces with the same edge give the same flux?", a: <>Because both equal the same line integral round the edge.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Stokes' Theorem Calculator" subtitle="Circulation Round the Edge and Flux of the Curl">
        <strong>Stokes&apos; theorem</strong> says the circulation of <InlineMath math={"\\mathbf{F}"} /> round the edge <InlineMath math={"C"} /> of a surface equals the flux of <InlineMath math={"\\nabla \\times \\mathbf{F}"} /> through it. Both sides are worked out here.
      </MethodHeader>
      <FormulaBox label="STOKES' THEOREM" tag="RIGHT-HAND RULE">
        <Formula math={"\\oint_C \\mathbf{F}\\cdot d\\mathbf{r} = \\iint_S (\\nabla \\times \\mathbf{F})\\cdot\\mathbf{n}\\,dS"} />
        <FormulaSteps steps={[
          { title: "1. Curl", text: <>∇ × F.</> },
          { title: "2. Surface side", text: <>Flux of the curl through S.</> },
          { title: "3. Edge side", text: <>Work round C.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Verify Stokes&apos; theorem for F = (x² + y²)i − 2xy j over the rectangle 0 ≤ x ≤ 2, 0 ≤ y ≤ 3 in z = 0.</ExampleProblem>
        <ExampleStep n={1} title="CURL"><MathPanel><BlockMath math={"\\nabla \\times \\mathbf{F} = (0, 0, -2y - 2y) = (0, 0, -4y)"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="SURFACE SIDE"><MathPanel><BlockMath math={"\\iint (-4y)\\,dx\\,dy = \\int_0^2\\int_0^3 -4y\\,dy\\,dx = -36"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="EDGE SIDE"><MathPanel><BlockMath math={"\\oint = \\int_0^2 x^2dx + \\int_0^3 -4y\\,dy + \\int_2^0 (x^2 + 9)dx + 0 = -36"} /></MathPanel></ExampleStep>
        <Conclusion result="Both sides = −36" math={<BlockMath math={"\\oint_C \\mathbf{F}\\cdot d\\mathbf{r} = -36"} />}>The calculator below opens on this rectangle.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Stokes' Theorem Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["greens-theorem","grad-div-curl","divergence-theorem"]} />
    </MethodPage>
  );
}
