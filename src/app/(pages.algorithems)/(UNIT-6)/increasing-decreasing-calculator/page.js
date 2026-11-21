'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import MonotonicityCalculator from './algorithems.increasing-decreasing-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'Why only test one point in each interval?',
    a: <>f′ can only change sign where it is 0 or undefined. Between two such points it keeps one sign, so a single test value tells you the sign for the whole interval.</>,
  },
  {
    q: 'Is x³ increasing even though f′(0) = 0?',
    a: <>Yes. <InlineMath math="f'(x) = 3x^2" /> is positive on both sides of 0, so x³ is increasing on all of ℝ. A single point where f′ = 0 does not stop a function from increasing.</>,
  },
  {
    q: 'What about points where f is not defined?',
    a: <>They split the intervals too. For <InlineMath math="\frac{1}{x}" />, f′ is negative on (−∞, 0) and on (0, ∞): the function is decreasing on each piece, but not on their union taken as one interval.</>,
  },
];

export default function MonotonicityPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • CALCULUS" title="Increasing & Decreasing Functions" subtitle="Critical Points and the Sign of f′">
        A function is <strong>increasing</strong> where <InlineMath math="f'(x) > 0" /> and <strong>decreasing</strong> where <InlineMath math="f'(x) < 0" />. Find where f′ is 0 or undefined, then test the sign of f′ in each interval between those points.
      </MethodHeader>

      <FormulaBox label="THE TEST" tag="sign of f′">
        <Formula math={`f'(x) > 0 \\Rightarrow f \\text{ increasing}, \\qquad f'(x) < 0 \\Rightarrow f \\text{ decreasing}`} />
        <FormulaSteps
          steps={[
            { title: '1. Differentiate', text: <>Find f′(x).</> },
            { title: '2. Critical points', text: <>Solve f′(x) = 0; also note where f′ is undefined.</> },
            { title: '3. Sign table', text: <>Pick a test value in each interval and check the sign of f′.</> },
          ]}
        />
        <SymbolKey rows={EX['increasing-decreasing-calculator'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['increasing-decreasing-calculator'].example} />
      <CommonMistakes items={EX['increasing-decreasing-calculator'].mistakes} />

      <Lab heading="Interactive Increasing & Decreasing Calculator">
        <MonotonicityCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['maxima-minima', 'derivative', 'tangent-normal']} />
    </MethodPage>
  );
}
