'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.indeterminate-forms-calculator';
import { SymbolKey, CommonMistakes, Md } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: String.raw`What is an indeterminate form?`,
    a: <Md>{String.raw`A limit that looks like $\frac{0}{0}$, $\frac{\infty}{\infty}$, $0\cdot\infty$, $\infty-\infty$, $1^{\infty}$, $0^0$ or $\infty^0$. The symbol alone does not decide the answer, so more work is needed.`}</Md>,
  },
  {
    q: String.raw`Why is $\frac{0}{0}$ not 1?`,
    a: <Md>{String.raw`Because the zeros are not exact: they are numbers shrinking towards 0, and which one shrinks faster decides the result. $\frac{x}{x} \to 1$ but $\frac{x^2}{x} \to 0$.`}</Md>,
  },
  {
    q: String.raw`How do I handle $1^{\infty}$, $0^0$ and $\infty^0$?`,
    a: <Md>{String.raw`Call the limit $y$ and take $\ln$: $\ln y = g \ln f$. That is a $0\cdot\infty$ form, which becomes $\frac{0}{0}$. Find that limit, then $y = e^{\text{that}}$.`}</Md>,
  },
  {
    q: String.raw`Which forms are NOT indeterminate?`,
    a: <Md>{String.raw`Forms like $\frac{1}{0}$ (infinite), $\infty + \infty$ ($= \infty$), $0^{\infty}$ ($= 0$) and $\frac{0}{\infty}$ ($= 0$) are decided already.`}</Md>,
  },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • LIMITS & CONTINUITY" title="Indeterminate Forms" subtitle="0/0, ∞/∞, 0·∞, ∞−∞, 1^∞, 0⁰ and ∞⁰">
        <Md>{String.raw`Sometimes putting $x = a$ into a limit gives something like $\frac{0}{0}$ or $\infty - \infty$. These are called **indeterminate forms**: the pieces pull against each other, so the symbol alone does not tell you the answer. You must rewrite the expression and look again.`}</Md>
      </MethodHeader>

      <FormulaBox label="THE SEVEN FORMS" tag="undecided until rewritten">
        <Formula math={String.raw`\frac{0}{0},\ \frac{\infty}{\infty},\ 0\cdot\infty,\ \infty - \infty,\ 1^{\infty},\ 0^{0},\ \infty^{0}`} />
        <FormulaSteps
          steps={[
            { title: String.raw`1. Find what each part tends to`, text: <Md>{String.raw`Take the limit of the top, the bottom, each factor, the base and the power separately.`}</Md> },
            { title: String.raw`2. Name the form`, text: <Md>{String.raw`If they match one of the seven forms above, the limit is undecided and needs more work.`}</Md> },
            { title: String.raw`3. Rewrite as 0/0 or ∞/∞`, text: <Md>{String.raw`A product becomes a fraction, a difference becomes one fraction, a power is tamed with $\ln$. Then factor, or use L’Hôpital’s rule.`}</Md> },
          ]}
        />
        <SymbolKey rows={EX['indeterminate-forms-calculator'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['indeterminate-forms-calculator'].example} />
      <CommonMistakes items={EX['indeterminate-forms-calculator'].mistakes} />

      <Lab heading="Interactive Indeterminate Forms Calculator">
        <Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={["limit","limit-laws","continuity"]} />
    </MethodPage>
  );
}
