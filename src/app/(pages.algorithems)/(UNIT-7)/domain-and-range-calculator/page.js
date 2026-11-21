'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.domain-and-range-calculator';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit7';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "How do I find the range without a graph?", a: <>On each piece of the domain, the function goes between its values at turning points (f′ = 0) and its limits at the ends of the piece. Joining those pieces gives the range.</> },
  { q: "When does a function have an inverse?", a: <>When it is one-to-one: no two x give the same y. x² is not (f(2) = f(−2)), unless the domain is restricted to x ≥ 0.</> },
  { q: "How can I tell even from odd quickly?", a: <>Replace x by −x. Same function: even (mirror in the y-axis). The negative: odd (symmetric about the origin). Otherwise neither.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 7 • FUNCTIONS" title="Domain and Range Calculator" subtitle="Domain, Range, Inverse, Composition and Even/Odd">
        The <strong>domain</strong> is every <InlineMath math={"x"} /> where <InlineMath math={"f(x)"} /> makes sense; the <strong>range</strong> is every value it takes. Find both from the conditions inside <InlineMath math={"f"} />, then invert <InlineMath math={"f"} />, compose two functions, or test whether <InlineMath math={"f"} /> is even or odd.
      </MethodHeader>
      <FormulaBox label="THE CONDITIONS" tag="WHERE f IS DEFINED">
        <Formula math={"\\frac{p}{q}: \\ q \\ne 0, \\qquad \\sqrt{u}: \\ u \\ge 0, \\qquad \\ln u: \\ u > 0, \\qquad \\sin^{-1}u: \\ -1 \\le u \\le 1"} />
        <FormulaSteps steps={[
          { title: "1. Conditions", text: <>One for each bottom, root and log.</> },
          { title: "2. Solve them", text: <>Critical points split the line; test each interval.</> },
          { title: "3. Range", text: <>Turning values and the limits at the ends.</> },
        ]} />
        <SymbolKey rows={EX['domain-and-range-calculator'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['domain-and-range-calculator'].example} />
      <CommonMistakes items={EX['domain-and-range-calculator'].mistakes} />
      <Lab heading="Interactive Domain and Range Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["inequalities","continuity","asymptotes"]} />
    </MethodPage>
  );
}
