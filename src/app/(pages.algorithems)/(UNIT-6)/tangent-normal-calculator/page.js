'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import TangentNormalCalculator from './algorithems.tangent-normal-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the difference between a tangent and a normal?',
    a: <>The <strong>tangent</strong> touches the curve at the point and has the same slope, <InlineMath math="m = f'(a)" />. The <strong>normal</strong> goes through the same point at right angles to the tangent, so its slope is <InlineMath math="-\frac{1}{m}" /> (the two slopes multiply to −1).</>,
  },
  {
    q: 'What if the slope is 0?',
    a: <>Then the tangent is horizontal, <InlineMath math="y = f(a)" />, and the normal is the vertical line <InlineMath math="x = a" /> (its slope −1/0 is undefined).</>,
  },
  {
    q: 'Can the tangent be vertical?',
    a: <>Yes, where the derivative is infinite. <InlineMath math="y = \sqrt[3]{x}" /> has a vertical tangent <InlineMath math="x = 0" /> at the origin, and its normal there is the x-axis.</>,
  },
];

export default function TangentNormalPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Tangent & Normal Calculator" subtitle="Equations of the Tangent and Normal Lines">
        At <InlineMath math="x = a" /> the tangent to <InlineMath math="y = f(x)" /> has slope <InlineMath math="f'(a)" /> and passes through <InlineMath math="(a, f(a))" />. The normal is the line through the same point at right angles to it.
      </MethodHeader>

      <FormulaBox label="THE EQUATIONS" tag="m = f′(a)">
        <Formula math={`\\begin{gathered} \\text{Tangent: } y - f(a) = f'(a)(x - a) \\\\ \\text{Normal: } y - f(a) = -\\frac{1}{f'(a)}(x - a) \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. The point', text: <>Work out y = f(a).</> },
            { title: '2. The slope', text: <>Differentiate and put x = a: m = f′(a).</> },
            { title: '3. The lines', text: <>Tangent with slope m; normal with slope −1/m, both through the point.</> },
          ]}
        />
        <SymbolKey rows={EX['tangent-normal-calculator'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['tangent-normal-calculator'].example} />
      <CommonMistakes items={EX['tangent-normal-calculator'].mistakes} />

      <Lab heading="Interactive Tangent & Normal Calculator">
        <TangentNormalCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['derivative', 'implicit', 'maxima-minima']} />
    </MethodPage>
  );
}
