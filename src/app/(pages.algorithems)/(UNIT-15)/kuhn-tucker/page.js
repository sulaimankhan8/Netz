'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.kuhn-tucker';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit15';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['kuhn-tucker'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['kuhn-tucker'].example} />
      <CommonMistakes items={EX['kuhn-tucker'].mistakes} />
      <Lab heading="Interactive Kuhn-Tucker Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["lagrange-multipliers","simplex","maxima-minima-2var"]} />
    </MethodPage>
  );
}
