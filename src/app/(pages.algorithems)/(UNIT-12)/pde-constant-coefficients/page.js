'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.pde-constant-coefficients';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit12';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What about a repeated root?", a: <>m repeated gives φ₁(y + mx) + xφ₂(y + mx), just like (C₁ + C₂x)e^{'{'}mx{'}'} for ODEs.</> },
  { q: "What if f(a, b) = 0?", a: <>The shortcut fails, and the general rule ∫F(x, c − mx) dx is used for each factor; for e^{'{'}x+y{'}'} with (D − D′)² it gives x²e^{'{'}x+y{'}'}/2.</> },
  { q: "Which equations are homogeneous here?", a: <>Those whose operator terms all have the same order, like D² − 2DD′ + D′². Terms such as D − D′ − 1 need a different method.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Linear PDE with Constant Coefficients" subtitle="Complementary Function and Particular Integral">
        For a homogeneous linear PDE <InlineMath math={"f(D, D')z = F(x, y)"} />, put <InlineMath math={"D = m"} />, <InlineMath math={"D' = 1"} />: each root of the <strong>auxiliary equation</strong> gives an arbitrary function <InlineMath math={"\\phi(y + mx)"} />. The <strong>particular integral</strong> comes from short rules, or the general rule for each factor.
      </MethodHeader>
      <FormulaBox label="THE RULES" tag="D = ∂/∂x, D′ = ∂/∂y">
        <Formula math={"\\text{CF} = \\sum \\phi_i(y + m_ix), \\quad \\frac{1}{f(D, D')}e^{ax+by} = \\frac{e^{ax+by}}{f(a, b)}, \\quad \\frac{1}{D - mD'}F = \\int F(x, c - mx)\\,dx\\Big|_{c = y + mx}"} />
        <FormulaSteps steps={[
          { title: "1. Auxiliary", text: <>f(m, 1) = 0.</> },
          { title: "2. CF", text: <>φ(y + mx) for each root.</> },
          { title: "3. PI", text: <>Shortcut or the general rule.</> },
        ]} />
        <SymbolKey rows={EX['pde-constant-coefficients'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['pde-constant-coefficients'].example} />
      <CommonMistakes items={EX['pde-constant-coefficients'].mistakes} />
      <Lab heading="Interactive Linear PDEs Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["ode-cc","lagrange-linear-pde","separation-of-variables"]} />
    </MethodPage>
  );
}
