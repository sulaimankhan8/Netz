'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.laplace-transform-ode';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit13';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'Why use Laplace instead of CF + PI?', a: <>The initial conditions go in from the start, so there are no constants to find at the end, and switched or impulsive forcing (u(t − a), δ(t − a)) is no harder than any other.</> },
  { q: 'Where do y(0) and y′(0) appear?', a: <>In the transforms of the derivatives: <InlineMath math="\mathcal{L}\{y''\} = s^2Y - sy(0) - y'(0)" />.</> },
  { q: 'What if no initial values are given?', a: <>They count as 0 here. For a general solution with constants, use the CF + PI page.</> },
];

export default function LaplaceOdePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 13 • TRANSFORMS" title="Solving ODEs by Laplace Transform" subtitle="Initial Value Problems, Step by Step">
        Transform the differential equation, solve the algebraic equation for <InlineMath math="Y(s)" />, then invert: <InlineMath math="y(t) = \mathcal{L}^{-1}\{Y(s)\}" />. Initial conditions are built in.
      </MethodHeader>
      <FormulaBox label="THE METHOD" tag="TRANSFORM, SOLVE, INVERT">
        <Formula math={'\\mathcal{L}\\{y\'\\} = sY - y(0), \\qquad \\mathcal{L}\\{y\'\'\\} = s^2Y - sy(0) - y\'(0)'} />
        <FormulaSteps steps={[
          { title: '1. Transform', text: <>Every term of the equation.</> },
          { title: '2. Solve for Y', text: <>Plain algebra in s.</> },
          { title: '3. Invert', text: <>Partial fractions, then the table.</> },
        ]} />
        <SymbolKey rows={EX['laplace-transform-ode'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['laplace-transform-ode'].example} />
      <CommonMistakes items={EX['laplace-transform-ode'].mistakes} />
      <Lab heading="Interactive Laplace ODE Solver"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['laplace', 'inverse-laplace', 'ode-cc']} />
    </MethodPage>
  );
}
