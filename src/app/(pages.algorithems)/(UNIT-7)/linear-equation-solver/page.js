'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import LinearEquationCalculator from './algorithems.linear-equation-solver';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What makes an equation linear?', a: <>The unknown appears only to the first power: no <InlineMath math="x^2" />, no <InlineMath math="\frac{1}{x}" />, no <InlineMath math="\sqrt{x}" />. Its graph is a straight line, and it has exactly one solution, none, or infinitely many.</> },
  { q: 'Why can I move a term to the other side by changing its sign?', a: <>Because you are really adding or subtracting the same thing on both sides. <InlineMath math="x + 5 = 9" />: subtract 5 from both sides to get <InlineMath math="x = 4" />. &quot;Moving +5 across as −5&quot; is a shortcut for that.</> },
  { q: 'When is there no solution?', a: <>When the x-terms cancel and the numbers left are different, like <InlineMath math="2x + 3 = 2x + 5" /> giving <InlineMath math="3 = 5" />. If the numbers are the same (<InlineMath math="0 = 0" />), every x works.</> },
];

export default function LinearEquationPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 7 • ALGEBRA" title="Linear Equation Solver" subtitle="Solve for x Step by Step">
        A <strong>linear equation</strong> like <InlineMath math="3(x - 2) + 4 = 2x + 7" /> is solved by keeping both sides balanced: clear fractions, expand, collect the x-terms on one side and numbers on the other, then divide.
      </MethodHeader>
      <FormulaBox label="THE STEPS" tag="ax + b = cx + d">
        <Formula math={`ax + b = cx + d \\ \\Rightarrow \\ (a - c)x = d - b \\ \\Rightarrow \\ x = \\frac{d - b}{a - c}`} />
        <FormulaSteps steps={[
          { title: '1. Clear fractions', text: <>Multiply both sides by the LCD of all denominators.</> },
          { title: '2. Expand and collect', text: <>x-terms to the left, numbers to the right.</> },
          { title: '3. Divide and check', text: <>Divide by the coefficient of x, then substitute back.</> },
        ]} />
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Solve <InlineMath math="3(x - 2) + 4 = 2x + 7" />.</ExampleProblem>
        <ExampleStep n={1} title="EXPAND"><MathPanel><BlockMath math="3x - 6 + 4 = 2x + 7 \ \Rightarrow \ 3x - 2 = 2x + 7" /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="COLLECT"><MathPanel><BlockMath math="3x - 2x = 7 + 2 \ \Rightarrow \ x = 9" /></MathPanel></ExampleStep>
        <ExampleStep n={3} title="CHECK"><MathPanel><BlockMath math="3(9 - 2) + 4 = 25, \qquad 2(9) + 7 = 25 \ \checkmark" /></MathPanel><StepText>Both sides agree.</StepText></ExampleStep>
        <Conclusion result="x = 9" math={<BlockMath math="x = 9" />}>The calculator below opens on this equation.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Linear Equation Solver"><LinearEquationCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['quadratic', 'system-of-equations', 'inequalities']} />
    </MethodPage>
  );
}
