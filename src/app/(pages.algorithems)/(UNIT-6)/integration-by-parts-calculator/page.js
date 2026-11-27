'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Calculator from './algorithems.integration-by-parts-calculator';
import { SymbolKey, CommonMistakes, Md } from '@/app/components/method/TheoryExtras';
import DataExample from '@/app/components/method/DataExample';
import EX from '@/app/data/workedExamples/unit6';
import {
  MethodPage, MethodHeader, Lab, FormulaBox, Formula, FormulaSteps, Faq, RelatedMethods,
} from '@/app/components/method';

const FAQ = [
  {
    q: String.raw`What is the formula for integration by parts?`,
    a: <Md>{String.raw`$\int u\,dv = uv - \int v\,du$. It comes from the product rule $(uv)' = u'v + uv'$ integrated on both sides.`}</Md>,
  },
  {
    q: String.raw`What is ILATE?`,
    a: <Md>{String.raw`A memory aid for choosing $u$: Inverse trig, Logarithmic, Algebraic, Trigonometric, Exponential. Whichever comes first in that list is $u$.`}</Md>,
  },
  {
    q: String.raw`How do I integrate $\ln x$ by parts?`,
    a: <Md>{String.raw`Write it as $\ln x \cdot 1$. Then $u = \ln x$ and $dv = dx$. NETZ does this automatically.`}</Md>,
  },
  {
    q: String.raw`What if the integral comes back to itself?`,
    a: <Md>{String.raw`For $e^x \sin x$, parts twice gives the original integral again. Treat it as an equation and solve for the integral. NETZ handles this case and says so.`}</Md>,
  },
];

export default function Page() {
  return (
    <MethodPage>
      <MethodHeader badge="UNIT 6 • INTEGRATION" title="Integration by Parts" subtitle="The Product Rule in Reverse">
        <Md>{String.raw`**Integration by parts** is the product rule backwards. It turns a hard integral of a product, like $\int x e^x\,dx$, into $uv$ minus a new integral that is easier. The skill is choosing which part is $u$ (to differentiate) and which is $dv$ (to integrate).`}</Md>
      </MethodHeader>

      <FormulaBox label="THE FORMULA" tag="choose u by ILATE">
        <Formula math={String.raw`\int u\,dv = u\,v - \int v\,du`} />
        <FormulaSteps
          steps={[
            { title: String.raw`1. Choose u and dv`, text: <Md>{String.raw`Use **ILATE**: the first of these in the list is $u$: **I**nverse trig, **L**ogarithmic, **A**lgebraic ($x$, $x^2$ …), **T**rigonometric, **E**xponential. The rest is $dv$.`}</Md> },
            { title: String.raw`2. Find du and v`, text: <Md>{String.raw`Differentiate $u$ to get $du$. Integrate $dv$ to get $v$ (leave out the $+C$ for now).`}</Md> },
            { title: String.raw`3. Put them in the formula`, text: <Md>{String.raw`$uv - \int v\,du$. If the new integral still has a product, use parts again; then add $+C$ at the end.`}</Md> },
          ]}
        />
        <SymbolKey rows={EX['integration-by-parts-calculator'].symbols} />
      </FormulaBox>

      <DataExample ex={EX['integration-by-parts-calculator'].example} />
      <CommonMistakes items={EX['integration-by-parts-calculator'].mistakes} />

      <Lab heading="Interactive Integration by Parts Calculator">
        <Calculator />
      </Lab>

      <Faq items={FAQ} />
      <RelatedMethods ids={["integral","u-substitution","standard-integrals"]} />
    </MethodPage>
  );
}
