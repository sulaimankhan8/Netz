'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.u-substitution-calculator';
import { SymbolKey, CommonMistakes, Md } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: String.raw`What is u-substitution?`,
    a: <Md>{String.raw`A method that undoes the chain rule. You replace a complicated inside part with a single letter $u$ so the integral becomes a basic one.`}</Md>,
  },
  {
    q: String.raw`How do I choose u?`,
    a: <Md>{String.raw`Look for an inside function (the stuff inside brackets, under a root, in an exponent or in a denominator) whose derivative is also in the integral. Try the inside of the most complicated part first.`}</Md>,
  },
  {
    q: String.raw`What do I do with the limits in a definite integral?`,
    a: <Md>{String.raw`Change them: the new limits are $u(a)$ and $u(b)$. Then integrate in $u$ and subtract; you never need to turn back to $x$.`}</Md>,
  },
  {
    q: String.raw`What if it does not work?`,
    a: <Md>{String.raw`Try another $u$. If nothing works, the integral may need integration by parts or partial fractions instead.`}</Md>,
  },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • INTEGRATION" title="Integration by Substitution" subtitle="The u-Substitution Method">
        <Md>{String.raw`**Integration by substitution** (u-substitution) is the chain rule backwards. When the integrand has an inside function and, beside it, that function’s derivative, give the inside a new name $u$. The integral then collapses into a simple one in $u$.`}</Md>
      </MethodHeader>

      <FormulaBox label="THE METHOD" tag="chain rule in reverse">
        <Formula math={String.raw`\int f(g(x))\,g'(x)\,dx = \int f(u)\,du, \qquad u = g(x),\ du = g'(x)\,dx`} />
        <FormulaSteps
          steps={[
            { title: String.raw`1. Choose u`, text: <Md>{String.raw`Pick the inside part, the one whose derivative also appears (up to a number) as a factor of the integrand.`}</Md> },
            { title: String.raw`2. Find du`, text: <Md>{String.raw`Differentiate: $du = g'(x)\,dx$. Use it to replace everything that has $x$ and $dx$.`}</Md> },
            { title: String.raw`3. Integrate in u, then put x back`, text: <Md>{String.raw`Integrate the simple integral. Replace $u$ by $g(x)$. For limits, change them to $u(a)$ and $u(b)$ and never go back to $x$.`}</Md> },
          ]}
        />
        <SymbolKey rows={EX['u-substitution-calculator'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['u-substitution-calculator'].example} />
      <CommonMistakes items={EX['u-substitution-calculator'].mistakes} />

      <Lab heading="Interactive Integration by Substitution Calculator">
        <Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={["integral","integration-by-parts","standard-integrals"]} />
    </MethodPage>
  );
}
