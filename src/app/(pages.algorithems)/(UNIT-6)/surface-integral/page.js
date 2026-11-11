'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.surface-integral';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What is dS for z = g(x, y)?", a: <>dS = √(1 + g_x² + g_y²) dx dy, and the upward normal is (−g_x, −g_y, 1) dx dy.</> },
  { q: "Which coordinates for a ball or a cylinder?", a: <>Spherical (dV = r² sin φ dr dφ dθ) for a ball and cylindrical (dV = ρ dρ dz dθ) for a cylinder; the page does this for you.</> },
  { q: "How is the answer checked?", a: <>Every integral is also worked out numerically; an exact form is shown only when it matches.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Surface Integral Calculator" subtitle="Flux, Surface Area and Volume Integrals">
        Describe a surface by <InlineMath math={"\\mathbf{r}(u, v)"} />. The normal <InlineMath math={"\\mathbf{N} = \\mathbf{r}_u \\times \\mathbf{r}_v"} /> turns <InlineMath math={"dS"} /> into <InlineMath math={"|\\mathbf{N}|\\,du\\,dv"} />, and the <strong>flux</strong> of a field through the surface is <InlineMath math={"\\iint \\mathbf{F}\\cdot\\mathbf{N}\\,du\\,dv"} />. Volume integrals use Cartesian, cylindrical or spherical coordinates.
      </MethodHeader>
      <FormulaBox label="THE FORMULAS" tag="N = r_u × r_v">
        <Formula math={"\\iint_S \\mathbf{F}\\cdot\\mathbf{n}\\,dS = \\iint \\mathbf{F}(\\mathbf{r})\\cdot(\\mathbf{r}_u \\times \\mathbf{r}_v)\\,du\\,dv, \\qquad \\iint_S f\\,dS = \\iint f(\\mathbf{r})\\,|\\mathbf{r}_u \\times \\mathbf{r}_v|\\,du\\,dv"} />
        <FormulaSteps steps={[
          { title: "1. Parametrise", text: <>r(u, v) and its ranges.</> },
          { title: "2. Normal", text: <>N = r_u × r_v, pointing out.</> },
          { title: "3. Integrate", text: <>A double integral in u, v.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the flux of F = xi + yj + zk out of the sphere x² + y² + z² = 4.</ExampleProblem>
        <ExampleStep n={1} title="PARAMETRISE"><MathPanel><BlockMath math={"\\mathbf{r} = (2\\sin\\phi\\cos\\theta, 2\\sin\\phi\\sin\\theta, 2\\cos\\phi), \\quad \\mathbf{N} = 4\\sin\\phi\\,(\\sin\\phi\\cos\\theta, \\sin\\phi\\sin\\theta, \\cos\\phi)"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="DOT"><MathPanel><BlockMath math={"\\mathbf{F}\\cdot\\mathbf{N} = 8\\sin\\phi"} /></MathPanel><StepText>On the sphere F = r, so F·N = 2·4 sin φ.</StepText></ExampleStep>
        <ExampleStep n={3} title="INTEGRATE"><MathPanel><BlockMath math={"\\int_0^{2\\pi}\\int_0^{\\pi} 8\\sin\\phi\\,d\\phi\\,d\\theta = 8\\cdot 2\\cdot 2\\pi = 32\\pi"} /></MathPanel></ExampleStep>
        <Conclusion result="32π" math={<BlockMath math={"\\iint_S \\mathbf{F}\\cdot\\mathbf{n}\\,dS = 32\\pi"} />}>The calculator below opens on this sphere.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Surface Integral Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["divergence-theorem","triple-integral","stokes-theorem"]} />
    </MethodPage>
  );
}
