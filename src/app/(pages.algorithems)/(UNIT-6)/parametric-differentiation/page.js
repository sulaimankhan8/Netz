'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ParametricCalculator from './algorithems.parametric-differentiation';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['parametric-differentiation'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['parametric-differentiation'].example} />
      <CommonMistakes items={EX['parametric-differentiation'].mistakes} />

      <Lab heading="Interactive Parametric Differentiation Calculator">
        <ParametricCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['derivative', 'implicit', 'coordinate-geometry']} />
    </MethodPage>
  );
}
