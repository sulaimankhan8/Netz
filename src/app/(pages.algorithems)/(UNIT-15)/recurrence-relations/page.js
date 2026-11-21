'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.recurrence-relations';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit15';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What if the extra term matches a root?", a: <>Multiply the trial by n (by n² for a double root): for aₙ = 5aₙ₋₁ − 6aₙ₋₂ + 2ⁿ the trial is Cn·2ⁿ, not C·2ⁿ.</> },
  { q: "How is the answer checked?", a: <>The relation is run term by term from the starting values and compared with the formula (the table below the steps).</> },
  { q: "Is this the same as a difference equation?", a: <>Yes; the Z-transform page solves the same equations by another method.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 15 • DISCRETE MATHS & OPTIMISATION" title="Recurrence Relation Solver" subtitle="Characteristic Roots and Particular Solutions">
        A <strong>linear recurrence relation</strong> gives each term from the ones before it. Try <InlineMath math={"a_n = r^n"} />: the <strong>characteristic equation</strong> gives the homogeneous solution, a trial of the same shape as the extra term gives a particular solution, and the starting values fix the constants.
      </MethodHeader>
      <FormulaBox label="THE ROOTS" tag="a_n = r^n">
        <Formula math={"r \\text{ distinct}: \\ A_1r_1^n + A_2r_2^n; \\qquad r \\text{ repeated}: \\ (A_1 + A_2n)r^n; \\qquad \\rho e^{\\pm i\\theta}: \\ \\rho^n(A_1\\cos n\\theta + A_2\\sin n\\theta)"} />
        <FormulaSteps steps={[
          { title: "1. Characteristic", text: <>Roots of the equation in r.</> },
          { title: "2. Particular", text: <>A trial like the extra term.</> },
          { title: "3. Constants", text: <>From the starting values.</> },
        ]} />
        <SymbolKey rows={EX['recurrence-relations'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['recurrence-relations'].example} />
      <CommonMistakes items={EX['recurrence-relations'].mistakes} />
      <Lab heading="Interactive Recurrence Relations Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["difference-equation-z","progressions","modular-arithmetic"]} />
    </MethodPage>
  );
}
