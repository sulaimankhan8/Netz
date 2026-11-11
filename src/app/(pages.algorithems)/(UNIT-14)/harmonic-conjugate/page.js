'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.harmonic-conjugate';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why put x = z and y = 0?", a: <>Both sides of f′(z) = uₓ − i u_y are analytic, so if they agree on the real axis (y = 0) they agree everywhere. That turns the right side into a function of z.</> },
  { q: "Is the conjugate unique?", a: <>Up to an added constant: v + C works for any real C.</> },
  { q: "What if u is not harmonic?", a: <>Then it is not the real part of any analytic function, and no conjugate exists.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 14 • COMPLEX VARIABLES" title="Harmonic Conjugate Calculator" subtitle="Milne-Thomson Method, Step by Step">
        A function is <strong>harmonic</strong> when <InlineMath math={"u_{xx} + u_{yy} = 0"} />. Every harmonic <InlineMath math={"u"} /> is the real part of an analytic <InlineMath math={"f"} />; its partner <InlineMath math={"v"} /> is the <strong>harmonic conjugate</strong>. The Milne-Thomson method finds <InlineMath math={"f(z)"} /> directly.
      </MethodHeader>
      <FormulaBox label="MILNE-THOMSON" tag="x = z, y = 0">
        <Formula math={"f'(z) = u_x(z, 0) - i\\,u_y(z, 0), \\qquad f(z) = \\int f'(z)\\,dz, \\qquad v = \\operatorname{Im} f"} />
        <FormulaSteps steps={[
          { title: "1. Harmonic?", text: <>Check uₓₓ + u_yy = 0.</> },
          { title: "2. Milne-Thomson", text: <>Put x = z, y = 0 in uₓ − i u_y.</> },
          { title: "3. Integrate", text: <>Then v = Im f(x + iy).</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Show u = x³ − 3xy² is harmonic and find its conjugate.</ExampleProblem>
        <ExampleStep n={1} title="HARMONIC"><MathPanel><BlockMath math={"u_{xx} + u_{yy} = 6x - 6x = 0"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="MILNE-THOMSON"><MathPanel><BlockMath math={"u_x = 3x^2 - 3y^2, \\ u_y = -6xy \\Rightarrow f'(z) = 3z^2"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="INTEGRATE"><MathPanel><BlockMath math={"f(z) = z^3 \\Rightarrow v = \\operatorname{Im}(x + iy)^3 = 3x^2y - y^3"} /></MathPanel></ExampleStep>
        <Conclusion result="v = 3x²y − y³" math={<BlockMath math={"v = 3x^2y - y^3 + C"} />}>The calculator below opens on this function.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Harmonic Conjugate Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["cauchy-riemann","partial-derivative","laurent-series"]} />
    </MethodPage>
  );
}
