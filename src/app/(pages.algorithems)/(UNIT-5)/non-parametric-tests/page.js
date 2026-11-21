'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.non-parametric-tests';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit5';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "When should I use them?", a: <>When the data are clearly not normal, are ranks or ratings, or the samples are small.</> },
  { q: "What do ties do?", a: <>In the sign test values equal to m₀ are dropped; in Mann–Whitney tied values share the average rank and σ is corrected.</> },
  { q: "Is U exact here?", a: <>The page uses the normal approximation with a continuity correction; for very small samples compare U with a U table.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 5 • STATISTICS" title="Non-Parametric Tests: Sign Test and Mann-Whitney U" subtitle="Tests That Need No Normal Distribution">
        <strong>Non-parametric tests</strong> use only signs or ranks, so they work without assuming normal data. The <strong>sign test</strong> checks a median; the <strong>Mann–Whitney U test</strong> compares two independent samples.
      </MethodHeader>
      <FormulaBox label="THE STATISTICS" tag="RANKS & SIGNS">
        <Formula math={"\\text{sign: } S = \\min(n_+, n_-), \\ X \\sim B(n, \\tfrac12); \\qquad U_1 = R_1 - \\frac{n_1(n_1 + 1)}{2}, \\ U = \\min(U_1, U_2)"} />
        <FormulaSteps steps={[
          { title: "1. Signs or ranks", text: <>Count + and −, or rank everything.</> },
          { title: "2. Statistic", text: <>S, or U.</> },
          { title: "3. P-value", text: <>Binomial, or the normal approximation.</> },
        ]} />
        <SymbolKey rows={EX['non-parametric-tests'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['non-parametric-tests'].example} />
      <CommonMistakes items={EX['non-parametric-tests'].mistakes} />
      <Lab heading="Interactive Non-Parametric Tests Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["z-test","chi-square","anova"]} />
    </MethodPage>
  );
}
