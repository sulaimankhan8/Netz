'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import AreaCalculator from './algorithems.area-under-curve-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'Why is the area of sin x from 0 to 2π not 0?',
    a: <>The integral is 0, because the part below the axis counts as negative and cancels the part above. Area is always positive, so split at the crossing x = π and add the sizes: <InlineMath math="2 + |-2| = 4" />.</>,
  },
  {
    q: 'How do I find the area between two curves?',
    a: <>Integrate the top curve minus the bottom one, <InlineMath math="\int_a^b (f - g)\,dx" />. If the limits are not given, they are where the curves meet: solve f(x) = g(x).</>,
  },
  {
    q: 'What if the curves cross in between?',
    a: <>Then top and bottom swap. Split at each crossing and add the sizes of the pieces, exactly as the calculator does.</>,
  },
];

export default function AreaPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Area Under a Curve" subtitle="Area Under and Between Curves by Integration">
        The area between <InlineMath math="y = f(x)" /> and the x-axis from a to b is <InlineMath math="\int_a^b |f(x)|\,dx" />: split where the curve crosses the axis and add the sizes. Between two curves, use <InlineMath math="f - g" />.
      </MethodHeader>

      <FormulaBox label="THE FORMULAS" tag="area ≥ 0">
        <Formula math={`A = \\int_a^b |f(x)|\\,dx, \\qquad A = \\int_a^b |f(x) - g(x)|\\,dx`} />
        <FormulaSteps
          steps={[
            { title: '1. Limits', text: <>Given, or where the curves meet (f = g).</> },
            { title: '2. Split', text: <>At every crossing inside the interval.</> },
            { title: '3. Add sizes', text: <>Integrate each piece and add the absolute values.</> },
          ]}
        />
        <SymbolKey rows={EX['area-under-curve-calculator'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['area-under-curve-calculator'].example} />
      <CommonMistakes items={EX['area-under-curve-calculator'].mistakes} />

      <Lab heading="Interactive Area Calculator">
        <AreaCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['integral', 'simpson-13', 'trapezoidal']} />
    </MethodPage>
  );
}
