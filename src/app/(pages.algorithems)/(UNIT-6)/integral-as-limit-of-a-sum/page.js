'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.integral-as-limit-of-a-sum';
import { SymbolKey, CommonMistakes, Md } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: String.raw`What does "integral as a limit of a sum" mean?`,
    a: <Md>{String.raw`It means defining the definite integral as the limit of rectangle sums: $\int_a^b f\,dx = \lim_{n\to\infty} h\sum f(a + ih)$ with $h = \frac{b-a}{n}$.`}</Md>,
  },
  {
    q: String.raw`Which standard sums do I need?`,
    a: <Md>{String.raw`$\sum 1 = n$, $\sum i = \frac{n(n+1)}{2}$, $\sum i^2 = \frac{n(n+1)(2n+1)}{6}$ and $\sum i^3 = \left[\frac{n(n+1)}{2}\right]^2$.`}</Md>,
  },
  {
    q: String.raw`Do left, right and middle rectangles all give the same limit?`,
    a: <Md>{String.raw`Yes, for a continuous function. They only differ for finite $n$; the midpoint rule is usually the most accurate.`}</Md>,
  },
  {
    q: String.raw`Why not just use the antiderivative?`,
    a: <Md>{String.raw`The antiderivative is faster, and the Fundamental Theorem of Calculus proves it gives the same answer. The limit of a sum is the definition, and it is asked in exams to show you understand it.`}</Md>,
  },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • INTEGRATION" title="Integral as a Limit of a Sum" subtitle="Area from Adding Up Thin Rectangles">
        <Md>{String.raw`The area under a curve can be found by cutting it into thin **rectangles** and adding their areas. The thinner the rectangles, the closer the total gets to the true area. The **definite integral** is the value this sum settles to as the number of rectangles $n$ grows without end.`}</Md>
      </MethodHeader>

      <FormulaBox label="THE DEFINITION" tag="n → ∞">
        <Formula math={String.raw`\int_a^b f(x)\,dx = \lim_{n\to\infty} h\sum_{i=1}^{n} f(a + ih), \qquad h = \frac{b - a}{n}`} />
        <FormulaSteps
          steps={[
            { title: String.raw`1. Cut into n strips`, text: <Md>{String.raw`Each strip has width $h = \frac{b-a}{n}$. The strip ends are $a, a + h, a + 2h, \ldots, b$.`}</Md> },
            { title: String.raw`2. One rectangle per strip`, text: <Md>{String.raw`Its height is $f$ at the right end (or left end, or middle) of the strip. Its area is height × $h$.`}</Md> },
            { title: String.raw`3. Add them and let n → ∞`, text: <Md>{String.raw`The sum $S_n$ is an estimate of the area. As $n$ grows the rectangles become thin and $S_n$ tends to the exact integral.`}</Md> },
          ]}
        />
        <SymbolKey rows={EX['integral-as-limit-of-a-sum'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['integral-as-limit-of-a-sum'].example} />
      <CommonMistakes items={EX['integral-as-limit-of-a-sum'].mistakes} />

      <Lab heading="Interactive Integral as a Limit of a Sum Calculator">
        <Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={["integral","fundamental-theorem","area-under-curve"]} />
    </MethodPage>
  );
}
