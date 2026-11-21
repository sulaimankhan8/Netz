'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.ode-constant-coefficients';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit12';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'How do the roots give the CF?', a: <>Distinct real roots m₁, m₂: <InlineMath math="C_1e^{m_1x} + C_2e^{m_2x}" />. A repeated root m: <InlineMath math="(C_1 + C_2x)e^{mx}" />. Complex roots α ± iβ: <InlineMath math="e^{\alpha x}(C_1\cos\beta x + C_2\sin\beta x)" />.</> },
  { q: 'What is the "case of failure"?', a: <>When eᵃˣ has f(a) = 0 (a is a root), 1/f(D) eᵃˣ = eᵃˣ/f(a) breaks. Then multiply by x: <InlineMath math="\frac{x\,e^{ax}}{f'(a)}" />. The same happens for sin bx when ±ib are roots.</> },
  { q: 'Which right sides can it handle?', a: <>Any sum of terms like xᵏ, eᵃˣ, sin bx, cos bx and their products (e.g. x²eˣ cos 2x). For others, use variation of parameters.</> },
];

export default function OdeConstantPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Linear ODEs With Constant Coefficients" subtitle="Complementary Function + Particular Integral">
        Solve <InlineMath math="f(D)y = R(x)" />: the <strong>auxiliary equation</strong> f(m) = 0 gives the complementary function, and <InlineMath math="\frac{1}{f(D)}R" /> the particular integral. Then <InlineMath math="y = \text{CF} + \text{PI}" />.
      </MethodHeader>
      <FormulaBox label="THE SOLUTION" tag="y = CF + PI">
        <Formula math={'\\frac{1}{f(D)}e^{ax} = \\frac{e^{ax}}{f(a)}, \\quad \\frac{1}{f(D^2)}\\sin bx = \\frac{\\sin bx}{f(-b^2)}, \\quad \\frac{1}{f(D)}e^{ax}V = e^{ax}\\frac{1}{f(D + a)}V'} />
        <FormulaSteps steps={[
          { title: '1. Auxiliary equation', text: <>Replace D by m and solve.</> },
          { title: '2. CF', text: <>One term per root.</> },
          { title: '3. PI', text: <>The shortcut rules, or undetermined coefficients.</> },
        ]} />
        <SymbolKey rows={EX['ode-constant-coefficients'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['ode-constant-coefficients'].example} />
      <CommonMistakes items={EX['ode-constant-coefficients'].mistakes} />
      <Lab heading="Interactive CF + PI Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['variation-of-parameters', 'cauchy-euler', 'ode-solver']} />
    </MethodPage>
  );
}
