'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.simplex-method';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit15';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  { q: "What is the Big-M method?", a: <>A ≥ or = constraint needs an artificial variable to start. Giving it a huge penalty M in the objective forces it out of the solution.</> },
  { q: "How do I minimise?", a: <>Minimising z is maximising −z; the calculator does this for you and reports the minimum.</> },
  { q: "What is the dual problem?", a: <>Every LP has a twin: constraints become variables and the objective coefficients become the limits. Both have the same optimal value.</> },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 15 • LINEAR PROGRAMMING" title="Simplex Method Calculator" subtitle="Tableaux, Big-M and Duality">
        The <strong>simplex method</strong> solves linear programmes by moving from corner to corner of the feasible region. Each <strong>tableau</strong> picks an entering variable (most negative zⱼ − cⱼ) and a leaving one (smallest ratio).
      </MethodHeader>
      <FormulaBox label="ONE ITERATION" tag="PIVOT">
        <Formula math={"\\text{enter: } \\min_j (z_j - c_j) < 0, \\qquad \\text{leave: } \\min_i \\frac{b_i}{a_{ij}}, \\ a_{ij} > 0"} />
        <FormulaSteps steps={[
          { title: "1. Standard form", text: <>Slack (and Big-M) variables.</> },
          { title: "2. Pivot", text: <>Entering column, leaving row.</> },
          { title: "3. Stop", text: <>When every zⱼ − cⱼ ≥ 0.</> },
        ]} />
        <SymbolKey rows={EX['simplex-method'].symbols} />
      </FormulaBox>
      <DataExample ex={EX['simplex-method'].example} />
      <CommonMistakes items={EX['simplex-method'].mistakes} />
      <Lab heading="Interactive Simplex Method Calculator"><Calculator /></Lab>
      <Faq items={FAQ} />
      <RelatedMethods ids={["system-of-equations","gauss-jordan","dijkstra"]} />
    </MethodPage>
  );
}
