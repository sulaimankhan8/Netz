'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.confidence-interval';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What does 95% confidence mean?", a: <>If you took many samples and built an interval from each, about 95% of those intervals would contain the true mean. Any one interval either does or doesn&apos;t.</> },
  { q: "When do I use t instead of z?", a: <>When σ is unknown and estimated by s, especially for small samples; t has fatter tails, giving wider intervals.</> },
  { q: "How do I make the interval narrower?", a: <>Take a larger sample (the width shrinks like 1/√n) or accept a lower confidence level.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • PROBABILITY & STATISTICS" title="Confidence Interval Calculator" subtitle="For a Mean (z or t) or a Proportion">
        A <strong>confidence interval</strong> is an estimate with a margin: <InlineMath math={"\\bar{x} \\pm z\\frac{\\sigma}{\\sqrt{n}}"} />. Use t instead of z when σ comes from a small sample, and <InlineMath math={"\\hat p \\pm z\\sqrt{\\hat p\\hat q/n}"} /> for proportions.
      </MethodHeader>
      <FormulaBox label="THE INTERVALS" tag="ESTIMATE ± MARGIN">
        <Formula math={"\\bar{x} \\pm z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}, \\qquad \\bar{x} \\pm t_{\\alpha/2,\\,n-1}\\frac{s}{\\sqrt{n}}, \\qquad \\hat p \\pm z_{\\alpha/2}\\sqrt{\\frac{\\hat p(1 - \\hat p)}{n}}"} />
        <FormulaSteps steps={[
          { title: "1. Standard error", text: <>σ/√n (or the proportion form).</> },
          { title: "2. Critical value", text: <>z or t for the level.</> },
          { title: "3. Margin", text: <>Critical value × SE, either side.</> },
        ]} />
        <SymbolKey rows={EX['confidence-interval'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['confidence-interval'].example} />
      <CommonMistakes items={EX['confidence-interval'].mistakes} />
      <Lab heading="Interactive Confidence Interval Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["t-test","z-test","normal"]} />
    </MethodPage>
  );
}
