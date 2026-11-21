'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MaximaMinima2VarCalculator from './algorithems.maxima-minima-two-variables';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What is a saddle point?', a: <>A critical point that is a maximum in one direction and a minimum in another, like the middle of a horse saddle. There <InlineMath math="rt - s^2 < 0" />.</> },
  { q: 'What if rt − s² = 0?', a: <>The test gives no answer. Look at f near the point: for <InlineMath math="x^4 + y^4" /> at (0, 0) it is a minimum, for <InlineMath math="x^3 + y^3" /> it is neither.</> },
  { q: 'What do the r, s, t letters mean?', a: <>The textbook (Monge) notation for second partials: <InlineMath math="r = f_{xx}, \ s = f_{xy}, \ t = f_{yy}" />. In the Hessian, rt − s² is its determinant.</> },
];

export default function MaximaMinima2VarPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • MULTIVARIABLE CALCULUS" title="Maxima and Minima of Two Variables" subtitle="Critical Points, rt − s² and Saddle Points">
        Find the <strong>maxima, minima and saddle points</strong> of f(x, y): solve <InlineMath math="f_x = 0, f_y = 0" />, then test each point with <InlineMath math="rt - s^2" />. A contour plot shows them.
      </MethodHeader>
      <FormulaBox label="THE SECOND DERIVATIVE TEST" tag="rt − s²">
        <Formula math={'rt - s^2 > 0: \\ \\begin{cases} r < 0 & \\text{maximum} \\\\ r > 0 & \\text{minimum} \\end{cases} \\qquad rt - s^2 < 0: \\ \\text{saddle point}'} />
        <FormulaSteps steps={[
          { title: '1. Critical points', text: <>Solve f_x = 0 and f_y = 0 together.</> },
          { title: '2. r, s, t', text: <>Second partials at each point.</> },
          { title: '3. Decide', text: <>Sign of rt − s², then of r.</> },
        ]} />
        <SymbolKey rows={EX['maxima-minima-two-variables'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['maxima-minima-two-variables'].example} />
      <CommonMistakes items={EX['maxima-minima-two-variables'].mistakes} />
      <Lab heading="Interactive Maxima & Minima Calculator"><MaximaMinima2VarCalculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['lagrange-multipliers', 'maxima-minima', 'partial-derivative']} />
    </MethodPage>
  );
}
