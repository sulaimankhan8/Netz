'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.chain-rule-calculator';
import { SymbolKey, CommonMistakes, Md } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: String.raw`What is the chain rule?`,
    a: <Md>{String.raw`If $y = g(u)$ and $u = h(x)$, then $\frac{dy}{dx} = \frac{dy}{du}\cdot\frac{du}{dx}$: the derivative of the outside times the derivative of the inside.`}</Md>,
  },
  {
    q: String.raw`How do I spot the inside function?`,
    a: <Md>{String.raw`It is the part you would calculate first. In $(3x + 1)^5$ you work out $3x + 1$ first, then raise it to the 5th, so $3x + 1$ is the inside.`}</Md>,
  },
  {
    q: String.raw`How do I differentiate $e^{2x}$, $\ln(x^2)$ or $\sqrt{x^2+1}$?`,
    a: <Md>{String.raw`All are chain rule: outside $e^u$, $\ln u$ or $\sqrt u$, inside $2x$, $x^2$ or $x^2 + 1$. Paste them into the calculator to see each step.`}</Md>,
  },
  {
    q: String.raw`Does the chain rule combine with the product rule?`,
    a: <Md>{String.raw`Yes. For $x \sin(x^2)$ use the product rule, and inside it use the chain rule on $\sin(x^2)$.`}</Md>,
  },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • DIFFERENTIATION" title="Chain Rule" subtitle="A Function Inside Another Function">
        <Md>{String.raw`A **composite function** is a function inside a function, like $\sin(x^2)$: the inside is $x^2$, the outside is $\sin$. The **chain rule** says: differentiate the outside (leaving the inside alone), then multiply by the derivative of the inside.`}</Md>
      </MethodHeader>

      <FormulaBox label="THE CHAIN RULE" tag="outside × inside">
        <Formula math={String.raw`\frac{dy}{dx} = \frac{dy}{du}\cdot\frac{du}{dx}, \qquad \text{or} \qquad \left[g(h(x))\right]' = g'(h(x))\cdot h'(x)`} />
        <FormulaSteps
          steps={[
            { title: String.raw`1. Find the inside and the outside`, text: <Md>{String.raw`Let $u$ be the inside part. Rewrite the function as $y = g(u)$.`}</Md> },
            { title: String.raw`2. Differentiate each`, text: <Md>{String.raw`Differentiate the outside with respect to $u$, then the inside with respect to $x$.`}</Md> },
            { title: String.raw`3. Multiply, then put x back`, text: <Md>{String.raw`Multiply the two derivatives and replace $u$ by the expression in $x$. If there is more than one layer, multiply all the layers.`}</Md> },
          ]}
        />
        <SymbolKey rows={EX['chain-rule-calculator'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['chain-rule-calculator'].example} />
      <CommonMistakes items={EX['chain-rule-calculator'].mistakes} />

      <Lab heading="Interactive Chain Rule Calculator">
        <Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={["derivative","product-rule","quotient-rule"]} />
    </MethodPage>
  );
}
