'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import JacobianCalculator from './algorithems.jacobian-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What does the Jacobian mean?', a: <>It is the local area (or volume) scale factor of a change of variables. That is why <InlineMath math="dx\,dy = |J|\,dr\,d\theta = r\,dr\,d\theta" /> in polar coordinates.</> },
  { q: 'What if J = 0?', a: <>If the Jacobian is zero everywhere, the functions are <strong>functionally dependent</strong>: one is a function of the others, as with u = x + y and v = (x + y)².</> },
  { q: 'What is JJ′ = 1?', a: <>The Jacobian of the inverse change of variables is the reciprocal: <InlineMath math="\frac{\partial(u, v)}{\partial(x, y)} \cdot \frac{\partial(x, y)}{\partial(u, v)} = 1" />.</> },
];

export default function JacobianPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • MULTIVARIABLE CALCULUS" title="Jacobian Calculator" subtitle="∂(u, v)/∂(x, y) for 2 × 2 and 3 × 3">
        The <strong>Jacobian</strong> of u, v with respect to x, y is the determinant of their partial derivatives: <InlineMath math="J = \frac{\partial(u, v)}{\partial(x, y)}" />. It is the scale factor for changing variables in multiple integrals.
      </MethodHeader>
      <FormulaBox label="THE DETERMINANT" tag="J">
        <Formula math={'J = \\frac{\\partial(u, v)}{\\partial(x, y)} = \\begin{vmatrix} u_x & u_y \\\\ v_x & v_y \\end{vmatrix} = u_x v_y - u_y v_x'} />
        <FormulaSteps steps={[
          { title: '1. Partials', text: <>Every function by every variable.</> },
          { title: '2. Matrix', text: <>One row per function.</> },
          { title: '3. Determinant', text: <>Expand and simplify.</> },
        ]} />
        <SymbolKey rows={EX['jacobian-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['jacobian-calculator'].example} />
      <CommonMistakes items={EX['jacobian-calculator'].mistakes} />
      <Lab heading="Interactive Jacobian Calculator"><JacobianCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['partial-derivative', 'double-integral', 'determinant']} />
    </MethodPage>
  );
}
