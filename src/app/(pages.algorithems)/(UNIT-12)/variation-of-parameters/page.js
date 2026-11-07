'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.variation-of-parameters';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'When should I use variation of parameters?', a: <>When the right side is not a simple xᵏ, eᵃˣ, sin or cos — for example sec x, tan x or eˣ/x — so the shortcut rules for the particular integral don&apos;t apply.</> },
  { q: 'What is the Wronskian?', a: <><InlineMath math="W = y_1y_2' - y_2y_1'" />, built from the two parts of the CF. It is never 0 for a proper pair y₁, y₂.</> },
  { q: 'Do I need constants in the integrals?', a: <>No: any constant would just add a multiple of y₁ or y₂, which the CF already has.</> },
];

export default function VariationPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Variation of Parameters" subtitle="The Particular Integral for Any Right Side">
        For <InlineMath math="y'' + py' + qy = R(x)" /> with CF <InlineMath math="C_1y_1 + C_2y_2" />, <strong>variation of parameters</strong> gives <InlineMath math="\text{PI} = -y_1\int \frac{y_2R}{W}dx + y_2\int \frac{y_1R}{W}dx" />.
      </MethodHeader>
      <FormulaBox label="THE FORMULA" tag="WRONSKIAN">
        <Formula math={'W = y_1y_2\' - y_2y_1\', \\qquad \\text{PI} = -y_1\\int \\frac{y_2R}{W}\\,dx + y_2\\int \\frac{y_1R}{W}\\,dx'} />
        <FormulaSteps steps={[
          { title: '1. CF', text: <>Find y₁ and y₂.</> },
          { title: '2. W', text: <>The Wronskian.</> },
          { title: '3. Two integrals', text: <>Then combine into the PI.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve <InlineMath math="y'' + y = \sec x" />.</ExampleProblem>
        <ExampleStep n={1} title="CF AND W"><MathPanel><BlockMath math="y_1 = \cos x, \ y_2 = \sin x, \qquad W = \cos^2 x + \sin^2 x = 1" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="INTEGRALS"><MathPanel><BlockMath math="\int \sin x\sec x\,dx = -\ln|\cos x|, \qquad \int \cos x\sec x\,dx = x" /></MathPanel></ExampleStep>
        <Conclusion result="PI = cos x ln|cos x| + x sin x" math={<BlockMath math="y = C_1\cos x + C_2\sin x + \cos x\ln|\cos x| + x\sin x" />}>The calculator below opens on this equation.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Variation of Parameters Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['ode-cc', 'cauchy-euler', 'ode-solver']} />
    </MethodPage>
  );
}
