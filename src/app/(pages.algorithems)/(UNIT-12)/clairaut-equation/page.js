'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.clairaut-equation';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit12';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why is the singular solution not in the family?", a: <>It is the envelope of the lines y = cx + f(c): it touches each one but is not itself a line, so no value of c gives it.</> },
  { q: "What is \"solvable for p\"?", a: <>If the equation factors as (p − g₁)(p − g₂) = 0, each factor is a first-order equation; the general solution combines their solutions.</> },
  { q: "How does NETZ recognise Clairaut's form?", a: <>It checks numerically that x and y enter only through y − px, so forms like p = ln(px − y) are found too.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Clairaut's Equation Calculator" subtitle="General and Singular Solutions, and Equations Solvable for p">
        <strong>Clairaut&apos;s equation</strong> <InlineMath math={"y = px + f(p)"} />, with <InlineMath math={"p = \\frac{dy}{dx}"} />, is solved by replacing <InlineMath math={"p"} /> with a constant. Its envelope is the <strong>singular solution</strong>. Equations of degree two in <InlineMath math={"p"} /> are split into two first-order equations.
      </MethodHeader>
      <FormulaBox label="THE SOLUTIONS" tag="p = dy/dx">
        <Formula math={"y = cx + f(c), \\qquad \\text{singular: } x + f'(p) = 0 \\text{ with } p \\text{ eliminated}"} />
        <FormulaSteps steps={[
          { title: "1. Differentiate", text: <>p = p + (x + f′(p))p′.</> },
          { title: "2. p′ = 0", text: <>p = c: the family of lines.</> },
          { title: "3. x + f′(p) = 0", text: <>Eliminate p: the singular solution.</> },
        ]} />
        <SymbolKey rows={EX['clairaut-equation'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['clairaut-equation'].example} />
      <CommonMistakes items={EX['clairaut-equation'].mistakes} />
      <Lab heading="Interactive Clairaut's Equation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["ode-solver","homogeneous-ode","exact-ode"]} />
    </MethodPage>
  );
}
