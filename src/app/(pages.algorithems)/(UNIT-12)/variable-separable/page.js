'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.variable-separable';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'How do I know an equation is separable?', a: <>When dy/dx is a function of x times a function of y: <InlineMath math="\frac{dy}{dx} = x y^2" /> is, <InlineMath math="\frac{dy}{dx} = x + y" /> is not.</> },
  { q: 'Where does the constant go?', a: <>Add one C after integrating both sides. With ln|y| = … + C, write y = Ce^(…): the new C absorbs the sign and e^C.</> },
  { q: 'Do I lose any solutions?', a: <>Dividing by h(y) loses the constant solutions where h(y) = 0, such as y = 0 for dy/dx = xy. They are usually covered by C = 0.</> },
];

export default function VariableSeparablePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 12 • DIFFERENTIAL EQUATIONS" title="Variable Separable" subtitle="dy/dx = g(x) h(y), Step by Step">
        When <InlineMath math="\frac{dy}{dx} = g(x)h(y)" />, put every y on one side and every x on the other, then integrate: <InlineMath math="\int \frac{dy}{h(y)} = \int g(x)\,dx + C" />.
      </MethodHeader>
      <FormulaBox label="THE METHOD" tag="SEPARATE">
        <Formula math={'\\frac{dy}{dx} = g(x)h(y) \\;\\Rightarrow\\; \\int \\frac{dy}{h(y)} = \\int g(x)\\,dx + C'} />
        <FormulaSteps steps={[
          { title: '1. Split', text: <>Write F(x, y) as g(x)·h(y).</> },
          { title: '2. Separate', text: <>dy/h(y) = g(x) dx.</> },
          { title: '3. Integrate', text: <>Both sides, one constant.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve <InlineMath math="\frac{dy}{dx} = xy" />.</ExampleProblem>
        <ExampleStep n={1} title="SEPARATE"><MathPanel><BlockMath math="\frac{dy}{y} = x\,dx" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="INTEGRATE"><MathPanel><BlockMath math="\ln|y| = \frac{x^2}{2} + c" /></MathPanel><StepText>Take e of both sides; C = ±e^c.</StepText></ExampleStep>
        <Conclusion result="y = C e^(x²/2)" math={<BlockMath math="y = Ce^{x^2/2}" />}>The calculator below opens on this equation.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Variable Separable Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['homogeneous-ode', 'linear-ode', 'ode-solver']} />
    </MethodPage>
  );
}
