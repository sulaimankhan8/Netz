'use client';

import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ProgressionCalculator from './algorithems.arithmetic-geometric-progression';
import { SymbolKey, CommonMistakes } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit7';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: 'What is the difference between an AP and a GP?',
    a: <>In an arithmetic progression you <em>add</em> the same number each time (2, 5, 8, 11: d = 3). In a geometric progression you <em>multiply</em> by the same number (3, 6, 12, 24: r = 2).</>,
  },
  {
    q: 'What is the formula for the sum of an AP?',
    a: <><InlineMath math="S_n = \frac{n}{2}\left[2a + (n - 1)d\right]" />, or <InlineMath math="\frac{n}{2}(a + l)" /> when you know the last term l. It comes from pairing the first and last terms, as Gauss did with 1 + 2 + … + 100 = 5050.</>,
  },
  {
    q: 'When does a GP have a sum to infinity?',
    a: <>Only when <InlineMath math="|r| < 1" />, so the terms shrink towards 0. Then <InlineMath math="S_\infty = \frac{a}{1 - r}" />: for 1 + ½ + ¼ + … it is 2.</>,
  },
  {
    q: 'What are Σn, Σn² and Σn³?',
    a: <>The sums of the first n natural numbers, their squares and their cubes: <InlineMath math="\frac{n(n+1)}{2}" />, <InlineMath math="\frac{n(n+1)(2n+1)}{6}" /> and <InlineMath math="\left[\frac{n(n+1)}{2}\right]^2" />.</>,
  },
];

export default function ProgressionPage() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 7 • ALGEBRA" title="AP & GP" subtitle="nth Term and Sum of a Series">
        An <strong>arithmetic progression</strong> adds a fixed number d each time: <InlineMath math="a_n = a + (n - 1)d" />. A <strong>geometric progression</strong> multiplies by a fixed number r: <InlineMath math="a_n = ar^{n-1}" />. Each has a formula for the sum of its first n terms.
      </MethodHeader>

      <FormulaBox label="THE FORMULAS" tag="AP AND GP">
        <Formula math={`\\begin{gathered} \\text{AP: } a_n = a + (n - 1)d, \\quad S_n = \\frac{n}{2}\\left[2a + (n - 1)d\\right] \\\\ \\text{GP: } a_n = ar^{n - 1}, \\quad S_n = \\frac{a(r^n - 1)}{r - 1}, \\quad S_\\infty = \\frac{a}{1 - r} \\ (|r| < 1) \\end{gathered}`} />
        <FormulaSteps
          steps={[
            { title: '1. AP or GP?', text: <>Subtract neighbours: constant difference means AP. Divide them: constant ratio means GP.</> },
            { title: '2. Read a and d (or r)', text: <>a is the first term; d = second − first; r = second ÷ first.</> },
            { title: '3. Substitute', text: <>Put a, d (or r) and n into the formula. Count n carefully.</> },
          ]}
        />
        <SymbolKey rows={EX['arithmetic-geometric-progression'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['arithmetic-geometric-progression'].example} />
      <CommonMistakes items={EX['arithmetic-geometric-progression'].mistakes} />

      <Lab heading="Interactive AP & GP Calculator">
        <ProgressionCalculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={['compound-interest', 'permutations-combinations', 'quadratic']} />
    </MethodPage>
  );
}
