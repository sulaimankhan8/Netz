'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.unit-step-function';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'How do I write a piecewise function with unit steps?', a: <>A piece g(t) on a &lt; t &lt; b is <InlineMath math="g(t)[u(t - a) - u(t - b)]" />. Add the pieces. The calculator does this for you.</> },
  { q: 'What is the Laplace transform of the Dirac delta?', a: <><InlineMath math="\mathcal{L}\{\delta(t - a)\} = e^{-as}" />, and 1 for δ(t). The delta is an instant kick of total size 1.</> },
  { q: 'Why divide by 1 − e^(−sT) for periodic functions?', a: <>The integral over each period repeats, shrunk by e^(−sT) each time; adding the geometric series gives the factor <InlineMath math="\frac{1}{1 - e^{-sT}}" />.</> },
];

export default function UnitStepPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 13 • TRANSFORMS" title="Unit Step, Impulse and Periodic Functions" subtitle="Laplace Transforms of Switched and Repeating Signals">
        Transform piecewise functions with the <strong>unit step</strong> u(t − a) and the second shifting theorem, impulses with δ(t − a), and <strong>periodic functions</strong> from one period.
      </MethodHeader>
      <FormulaBox label="THE RULES" tag="SECOND SHIFT">
        <Formula math={'\\mathcal{L}\\{f(t - a)u(t - a)\\} = e^{-as}F(s), \\quad \\mathcal{L}\\{\\delta(t - a)\\} = e^{-as}, \\quad \\mathcal{L}\\{f\\} = \\frac{\\int_0^T e^{-st}f\\,dt}{1 - e^{-sT}}'} />
        <FormulaSteps steps={[
          { title: '1. Unit steps', text: <>Write each piece with u(t − a).</> },
          { title: '2. Shift', text: <>Each u(t − a) gives e^(−as).</> },
          { title: '3. Periodic', text: <>One period, then divide.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Find the transform of <InlineMath math="f(t) = t" /> for 0 &lt; t &lt; 1 and 1 for t &gt; 1.</ExampleProblem>
        <ExampleStep n={1} title="UNIT STEPS"><MathPanel><BlockMath math="f = t - (t - 1)\,u(t - 1)" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="TRANSFORM"><MathPanel><BlockMath math="\mathcal{L}\{t\} = \frac{1}{s^2}, \qquad \mathcal{L}\{(t - 1)u(t - 1)\} = \frac{e^{-s}}{s^2}" /></MathPanel><StepText>Second shifting theorem with a = 1.</StepText></ExampleStep>
        <Conclusion result="(1 − e⁻ˢ)/s²" math={<BlockMath math="F(s) = \frac{1 - e^{-s}}{s^2}" />}>The calculator below opens on this function.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Unit Step Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['laplace', 'inverse-laplace', 'laplace-ode']} />
    </MethodPage>
  );
}
