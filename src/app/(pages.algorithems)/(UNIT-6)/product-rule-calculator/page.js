'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.product-rule-calculator';
import { SymbolKey, CommonMistakes, Md } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: String.raw`What is the product rule?`,
    a: <Md>{String.raw`The derivative of a product of two functions is $(uv)' = u'v + uv'$: the derivative of the first times the second, plus the first times the derivative of the second.`}</Md>,
  },
  {
    q: String.raw`When do I use the product rule?`,
    a: <Md>{String.raw`When the function is two parts that both contain $x$ and are multiplied, like $x\,e^x$ or $x^2 \sin x$. For a number times a function, just take the number outside.`}</Md>,
  },
  {
    q: String.raw`Can I use it for three factors?`,
    a: <Md>{String.raw`Yes, apply it twice: $(uvw)' = u'vw + uv'w + uvw'$. NETZ shows two factors at a time; put the first two together as $u$.`}</Md>,
  },
  {
    q: String.raw`Is there a way to remember it?`,
    a: <Md>{String.raw`Say it as "first d-second plus second d-first", or "keep one, differentiate the other, then swap".`}</Md>,
  },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • DIFFERENTIATION" title="Product Rule" subtitle="Differentiating Two Things Multiplied Together">
        <Md>{String.raw`When a function is **two parts multiplied together**, such as $x^2 \sin x$, you cannot just differentiate each part and multiply. The **product rule** says: differentiate the first and keep the second, then keep the first and differentiate the second, and add the two.`}</Md>
      </MethodHeader>

      <FormulaBox label="THE PRODUCT RULE" tag="u times v">
        <Formula math={String.raw`(u\,v)' = u'\,v + u\,v'`} />
        <FormulaSteps
          steps={[
            { title: String.raw`1. Name u and v`, text: <Md>{String.raw`Split the function into a first factor $u$ and a second factor $v$ that are multiplied.`}</Md> },
            { title: String.raw`2. Differentiate each on its own`, text: <Md>{String.raw`Find $u'$ and $v'$ separately, using the basic rules. This is where it helps to keep them apart.`}</Md> },
            { title: String.raw`3. Put them in the rule`, text: <Md>{String.raw`$u'v + uv'$: the derivative of the first times the second, plus the first times the derivative of the second. Then simplify.`}</Md> },
          ]}
        />
        <SymbolKey rows={EX['product-rule-calculator'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['product-rule-calculator'].example} />
      <CommonMistakes items={EX['product-rule-calculator'].mistakes} />

      <Lab heading="Interactive Product Rule Calculator">
        <Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={["derivative","quotient-rule","chain-rule"]} />
    </MethodPage>
  );
}
