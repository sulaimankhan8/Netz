'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.series-solution-ode';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit12';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What is an ordinary point?", a: <>A point where the coefficient of y″ is not zero, so the equation can be divided by it. Two ordinary power series then exist.</> },
  { q: "When does Frobenius give only one series?", a: <>When the indicial roots are equal or differ by a whole number and the recurrence breaks; the second solution then has a ln x term.</> },
  { q: "Where do Bessel functions come from?", a: <>Bessel&apos;s equation x²y″ + xy′ + (x² − ν²)y = 0 has indicial roots ±ν; the series for r = ν is J_ν(x) up to a constant.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Series Solution of Differential Equations" subtitle="Power Series and the Frobenius Method">
        When the coefficients are polynomials, try <InlineMath math={"y = \\sum c_n x^n"} />. Matching powers of <InlineMath math={"x"} /> gives a <strong>recurrence relation</strong> for the <InlineMath math={"c_n"} />. At a regular singular point the <strong>Frobenius method</strong> uses <InlineMath math={"y = \\sum c_n x^{n + r}"} />, with <InlineMath math={"r"} /> from the indicial equation.
      </MethodHeader>
      <FormulaBox label="THE TWO CASES" tag="ABOUT x = 0">
        <Formula math={"P(0) \\neq 0: \\ y = \\sum_{n=0}^{\\infty} c_n x^n; \\qquad P(0) = 0 \\text{ (regular)}: \\ y = \\sum_{n=0}^{\\infty} c_n x^{n + r}"} />
        <FormulaSteps steps={[
          { title: "1. Substitute", text: <>The series into the equation.</> },
          { title: "2. Match powers", text: <>Coefficient of xⁿ = 0: the recurrence.</> },
          { title: "3. Build y", text: <>From c₀ and c₁ (or each root r).</> },
        ]} />
        <SymbolKey rows={EX['series-solution-ode'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['series-solution-ode'].example} />
      <CommonMistakes items={EX['series-solution-ode'].mistakes} />
      <Lab heading="Interactive Series Solutions Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["power-series","taylor-series","ode-cc"]} />
    </MethodPage>
  );
}
