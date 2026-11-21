'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.differential-equation-solver';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit12';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'How does the solver choose a method?', a: <>For a first-order equation it rewrites it as y′ = F(x, y) and tests, in order: variables separable, linear, homogeneous, Bernoulli, exact. For higher order it uses constant coefficients (CF + PI) or Cauchy–Euler. It tells you every type the equation fits.</> },
  { q: 'Can I give initial conditions?', a: <>Yes: type them like <InlineMath math="y(0) = 1, \ y'(0) = 0" />. The constants are then found and the particular solution is shown.</> },
  { q: 'How do I know the answer is right?', a: <>Every solution is put back into the equation at several points and must satisfy it. You can do the same check by hand: differentiate and substitute.</> },
];

export default function OdeSolverPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Differential Equation Solver" subtitle="First and Higher Order, Step by Step">
        Type an <strong>ordinary differential equation</strong> and get the method, the working and the general solution. First order: separable, homogeneous, linear, Bernoulli, exact. Higher order: constant coefficients and Cauchy–Euler.
      </MethodHeader>
      <FormulaBox label="WHICH METHOD?" tag="CLASSIFY FIRST">
        <Formula math={'\\frac{dy}{dx} = g(x)h(y) \\ \\text{(separable)}, \\quad \\frac{dy}{dx} + Py = Q \\ \\text{(linear)}, \\quad f(D)y = R \\ \\text{(CF + PI)}'} />
        <FormulaSteps steps={[
          { title: '1. Order', text: <>The highest derivative.</> },
          { title: '2. Type', text: <>Match a standard form.</> },
          { title: '3. Solve and check', text: <>Then put the answer back in.</> },
        ]} />
        <SymbolKey rows={EX['differential-equation-solver'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['differential-equation-solver'].example} />
      <CommonMistakes items={EX['differential-equation-solver'].mistakes} />
      <Lab heading="Interactive Differential Equation Solver"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['linear-ode', 'ode-cc', 'runge-kutta']} />
    </MethodPage>
  );
}
