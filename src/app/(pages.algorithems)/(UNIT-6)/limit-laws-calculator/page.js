'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.limit-laws-calculator';
import { SymbolKey, CommonMistakes, Md } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: String.raw`What are the limit laws?`,
    a: <Md>{String.raw`Rules that say the limit of a sum, difference, product, quotient or power is the same sum, difference, product, quotient or power of the limits, as long as each limit exists (and for a quotient, the bottom limit is not 0).`}</Md>,
  },
  {
    q: String.raw`When do the limit laws fail?`,
    a: <Md>{String.raw`When a piece has no finite limit, or when the bottom of a fraction tends to 0. Then you need factoring, rationalising or L’Hôpital’s rule. NETZ tells you when this happens and finishes with those methods.`}</Md>,
  },
  {
    q: String.raw`Is the limit the same as substituting $a$?`,
    a: <Md>{String.raw`Only for functions that are continuous at $a$, such as polynomials and sin, cos, eˣ. That is exactly what the laws prove.`}</Md>,
  },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • LIMITS & CONTINUITY" title="Properties of Limits" subtitle="Splitting a Limit into Easy Pieces">
        <Md>{String.raw`A **limit** asks what a function gets close to as $x$ gets close to a number $a$. The **limit laws** let you split a hard-looking limit into small easy ones: find the limit of each piece, then put the pieces back together with the same operation.`}</Md>
      </MethodHeader>

      <FormulaBox label="THE LIMIT LAWS" tag="if each limit exists">
        <Formula math={String.raw`\lim (f \pm g) = \lim f \pm \lim g, \quad \lim (c\,f) = c\lim f, \quad \lim (f\,g) = \lim f \cdot \lim g, \quad \lim \frac{f}{g} = \frac{\lim f}{\lim g}`} />
        <FormulaSteps
          steps={[
            { title: String.raw`1. Split`, text: <Md>{String.raw`Look at the outermost operation (a sum, a product, a fraction, a power, a root) and use its law to cut the function into pieces.`}</Md> },
            { title: String.raw`2. Find each piece`, text: <Md>{String.raw`A constant stays the same. The letter $x$ tends to $a$. Keep splitting until every piece is that simple, then put $a$ in.`}</Md> },
            { title: String.raw`3. Put the pieces back`, text: <Md>{String.raw`Join the pieces with the same operation. For a fraction the bottom limit must not be 0; if it is, a different method is needed.`}</Md> },
          ]}
        />
        <SymbolKey rows={EX['limit-laws-calculator'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['limit-laws-calculator'].example} />
      <CommonMistakes items={EX['limit-laws-calculator'].mistakes} />

      <Lab heading="Interactive Properties of Limits Calculator">
        <Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={["limit","indeterminate-forms","continuity"]} />
    </MethodPage>
  );
}
