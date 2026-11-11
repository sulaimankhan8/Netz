'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.charpit-method';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What are the four standard forms?", a: <>I: f(p, q) = 0. II: f(z, p, q) = 0. III: f₁(x, p) = f₂(y, q). IV: Clairaut, z = px + qy + g(p, q). Each has a known shortcut that Charpit&apos;s equations lead to.</> },
  { q: "What is a complete integral?", a: <>A solution with two arbitrary constants a, b. The singular and general integrals come from it by eliminating a and b.</> },
  { q: "What if no form fits?", a: <>If f_x + pf_z = 0 the auxiliary equations give p = a straight away (likewise for q); NETZ tries that too.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Charpit's Method Calculator" subtitle="Non-Linear First-Order PDEs and the Four Standard Forms">
        For a non-linear first-order PDE <InlineMath math={"f(x, y, z, p, q) = 0"} />, <strong>Charpit&apos;s method</strong> finds a second relation between <InlineMath math={"p"} /> and <InlineMath math={"q"} /> from the auxiliary equations, then integrates <InlineMath math={"dz = p\\,dx + q\\,dy"} /> to a <strong>complete integral</strong> with two constants.
      </MethodHeader>
      <FormulaBox label="CHARPIT'S EQUATIONS" tag="f = 0">
        <Formula math={"\\frac{dp}{f_x + pf_z} = \\frac{dq}{f_y + qf_z} = \\frac{dz}{-pf_p - qf_q} = \\frac{dx}{-f_p} = \\frac{dy}{-f_q}"} />
        <FormulaSteps steps={[
          { title: "1. Form", text: <>Which standard form is it?</> },
          { title: "2. p and q", text: <>Each in terms of a constant a.</> },
          { title: "3. Integrate", text: <>dz = p dx + q dy.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve p² + q² = x + y.</ExampleProblem>
        <ExampleStep n={1} title="FORM III"><MathPanel><BlockMath math={"p^2 - x = y - q^2 = a"} /></MathPanel><StepText>The x, p part and the y, q part separate.</StepText></ExampleStep>
        <ExampleStep n={2} title="p AND q"><MathPanel><BlockMath math={"p = \\sqrt{x + a}, \\quad q = \\sqrt{y - a}"} /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="INTEGRATE"><MathPanel><BlockMath math={"z = \\tfrac23(x + a)^{3/2} + \\tfrac23(y - a)^{3/2} + b"} /></MathPanel></ExampleStep>
        <Conclusion result="z = ⅔(x + a)^{3/2} + ⅔(y − a)^{3/2} + b" math={<BlockMath math={"z = \\tfrac23(x + a)^{3/2} + \\tfrac23(y - a)^{3/2} + b"} />}>The calculator below opens on this equation.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Charpit's Method Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["lagrange-linear-pde","clairaut-equation","formation-of-pde"]} />
    </MethodPage>
  );
}
