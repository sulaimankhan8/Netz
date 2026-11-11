'use client';

import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.non-parametric-tests';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps,
  WorkedExample, ExampleProblem, ExampleStep, StepText, MathPanel, Conclusion,
  Faq, RelatedMethods,
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
      </FormulaBox>
      <WorkedExample>
        <ExampleProblem>Ten values 12 15 9 18 20 11 14 16 13 17: is the median 12 (α = 0.05)?</ExampleProblem>
        <ExampleStep n={1} title="SIGNS"><MathPanel><BlockMath math={"7 \\text{ plus}, \\ 2 \\text{ minus}, \\ 1 \\text{ tie (dropped)}: \\ n = 9, \\ S = 2"} /></MathPanel></ExampleStep>
        <ExampleStep n={2} title="P-VALUE"><MathPanel><BlockMath math={"P = 2\\sum_{i=0}^{2}\\binom{9}{i}\\left(\\tfrac12\\right)^9 = \\frac{2\\cdot 46}{512} = 0.18"} /></MathPanel><StepText>P &gt; 0.05: there is not enough evidence against median 12.</StepText></ExampleStep>
        <Conclusion result="P = 0.18, do not reject" math={<BlockMath math={"P = 0.1797 > 0.05"} />}>The calculator below opens on these data.</Conclusion>
      </WorkedExample>
      <Lab heading="Interactive Non-Parametric Tests Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["z-test","chi-square","anova"]} />
    </MethodPage>
  );
}
