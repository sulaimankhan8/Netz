'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import EulerHomogeneousCalculator from './algorithems.euler-theorem-homogeneous';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What is a homogeneous function?', a: <>One where scaling every variable by t scales the function by tⁿ: <InlineMath math="u(tx, ty) = t^n u(x, y)" />. Every term of a homogeneous polynomial has the same total degree, like x³ + 3x²y + y³ (degree 3).</> },
  { q: 'What if u itself is not homogeneous?', a: <>Often a function of u is. If <InlineMath math="u = \sin^{-1} z" /> with z homogeneous of degree n, apply Euler to z = sin u: <InlineMath math="xu_x + yu_y = n\tan u" />. The calculator handles sin⁻¹, cos⁻¹, tan⁻¹ and log.</> },
  { q: 'Where does the second-order formula come from?', a: <>Apply the first-order result to u_x and u_y (each homogeneous of degree n − 1) and add: <InlineMath math="x^2u_{xx} + 2xyu_{xy} + y^2u_{yy} = n(n-1)u" />.</> },
];

export default function EulerHomogeneousPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • MULTIVARIABLE CALCULUS" title="Euler's Theorem on Homogeneous Functions" subtitle="x u_x + y u_y = n u, Step by Step">
        If u is <strong>homogeneous of degree n</strong>, then <InlineMath math="x\frac{\partial u}{\partial x} + y\frac{\partial u}{\partial y} = nu" />. Find the degree, verify the theorem, and use the composite form for <InlineMath math="\sin^{-1}" />, <InlineMath math="\tan^{-1}" /> and log.
      </MethodHeader>
      <FormulaBox label="EULER'S THEOREM" tag="DEGREE n">
        <Formula math={'xu_x + yu_y = nu, \\qquad x^2u_{xx} + 2xy\\,u_{xy} + y^2u_{yy} = n(n-1)u'} />
        <FormulaSteps steps={[
          { title: '1. Degree', text: <>Check u(tx, ty) = tⁿ u(x, y).</> },
          { title: '2. Partials', text: <>Find u_x and u_y.</> },
          { title: '3. Combine', text: <>x u_x + y u_y comes out as n u.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>If <InlineMath math="u = \sin^{-1}\frac{x^2 + y^2}{x + y}" />, show that <InlineMath math="xu_x + yu_y = \tan u" />.</ExampleProblem>
        <ExampleStep n={1} title="A HOMOGENEOUS PART"><MathPanel><BlockMath math="z = \sin u = \frac{x^2 + y^2}{x + y}, \qquad z(tx, ty) = t\,z \Rightarrow n = 1" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="EULER FOR z"><MathPanel><BlockMath math="xz_x + yz_y = z \;\Rightarrow\; \cos u\,(xu_x + yu_y) = \sin u" /></MathPanel><StepText>z_x = cos u · u_x by the chain rule.</StepText></ExampleStep>
        <Conclusion result="x u_x + y u_y = tan u" math={<BlockMath math="xu_x + yu_y = \frac{\sin u}{\cos u} = \tan u" />}>The fourth example button below checks it.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Euler's Theorem Calculator"><EulerHomogeneousCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['partial-derivative', 'jacobian', 'derivative']} />
    </MethodPage>
  );
}
