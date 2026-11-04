'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ParametricCalculator from './algorithems.parametric-differentiation';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'Why is d²y/dx² not (d²y/dt²)/(d²x/dt²)?',
    a: <>Because dy/dx is a function of t, and we want its rate of change with respect to x, not t. Differentiate dy/dx with respect to t, then divide by dx/dt once more: <InlineMath math="\frac{d^2y}{dx^2} = \frac{d}{dt}\left(\frac{dy}{dx}\right) \div \frac{dx}{dt}" />.</>,
  },
  {
    q: 'What happens when dx/dt = 0?',
    a: <>If dy/dt is not 0 there, the tangent is vertical. If both are 0, the curve may have a cusp (a sharp point), like x = t³, y = t² at t = 0, and the slope cannot be found this way.</>,
  },
  {
    q: 'Do I need to eliminate t first?',
    a: <>No. That is the point of the method: dy/dx comes straight from dy/dt and dx/dt, even when getting y as a function of x is hard or impossible.</>,
  },
];

export default function ParametricPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Parametric Differentiation" subtitle="dy/dx for Curves Given by x(t) and y(t)">
        When a curve is given as <InlineMath math="x = x(t), \ y = y(t)" />, differentiate each with respect to t and divide: <InlineMath math="\frac{dy}{dx} = \frac{dy/dt}{dx/dt}" />.
      </MethodHeader>

      <FormulaBox label="THE FORMULAS" tag="x(t), y(t)">
        <Formula math={`\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt} \\qquad \\frac{d^2y}{dx^2} = \\frac{\\frac{d}{dt}\\left(\\frac{dy}{dx}\\right)}{dx/dt}`} />
        <FormulaSteps
          steps={[
            { title: '1. dx/dt and dy/dt', text: <>Differentiate x(t) and y(t) separately.</> },
            { title: '2. Divide', text: <>dy/dx = (dy/dt) ÷ (dx/dt), then simplify.</> },
            { title: '3. Second derivative', text: <>Differentiate dy/dx with respect to t, then divide by dx/dt again.</> },
          ]}
        />
      </FormulaBox>

      <WorkedExample>
        <ExampleProblem>
          For <InlineMath math="x = t^2, \ y = 2t" />, find <InlineMath math="\frac{dy}{dx}" /> and <InlineMath math="\frac{d^2y}{dx^2}" />, and the tangent at t = 1.
        </ExampleProblem>
        <ExampleStep n={1} title="DIFFERENTIATE WITH RESPECT TO t">
          <MathPanel><BlockMath math="\frac{dx}{dt} = 2t, \qquad \frac{dy}{dt} = 2" /></MathPanel>
        </ExampleStep>
        <ExampleStep n={2} title="DIVIDE">
          <MathPanel><BlockMath math="\frac{dy}{dx} = \frac{2}{2t} = \frac{1}{t}" /></MathPanel>
        </ExampleStep>
        <ExampleStep n={3} title="SECOND DERIVATIVE">
          <MathPanel><BlockMath math="\frac{d^2y}{dx^2} = \frac{\frac{d}{dt}\left(\frac{1}{t}\right)}{2t} = \frac{-1/t^2}{2t} = -\frac{1}{2t^3}" /></MathPanel>
        </ExampleStep>
        <ExampleStep n={4} title="TANGENT AT t = 1">
          <StepText>The point is (1, 2) and the slope is 1/1 = 1:</StepText>
          <MathPanel><BlockMath math="y - 2 = 1(x - 1) \quad \Rightarrow \quad y = x + 1" /></MathPanel>
        </ExampleStep>
        <Conclusion result="dy/dx = 1/t, d²y/dx² = −1/(2t³)" math={<BlockMath math="\frac{dy}{dx} = \frac{1}{t}" />}>
          This curve is the parabola y² = 4x. The calculator below opens on it.
        </Conclusion>
      </WorkedExample>

      <Lab heading="Interactive Parametric Differentiation Calculator">
        <ParametricCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['derivative', 'implicit', 'coordinate-geometry']} />
    </MethodPage>
  );
}
