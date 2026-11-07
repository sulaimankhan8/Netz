'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.inverse-laplace-transform';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'How do complex roots give sines and cosines?', a: <>A quadratic factor <InlineMath math="(s - \alpha)^2 + \beta^2" /> gives <InlineMath math="e^{\alpha t}\cos\beta t" /> (with s − α on top) and <InlineMath math="e^{\alpha t}\frac{\sin\beta t}{\beta}" /> (with a constant on top).</> },
  { q: 'What does e^(−as) mean?', a: <>A delay: <InlineMath math="\mathcal{L}^{-1}\{e^{-as}F(s)\} = f(t - a)\,u(t - a)" /> — the answer switches on at t = a.</> },
  { q: 'When is convolution useful?', a: <>When F(s) is a product of two transforms you know: <InlineMath math="\mathcal{L}^{-1}\{F_1F_2\} = \int_0^t f_1(u)f_2(t - u)\,du" />, without partial fractions.</> },
];

export default function InverseLaplacePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 13 • TRANSFORMS" title="Inverse Laplace Transform" subtitle="Partial Fractions, Shifting and Convolution">
        Find f(t) from F(s): split F into <strong>partial fractions</strong>, read each piece off the table, and handle delays e^(−as) and products by <strong>convolution</strong>.
      </MethodHeader>
      <FormulaBox label="KEY RESULTS" tag="L⁻¹{F(s)}">
        <Formula math={'\\mathcal{L}^{-1}\\left\\{\\frac{1}{(s-a)^n}\\right\\} = \\frac{t^{n-1}e^{at}}{(n-1)!}, \\quad \\mathcal{L}^{-1}\\left\\{\\frac{s - \\alpha}{(s-\\alpha)^2+\\beta^2}\\right\\} = e^{\\alpha t}\\cos\\beta t'} />
        <FormulaSteps steps={[
          { title: '1. Factor', text: <>The bottom: real and complex roots.</> },
          { title: '2. Split', text: <>Partial fractions.</> },
          { title: '3. Invert', text: <>Each fraction from the table.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find <InlineMath math="\mathcal{L}^{-1}\left\{\frac{1}{s^2 - 3s + 2}\right\}" />.</ExampleProblem>
        <ExampleStep n={1} title="PARTIAL FRACTIONS"><MathPanel><BlockMath math="\frac{1}{(s - 1)(s - 2)} = \frac{1}{s - 2} - \frac{1}{s - 1}" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="INVERT"><StepText>Each 1/(s − a) gives eᵃᵗ.</StepText></ExampleStep>
        <Conclusion result="e²ᵗ − eᵗ" math={<BlockMath math="f(t) = e^{2t} - e^{t}" />}>The calculator below opens on this example.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Inverse Laplace Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['laplace', 'laplace-ode', 'unit-step']} />
    </MethodPage>
  );
}
