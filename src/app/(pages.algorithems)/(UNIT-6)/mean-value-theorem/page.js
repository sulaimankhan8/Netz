'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.mean-value-theorem';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What if the conditions fail?", a: <>The theorem need not hold: |x| on [−1, 1] has f(−1) = f(1) but no point with f′ = 0, because it has a corner at 0.</> },
  { q: "Can there be more than one c?", a: <>Yes. The theorem promises at least one; the calculator finds them all.</> },
  { q: "What does the theorem mean?", a: <>Somewhere the instantaneous rate of change equals the average rate over the interval: the tangent is parallel to the chord.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • APPLICATIONS OF DERIVATIVES" title="Rolle's Theorem and the Mean Value Theorem" subtitle="Find c, With the Graph">
        If f is continuous on [a, b] and differentiable on (a, b), there is a c with <InlineMath math={"f'(c) = \\frac{f(b) - f(a)}{b - a}"} /> (<strong>Lagrange&apos;s mean value theorem</strong>). When f(a) = f(b) this is <strong>Rolle&apos;s theorem</strong>: f′(c) = 0.
      </MethodHeader>
      <FormulaBox label="THE THEOREM" tag="f′(c)">
        <Formula math={"f'(c) = \\frac{f(b) - f(a)}{b - a}, \\qquad a < c < b"} />
        <FormulaSteps steps={[
          { title: "1. Conditions", text: <>Continuous on [a, b], differentiable inside.</> },
          { title: "2. Slope", text: <>Of the chord from a to b.</> },
          { title: "3. Solve", text: <>f′(c) = that slope.</> },
        ]} />
        <SymbolKey rows={EX['mean-value-theorem'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['mean-value-theorem'].example} />
      <CommonMistakes items={EX['mean-value-theorem'].mistakes} />
      <Lab heading="Interactive Mean Value Theorem Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["derivative","maxima-minima","monotonicity"]} />
    </MethodPage>
  );
}
