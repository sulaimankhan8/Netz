'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.properties-of-definite-integrals';
import { SymbolKey, CommonMistakes, Md } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: String.raw`What are the properties of definite integrals?`,
    a: <Md>{String.raw`Equal limits give 0; swapping limits flips the sign; the interval can be split at any point; $\int_a^b f(x)\,dx = \int_a^b f(a+b-x)\,dx$ (King’s rule); odd and even functions over $[-c, c]$; and periodic functions over whole periods.`}</Md>,
  },
  {
    q: String.raw`What is the King’s rule?`,
    a: <Md>{String.raw`It says you may replace $x$ by $a + b - x$ in a definite integral. If the two versions add up to a constant, you get the answer without integrating.`}</Md>,
  },
  {
    q: String.raw`How do I know if a function is even or odd?`,
    a: <Md>{String.raw`Replace $x$ with $-x$. If you get the same function it is even; if you get its negative it is odd; otherwise neither.`}</Md>,
  },
  {
    q: String.raw`Why do these shortcuts matter?`,
    a: <Md>{String.raw`They are common in exams because they turn integrals that look impossible into one-liners, and they show you the geometry of the area.`}</Md>,
  },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • INTEGRATION" title="Properties of Definite Integrals" subtitle="Shortcuts That Come from Symmetry">
        <Md>{String.raw`Some definite integrals look hard but are easy once you notice a **symmetry**. An odd function over $[-c, c]$ cancels to $0$. A mirror trick, the **King’s rule**, can solve integrals like $\int_0^{\pi/2} \frac{\sin x}{\sin x + \cos x}\,dx$ in two lines. This page tests which properties apply to your integral.`}</Md>
      </MethodHeader>

      <FormulaBox label="THE PROPERTIES" tag="for ∫ₐᵇ f(x) dx">
        <Formula math={String.raw`\int_a^b f\,dx = \int_a^b f(a + b - x)\,dx, \qquad \int_{-c}^{c} f\,dx = \begin{cases} 2\int_0^{c} f\,dx & f \text{ even} \\ 0 & f \text{ odd} \end{cases}`} />
        <FormulaSteps
          steps={[
            { title: String.raw`1. Always true`, text: <Md>{String.raw`Swapping the limits flips the sign. The integral from $a$ to $b$ splits at any $c$ in between. Equal limits give $0$.`}</Md> },
            { title: String.raw`2. Symmetric limits [−c, c]`, text: <Md>{String.raw`If $f(-x) = f(x)$ (even) the integral is twice the right half. If $f(-x) = -f(x)$ (odd) it is $0$.`}</Md> },
            { title: String.raw`3. The King’s rule`, text: <Md>{String.raw`Replace $x$ by $a + b - x$. If $f(x) + f(a + b - x) = k$, add the two forms of the integral: $2I = k(b - a)$.`}</Md> },
          ]}
        />
        <SymbolKey rows={EX['properties-of-definite-integrals'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['properties-of-definite-integrals'].example} />
      <CommonMistakes items={EX['properties-of-definite-integrals'].mistakes} />

      <Lab heading="Interactive Properties of Definite Integrals Calculator">
        <Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={["integral","fundamental-theorem","area-under-curve"]} />
    </MethodPage>
  );
}
