'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.series-solution-ode';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve Legendre&apos;s equation (1 − x²)y″ − 2xy′ + 6y = 0 in series about x = 0.</ExampleProblem>
        <ExampleStep n={1} title="RECURRENCE"><MathPanel><BlockMath math={"(n + 2)(n + 1)c_{n+2} - (n(n + 1) - 6)c_n = 0 \\Rightarrow c_{n+2} = \\frac{(n - 2)(n + 3)}{(n + 1)(n + 2)}c_n"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="EVEN SERIES"><MathPanel><BlockMath math={"c_2 = -3c_0, \\ c_4 = 0, \\ c_6 = 0, \\ldots"} /></MathPanel><StepText>It stops: 1 − 3x² is (up to a factor) the Legendre polynomial P₂.</StepText></ExampleStep>
        <ExampleStep n={3} title="ODD SERIES"><MathPanel><BlockMath math={"c_3 = -\\tfrac23 c_1, \\ c_5 = -\\tfrac15 c_1, \\ldots"} /></MathPanel></ExampleStep>
        <Conclusion result="y = c₀(1 − 3x²) + c₁(x − ⅔x³ − ⅕x⁵ − ⋯)" math={<BlockMath math={"y = c_0(1 - 3x^2) + c_1\\left(x - \\tfrac23x^3 - \\tfrac15x^5 - \\cdots\\right)"} />}>The calculator below opens on this equation.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Series Solutions Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["power-series","taylor-series","ode-cc"]} />
    </MethodPage>
  );
}
