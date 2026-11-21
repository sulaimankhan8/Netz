'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.power-series-radius-of-convergence';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: 'What is the radius of convergence?', a: <>The number R such that the series converges for |x − a| &lt; R and diverges for |x − a| &gt; R. It can be 0 (only x = a) or ∞ (every x).</> },
  { q: 'Why test the end points separately?', a: <>At |x − a| = R the ratio test gives exactly 1 and says nothing. Each end becomes an ordinary series: Σxⁿ/n converges at x = −1 (alternating) but diverges at x = 1 (harmonic).</> },
  { q: 'What about series in x²ⁿ?', a: <>Choose the (x − a)²ⁿ form: the ratio test gives |x − a|² &lt; ρ, so R = √ρ.</> },
];

export default function PowerSeriesPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • SERIES" title="Radius and Interval of Convergence" subtitle="Power Series Σ cₙ(x − a)ⁿ">
        A <strong>power series</strong> converges inside an interval centred at a. The ratio test gives the <strong>radius</strong> <InlineMath math="R = \lim\left|\frac{c_n}{c_{n+1}}\right|" />; the end points are tested on their own.
      </MethodHeader>
      <FormulaBox label="RADIUS" tag="RATIO TEST">
        <Formula math={'R = \\lim_{n\\to\\infty}\\left|\\frac{c_n}{c_{n+1}}\\right| = \\frac{1}{\\lim |c_n|^{1/n}}'} />
        <FormulaSteps steps={[
          { title: '1. Ratio', text: <>|cₙ/cₙ₊₁| as n → ∞.</> },
          { title: '2. Interval', text: <>a − R &lt; x &lt; a + R.</> },
          { title: '3. End points', text: <>Test each as a series.</> },
        ]} />
        <SymbolKey rows={EX['power-series-radius-of-convergence'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['power-series-radius-of-convergence'].example} />
      <CommonMistakes items={EX['power-series-radius-of-convergence'].mistakes} />
      <Lab heading="Interactive Power Series Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={['convergence-tests', 'taylor-series', 'limit']} />
    </MethodPage>
  );
}
