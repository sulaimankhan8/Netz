'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.laplace-transform-ode';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve <InlineMath math="y'' + 3y' + 2y = e^{-3t}" />, <InlineMath math="y(0) = 1, \ y'(0) = 0" />.</ExampleProblem>
        <ExampleStep n={1} title="TRANSFORM"><MathPanel><BlockMath math="(s^2 + 3s + 2)Y - (s + 3) = \frac{1}{s + 3}" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="SOLVE AND SPLIT"><MathPanel><BlockMath math="Y = \frac{s^2 + 6s + 10}{(s + 1)(s + 2)(s + 3)} = \frac{5/2}{s + 1} - \frac{2}{s + 2} + \frac{1/2}{s + 3}" /></MathPanel></ExampleStep>
        <Conclusion result="y = (5/2)e⁻ᵗ − 2e⁻²ᵗ + ½e⁻³ᵗ" math={<BlockMath math="y(t) = \frac{5}{2}e^{-t} - 2e^{-2t} + \frac{1}{2}e^{-3t}" />}>The calculator below opens on this problem.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Laplace ODE Solver"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['laplace', 'inverse-laplace', 'ode-cc']} />
    </MethodPage>
  );
}
