'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.trigonometric-equations';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit9';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why is there a general solution?", a: <>Trig functions repeat, so if one angle solves the equation, infinitely many do. The general solution lists them all with an integer n.</> },
  { q: "Why are some roots rejected?", a: <>Rewriting tan or sec in sin and cos can bring in angles where the original equation is undefined (cos x = 0 for tan x). Every family is checked in the original equation.</> },
  { q: "How is a sin x + b cos x = c solved?", a: <>Write the left side as R cos(x − φ) with R = √(a² + b²) and tan φ = a/b, then solve one cosine equation.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 9 • TRIGONOMETRY" title="Trigonometric Equation Solver" subtitle="General Solutions, Step by Step">
        Solve a trig equation for <strong>every</strong> angle. Reduce it to one function, find the principal value <InlineMath math={"\\alpha"} />, then write the general solution with an integer <InlineMath math={"n"} />. The solutions in <InlineMath math={"[0, 2\\pi)"} /> are listed in radians and degrees.
      </MethodHeader>
      <FormulaBox label="GENERAL SOLUTIONS" tag="n ∈ ℤ">
        <Formula math={"\\sin\\theta = \\sin\\alpha \\Rightarrow \\theta = n\\pi + (-1)^n\\alpha, \\quad \\cos\\theta = \\cos\\alpha \\Rightarrow \\theta = 2n\\pi \\pm \\alpha, \\quad \\tan\\theta = \\tan\\alpha \\Rightarrow \\theta = n\\pi + \\alpha"} />
        <FormulaSteps steps={[
          { title: "1. One function", text: <>Use sin² + cos² = 1 or divide by cosᵐ.</> },
          { title: "2. Principal value", text: <>Solve for the function, then α.</> },
          { title: "3. General solution", text: <>The formula for that function.</> },
        ]} />
        <SymbolKey rows={EX['trigonometric-equations'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['trigonometric-equations'].example} />
      <CommonMistakes items={EX['trigonometric-equations'].mistakes} />
      <Lab heading="Interactive Trig Equation Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["trig-identities","inverse-trig","unit-circle"]} />
    </MethodPage>
  );
}
