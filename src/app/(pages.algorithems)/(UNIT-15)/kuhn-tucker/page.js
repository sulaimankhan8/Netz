'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.kuhn-tucker';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "When are the conditions enough?", a: <>For a concave objective (to maximise) with convex constraints, any KKT point is the global optimum; NETZ checks concavity at the point.</> },
  { q: "What does λ mean?", a: <>The rate at which the best value grows as the constraint is relaxed: the shadow price.</> },
  { q: "How are ≥ constraints handled?", a: <>They are turned round to ≤ (x ≥ 0 becomes −x ≤ 0).</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 15 • DISCRETE MATHS & OPTIMISATION" title="Kuhn-Tucker Conditions Calculator" subtitle="Non-Linear Optimisation with Inequality Constraints">
        The <strong>Kuhn–Tucker (KKT) conditions</strong> extend Lagrange multipliers to inequality constraints. Each constraint is either <strong>active</strong> (holds with equality, <InlineMath math={"\\lambda \\ge 0"} />) or slack (<InlineMath math={"\\lambda = 0"} />); trying each case finds the optimum.
      </MethodHeader>
      <FormulaBox label="KKT FOR A MAXIMUM" tag="g_i ≤ 0">
        <Formula math={"\\nabla f = \\sum \\lambda_i \\nabla g_i, \\qquad \\lambda_i\\,g_i = 0, \\qquad \\lambda_i \\ge 0, \\qquad g_i \\le 0"} />
        <FormulaSteps steps={[
          { title: "1. Lagrangian", text: <>L = f − Σλᵢgᵢ.</> },
          { title: "2. Cases", text: <>Each set of active constraints.</> },
          { title: "3. Check", text: <>Feasible, λ ≥ 0: a KKT point.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Maximise Z = 10x + 4y − 2x² − y² subject to 2x + y ≤ 5, x, y ≥ 0.</ExampleProblem>
        <ExampleStep n={1} title="NO CONSTRAINT ACTIVE"><MathPanel><BlockMath math={"10 - 4x = 0, \\ 4 - 2y = 0 \\Rightarrow (2.5, 2), \\text{ but } 2x + y = 7 > 5"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="2x + y = 5 ACTIVE"><MathPanel><BlockMath math={"10 - 4x = 2\\lambda, \\ 4 - 2y = \\lambda, \\ 2x + y = 5 \\Rightarrow x = \\tfrac{11}{6}, \\ y = \\tfrac43, \\ \\lambda = \\tfrac43 \\ge 0"} /></MathPanel></ExampleStep>
        <Conclusion result="x = 11/6, y = 4/3, Z = 91/6" math={<BlockMath math={"x = \\tfrac{11}{6}, \\ y = \\tfrac43, \\qquad Z_{\\max} = \\tfrac{91}{6}"} />}>The calculator below opens on this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Kuhn-Tucker Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["lagrange-multipliers","simplex","maxima-minima-2var"]} />
    </MethodPage>
  );
}
