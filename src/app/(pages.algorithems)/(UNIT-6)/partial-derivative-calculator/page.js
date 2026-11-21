'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import PartialDerivativeCalculator from './algorithems.partial-derivative-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'How do you find a partial derivative?', a: <>Differentiate with respect to one letter and treat every other letter as a constant. For <InlineMath math="f = x^2y^3" />, <InlineMath math="f_x = 2xy^3" /> (y³ is just a number while x changes).</> },
  { q: 'Does the order of a mixed partial matter?', a: <>Not for the functions met in courses: if f_xy and f_yx are continuous, they are equal (Clairaut&apos;s or Schwarz&apos;s theorem). The calculator checks this for you.</> },
  { q: 'What is the total derivative?', a: <>When x and y both depend on t, u = f(x, y) changes through both: <InlineMath math="\frac{du}{dt} = \frac{\partial f}{\partial x}\frac{dx}{dt} + \frac{\partial f}{\partial y}\frac{dy}{dt}" />.</> },
];

export default function PartialDerivativePage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • MULTIVARIABLE CALCULUS" title="Partial Derivative Calculator" subtitle="∂f/∂x, Mixed Partials and the Total Derivative">
        A <strong>partial derivative</strong> differentiates a function of several variables with respect to one of them, holding the others constant: <InlineMath math="f_x = \frac{\partial f}{\partial x}" />. Works for first, second and higher orders.
      </MethodHeader>
      <FormulaBox label="THE IDEA" tag="∂">
        <Formula math={'f_x = \\lim_{h \\to 0}\\frac{f(x + h, y) - f(x, y)}{h}, \\qquad f_{xy} = \\frac{\\partial}{\\partial y}\\left(\\frac{\\partial f}{\\partial x}\\right)'} />
        <FormulaSteps steps={[
          { title: '1. Pick a letter', text: <>The one you differentiate by.</> },
          { title: '2. Freeze the rest', text: <>Every other letter is a constant.</> },
          { title: '3. Usual rules', text: <>Power, product, chain rules as in one variable.</> },
        ]} />
        <SymbolKey rows={EX['partial-derivative-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['partial-derivative-calculator'].example} />
      <CommonMistakes items={EX['partial-derivative-calculator'].mistakes} />
      <Lab heading="Interactive Partial Derivative Calculator"><PartialDerivativeCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['derivative', 'euler-homogeneous', 'jacobian']} />
    </MethodPage>
  );
}
