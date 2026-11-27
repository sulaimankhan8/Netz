'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.intermediate-value-theorem';
import { SymbolKey, CommonMistakes, Md } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: String.raw`What does the Intermediate Value Theorem say?`,
    a: <Md>{String.raw`If $f$ is continuous on $[a, b]$ and $N$ is any number between $f(a)$ and $f(b)$, then there is at least one $c$ in $(a, b)$ with $f(c) = N$.`}</Md>,
  },
  {
    q: String.raw`How do I use it to show an equation has a root?`,
    a: <Md>{String.raw`Write the equation as $f(x) = 0$, find two numbers $a < b$ where $f$ has opposite signs, and check $f$ is continuous. Then a root lies between them.`}</Md>,
  },
  {
    q: String.raw`Does the theorem work if f is not continuous?`,
    a: <Md>{String.raw`No. A jump can skip right over $N$. Always check continuity first.`}</Md>,
  },
  {
    q: String.raw`What is Bolzano’s theorem?`,
    a: <Md>{String.raw`The special case $N = 0$: if a continuous $f$ is negative at one end and positive at the other, it has a root between.`}</Md>,
  },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • LIMITS & CONTINUITY" title="Intermediate Value Theorem" subtitle="A Continuous Curve Cannot Skip a Height">
        <Md>{String.raw`Draw a curve from the point $(a, f(a))$ to $(b, f(b))$ without lifting your pen. Any height between the two end heights must be crossed on the way. That is the **Intermediate Value Theorem**. It is the reason an equation like $x^3 - x - 1 = 0$ must have a root between 1 and 2.`}</Md>
      </MethodHeader>

      <FormulaBox label="THE THEOREM" tag="continuous on [a, b]">
        <Formula math={String.raw`f \text{ continuous on } [a, b], \ N \text{ between } f(a) \text{ and } f(b) \ \Rightarrow \ f(c) = N \text{ for some } c \in (a, b)`} />
        <FormulaSteps
          steps={[
            { title: String.raw`1. Is f continuous on [a, b]?`, text: <Md>{String.raw`No gaps, holes or jumps anywhere from $a$ to $b$. Polynomials, sin, cos and eˣ always are; a fraction breaks where its bottom is 0.`}</Md> },
            { title: String.raw`2. Is N between f(a) and f(b)?`, text: <Md>{String.raw`Find $f(a)$ and $f(b)$. $N$ must lie between them (for a root, $N = 0$, so one end is negative and the other positive).`}</Md> },
            { title: String.raw`3. Conclude, then locate c`, text: <Md>{String.raw`If both are true, such a $c$ exists. To find it, halve the interval again and again, keeping the half where $f - N$ changes sign.`}</Md> },
          ]}
        />
        <SymbolKey rows={EX['intermediate-value-theorem'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['intermediate-value-theorem'].example} />
      <CommonMistakes items={EX['intermediate-value-theorem'].mistakes} />

      <Lab heading="Interactive Intermediate Value Theorem Calculator">
        <Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={["continuity","discontinuity-types","limit"]} />
    </MethodPage>
  );
}
