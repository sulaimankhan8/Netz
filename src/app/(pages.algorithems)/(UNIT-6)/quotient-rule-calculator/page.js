'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.quotient-rule-calculator';
import { SymbolKey, CommonMistakes, Md } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: String.raw`What is the quotient rule?`,
    a: <Md>{String.raw`The derivative of $\frac{u}{v}$ is $\frac{u'v - uv'}{v^2}$: the bottom times the derivative of the top, minus the top times the derivative of the bottom, all over the bottom squared.`}</Md>,
  },
  {
    q: String.raw`Can I use the product rule instead?`,
    a: <Md>{String.raw`Yes. Write $\frac{u}{v} = u \cdot v^{-1}$ and use the product rule with the chain rule. The quotient rule is just a shortcut for that.`}</Md>,
  },
  {
    q: String.raw`What if the bottom is 0?`,
    a: <Md>{String.raw`The function and its derivative do not exist at that point. NETZ tells you where the bottom is 0.`}</Md>,
  },
  {
    q: String.raw`How do I remember the order?`,
    a: <Md>{String.raw`Say "low d-high minus high d-low, over low squared": low is the bottom, high is the top, and d means "derivative of".`}</Md>,
  },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • DIFFERENTIATION" title="Quotient Rule" subtitle="Differentiating One Function Divided by Another">
        <Md>{String.raw`When a function is a **fraction** with $x$ in both the top and the bottom, such as $\frac{x}{x^2 + 1}$, use the **quotient rule**. It is like the product rule, but with a minus sign and the bottom squared underneath.`}</Md>
      </MethodHeader>

      <FormulaBox label="THE QUOTIENT RULE" tag="u over v">
        <Formula math={String.raw`\left(\frac{u}{v}\right)' = \frac{u'\,v - u\,v'}{v^{2}}`} />
        <FormulaSteps
          steps={[
            { title: String.raw`1. Name the top u and the bottom v`, text: <Md>{String.raw`The top of the fraction is $u$, the bottom is $v$.`}</Md> },
            { title: String.raw`2. Differentiate each on its own`, text: <Md>{String.raw`Find $u'$ and $v'$ separately.`}</Md> },
            { title: String.raw`3. Put them in the rule`, text: <Md>{String.raw`Bottom times derivative of the top, **minus** top times derivative of the bottom, all over the bottom squared. The order of the minus matters.`}</Md> },
          ]}
        />
        <SymbolKey rows={EX['quotient-rule-calculator'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['quotient-rule-calculator'].example} />
      <CommonMistakes items={EX['quotient-rule-calculator'].mistakes} />

      <Lab heading="Interactive Quotient Rule Calculator">
        <Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={["derivative","product-rule","chain-rule"]} />
    </MethodPage>
  );
}
