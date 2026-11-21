'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.lagrange-linear-pde';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit12';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "How are multipliers chosen?", a: <>Try the standard sets (1, 1, 1), (x, y, z), (1/x, 1/y, 1/z) and similar ones until lP + mQ + nR = 0; then l dx + m dy + n dz is the differential of an integral.</> },
  { q: "What if a pair still has the third letter?", a: <>Use the first integral to replace it (for example y = c₁ − 2x), integrate with c₁ as a constant, then put c₁ back.</> },
  { q: "How are the integrals checked?", a: <>Each u satisfies P u_x + Q u_y + R u_z = 0, which is what makes φ(u, v) = 0 a solution.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Lagrange's Linear PDE Solver" subtitle="Pp + Qq = R by Grouping and Multipliers">
        A first-order linear PDE <InlineMath math={"Pp + Qq = R"} /> is solved through its <strong>auxiliary equations</strong> <InlineMath math={"\\frac{dx}{P} = \\frac{dy}{Q} = \\frac{dz}{R}"} />. Two independent integrals <InlineMath math={"u = c_1"} />, <InlineMath math={"v = c_2"} /> give the general solution <InlineMath math={"\\phi(u, v) = 0"} />.
      </MethodHeader>
      <FormulaBox label="AUXILIARY EQUATIONS" tag="φ ARBITRARY">
        <Formula math={"\\frac{dx}{P} = \\frac{dy}{Q} = \\frac{dz}{R} = \\frac{l\\,dx + m\\,dy + n\\,dz}{lP + mQ + nR}"} />
        <FormulaSteps steps={[
          { title: "1. Group", text: <>A pair with two letters only.</> },
          { title: "2. Multipliers", text: <>lP + mQ + nR = 0 makes l dx + m dy + n dz = 0.</> },
          { title: "3. Combine", text: <>φ(u, v) = 0.</> },
        ]} />
        <SymbolKey rows={EX['lagrange-linear-pde'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['lagrange-linear-pde'].example} />
      <CommonMistakes items={EX['lagrange-linear-pde'].mistakes} />
      <Lab heading="Interactive Lagrange's Equation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["formation-of-pde","charpit-method","pde-constant-coefficients"]} />
    </MethodPage>
  );
}
