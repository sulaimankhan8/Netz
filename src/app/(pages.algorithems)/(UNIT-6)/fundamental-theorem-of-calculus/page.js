'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.fundamental-theorem-of-calculus';
import { SymbolKey, CommonMistakes, Md } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: String.raw`What does the Fundamental Theorem of Calculus say?`,
    a: <Md>{String.raw`Part 1: if $F(x) = \int_a^x f(t)\,dt$ then $F'(x) = f(x)$. Part 2: $\int_a^b f(x)\,dx = F(b) - F(a)$ where $F$ is any antiderivative of $f$.`}</Md>,
  },
  {
    q: String.raw`Why is it called fundamental?`,
    a: <Md>{String.raw`It connects differentiation (slopes) and integration (areas): each undoes the other. Without it every integral would need the limit-of-a-sum method.`}</Md>,
  },
  {
    q: String.raw`How do I differentiate an integral with x in both limits?`,
    a: <Md>{String.raw`Use $\frac{d}{dx}\int_{a(x)}^{b(x)} h(t)\,dt = h(b(x))\,b'(x) - h(a(x))\,a'(x)$. Try the second mode of the calculator.`}</Md>,
  },
  {
    q: String.raw`Do I need to add C in Part 2?`,
    a: <Md>{String.raw`No. $C$ cancels when you subtract, so a definite integral has no constant.`}</Md>,
  },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • INTEGRATION" title="Fundamental Theorem of Calculus" subtitle="Differentiation and Integration Undo Each Other">
        <Md>{String.raw`The **Fundamental Theorem of Calculus** is the link between the two halves of calculus. **Part 2** says you can find the area under $f$ by finding any antiderivative $F$ and subtracting. **Part 1** says that differentiating an integral gives back the integrand.`}</Md>
      </MethodHeader>

      <FormulaBox label="THE THEOREM" tag="two parts">
        <Formula math={String.raw`\text{Part 2: } \int_a^b f(x)\,dx = F(b) - F(a), \quad F' = f \qquad \text{Part 1: } \frac{d}{dx}\int_a^x f(t)\,dt = f(x)`} />
        <FormulaSteps
          steps={[
            { title: String.raw`Part 2: find the area`, text: <Md>{String.raw`Find any $F$ with $F' = f$. Put the upper limit in, then the lower, and subtract. No $+C$ is needed because it cancels.`}</Md> },
            { title: String.raw`Part 1: differentiate an integral`, text: <Md>{String.raw`The derivative of $\int_a^x f(t)\,dt$ is just $f(x)$. If the upper limit is a function $b(x)$, multiply by $b'(x)$ (chain rule).`}</Md> },
            { title: String.raw`Both limits with x`, text: <Md>{String.raw`For $\int_{a(x)}^{b(x)} h(t)\,dt$ the derivative is $h(b)\,b' - h(a)\,a'$.`}</Md> },
          ]}
        />
        <SymbolKey rows={EX['fundamental-theorem-of-calculus'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['fundamental-theorem-of-calculus'].example} />
      <CommonMistakes items={EX['fundamental-theorem-of-calculus'].mistakes} />

      <Lab heading="Interactive Fundamental Theorem of Calculus Calculator">
        <Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={["integral","riemann-sum","leibniz-integral-rule"]} />
    </MethodPage>
  );
}
