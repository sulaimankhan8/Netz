'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MaximaMinimaCalculator from './algorithems.maxima-minima-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'First derivative test or second derivative test?',
    a: <>The second derivative test is quicker: <InlineMath math="f''(c) < 0" /> means a maximum, <InlineMath math="f''(c) > 0" /> a minimum. But when <InlineMath math="f''(c) = 0" /> it tells you nothing, and then the first derivative test (does f′ change sign?) decides. The calculator uses both.</>,
  },
  {
    q: 'What is the difference between local and absolute maxima?',
    a: <>A local maximum is higher than the points just around it. The absolute maximum on [a, b] is the highest value anywhere on the interval, and it can be at an end point. Compare f at the ends and at every critical point.</>,
  },
  {
    q: 'Can a maximum be where f′ is undefined?',
    a: <>Yes, at a corner. <InlineMath math="|x|" /> has its minimum at 0, where the graph has a sharp point and f′ does not exist. That is why such points count as critical points too.</>,
  },
];

export default function MaximaMinimaPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Maxima & Minima Calculator" subtitle="First and Second Derivative Tests">
        Local maxima and minima happen at <strong>critical points</strong>, where <InlineMath math="f'(x) = 0" /> or f′ is undefined. Test each one: <InlineMath math="f''(c) < 0" /> is a maximum, <InlineMath math="f''(c) > 0" /> a minimum.
      </MethodHeader>

      <FormulaBox label="THE TESTS" tag="f′(c) = 0">
        <Formula math={`f''(c) < 0 \\Rightarrow \\text{local max}, \\qquad f''(c) > 0 \\Rightarrow \\text{local min}`} />
        <FormulaSteps
          steps={[
            { title: '1. Critical points', text: <>Solve f′(x) = 0 (and note where f′ is undefined).</> },
            { title: '2. Classify', text: <>Use f″(c); if it is 0, check whether f′ changes sign.</> },
            { title: '3. On [a, b]', text: <>Compare f at the ends and the critical points for the absolute max and min.</> },
          ]}
        />
        <SymbolKey rows={EX['maxima-minima-calculator'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['maxima-minima-calculator'].example} />
      <CommonMistakes items={EX['maxima-minima-calculator'].mistakes} />

      <Lab heading="Interactive Maxima & Minima Calculator">
        <MaximaMinimaCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['monotonicity', 'derivative', 'tangent-normal']} />
    </MethodPage>
  );
}
