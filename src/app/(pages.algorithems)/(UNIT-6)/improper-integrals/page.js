'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.improper-integrals';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "Why does ∫ 1/x from 1 to ∞ diverge?", a: <>Its antiderivative ln x grows without bound, even though 1/x → 0. The area under the curve is infinite.</> },
  { q: "What about ∫ 1/x² from −1 to 1?", a: <>It looks like 2 if you ignore x = 0, but 1/x² blows up there. Split at 0: each half diverges, so the integral diverges. The calculator finds such points.</> },
  { q: "How do I write infinity?", a: <>Type inf (or ∞) for +∞ and -inf for −∞.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • INTEGRATION TECHNIQUES" title="Improper Integrals" subtitle="Infinite Limits and Infinite Integrands">
        An <strong>improper integral</strong> has an infinite limit or an integrand that blows up. Write it as a limit, <InlineMath math={"\\int_a^\\infty f\\,dx = \\lim_{t\\to\\infty}\\int_a^t f\\,dx"} />, and decide whether it converges.
      </MethodHeader>
      <FormulaBox label="AS A LIMIT" tag="CONVERGE?">
        <Formula math={"\\int_1^\\infty \\frac{dx}{x^p} \\text{ converges} \\iff p > 1, \\qquad \\int_0^1 \\frac{dx}{x^p} \\text{ converges} \\iff p < 1"} />
        <FormulaSteps steps={[
          { title: "1. Antiderivative", text: <>As usual.</> },
          { title: "2. Limit", text: <>At ∞, or at the point where f blows up.</> },
          { title: "3. Decide", text: <>A finite limit converges.</> },
        ]} />
        <SymbolKey rows={EX['improper-integrals'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['improper-integrals'].example} />
      <CommonMistakes items={EX['improper-integrals'].mistakes} />
      <Lab heading="Interactive Improper Integral Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["integral","convergence-tests","beta-gamma"]} />
    </MethodPage>
  );
}
