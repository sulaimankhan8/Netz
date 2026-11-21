'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.variable-separable';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit12';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
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
        <SymbolKey rows={EX['variable-separable'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['variable-separable'].example} />
      <CommonMistakes items={EX['variable-separable'].mistakes} />
      <Lab heading="Interactive Variable Separable Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['homogeneous-ode', 'linear-ode', 'ode-solver']} />
    </MethodPage>
  );
}
